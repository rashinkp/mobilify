import asyncHandler from "express-async-handler";
import Order from "../models/orderSchema.js";
import Cart from "../models/cartSchema.js";
import mongoose from "mongoose";
import Product from "../models/productSchema.js";
import Payment from "../models/paymentSchema.js";
import Coupon from "../models/couponSchema.js";
import Wallet from "../models/walletSchema.js";
import Transaction from "../models/walletTransactionSchema.js";
import FailedOrder from "../models/failedOrders.js";

export const addOrder = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const data = req.body;

  if (!userId || !data || !data.orderItems) {
    return res.status(400).json({
      message: "Required inputs missing, please try again",
    });
  }

  try {
    const {
      orderItems,
      shippingAddress,
      shipping,
      paymentMethod,
      couponCode,
      total,
      paymentId,
    } = data;

    if (paymentMethod === "Cash On Delivery" && total > 120000) {
      return res
        .status(400)
        .json({
          message:
            "Cash on delivery is not available for total more than 1.2 Lack rs.",
        });
    }
    // Check stock availability first
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });
      }
    }

    // Validate payment
    const payment = await Payment.findOne({ paymentId });

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ couponId: couponCode });

      if (!coupon) {
        return res.status(404).json({ message: "No such coupon found" });
      }

      coupon.usersTaken.push(userId);

      await coupon.save();
    }

    const paymentStatus = paymentMethod === "Wallet" && "Successful";

    const orderDocuments = orderItems.map((item) => ({
      userId: userId,
      productId: item.productId,
      name: item.name,
      model: item.model,
      price: item?.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      returnPolicy: item.returnPolicy,
      shipping: shipping,
      shippingCost: shipping?.price || 0,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      offerPrice: item.offerPrice,
      couponApplied: {
        couponCode: item?.coupon?.couponCode,
        offerAmount: item?.coupon?.couponDiscount,
      },
      status: "Order placed",
      paymentId: paymentId || null,
      paymentStatus: paymentStatus || payment?.status || "Pending",
    }));

    const createdOrders = await Order.insertMany(orderDocuments);

    //adding user data in coupon

    // Update stock for each product
    for (const item of orderDocuments) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear cart - Convert userId to ObjectId for consistency
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: userObjectId });

    if (cart) {
      cart.cartItems = [];
      await cart.save();
      console.log("Cart cleared successfully for user:", userId);
    } else {
      console.log("No cart found for user:", userId);
    }

    res.status(201).json({
      message:
        paymentMethod === "Razorpay"
          ? "Orders placed successfully with Razorpay"
          : "Orders placed successfully with Cash on Delivery",
      orderIds: createdOrders.map((order) => order._id),
      total,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
});

export const getOrder = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id: orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, userId: userId });
  const failedOrder = await FailedOrder.findOne({
    _id: orderId,
    userId: userId,
  });

  console.log(failedOrder);

  if (!order && !failedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json(order || failedOrder);
});

export const getAOrder = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json(order);
});

export const getAllOrdersWithEachProducts = async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const convertedUserId = new mongoose.Types.ObjectId(userId);

  try {
    // First, get total count
    const totalCount = await Order.countDocuments({ userId: convertedUserId });

    // Then get paginated orders
    const orders = await Order.aggregate([
      {
        $match: { userId: convertedUserId },
      },
      {
        $unionWith: {
          coll: "failedorders",
          pipeline: [{ $match: { userId: convertedUserId } }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const hasMore = page * limit < totalCount;

    return res.status(200).json({
      orders,
      hasMore,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


export const getOrdersWithSingleProducts = async (req, res) => {
  const { userId } = req.user;
  const { ordId: orderId } = req.params;

  const convertedUserId = new mongoose.Types.ObjectId(userId);
  const convertedOrderId = new mongoose.Types.ObjectId(orderId);

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          userId: convertedUserId,
          _id: convertedOrderId,
        },
      },
    ]);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching order found for this product" });
    }

    return res.status(200).json(orders[0]);
  } catch (error) {
    console.error("Error fetching single order with product:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const totalCount = await Order.countDocuments();

    return res.status(200).json({ orders, totalCount });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

async function restoreStock(order) {
  try {
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock += Number(order.quantity);
      await product.save();
      console.log(`Stock restored for product ${product.name}: +${order.quantity} units`);
    } else {
      console.error(`Product not found for order: ${order.productId}`);
    }
  } catch (error) {
    console.error("Error restoring stock:", error);
  }
}

async function handleRefund(order, previousPaymentStatus, currentStatus) {
  if (!isNewRefundEligible(order, previousPaymentStatus, currentStatus)) {
    return;
  }

  // Calculate total refund amount (product price * quantity + shipping cost)
  const productAmount = Number(order.price) * Number(order.quantity);
  const shippingAmount = Number(order.shippingCost) || Number(order.shipping?.price) || 0;
  const refundAmount = productAmount + shippingAmount;

  // Skip refund for Cash on Delivery if payment was not successful
  if (order.paymentMethod === "Cash On Delivery" && previousPaymentStatus !== "Successful") {
    console.log("COD order cancelled - no refund needed");
    return;
  }

  const wallet = await Wallet.findOne({ userId: order.userId });

  if (!wallet) {
    const newWallet = await Wallet.create({
      userId: order.userId,
      balance: Number(refundAmount),
    });
    
    await Transaction.create({
      walletId: newWallet._id,
      userId: order.userId,
      type: "Credit",
      amount: refundAmount,
      description: `Refund for ${currentStatus === "Cancelled" ? "cancelled" : "returned"} order`,
      status: "Successful",
    });
  } else {
    wallet.balance = Number(wallet.balance) + Number(refundAmount);
    await wallet.save();
    
    await Transaction.create({
      walletId: wallet._id,
      userId: order.userId,
      type: "Credit",
      amount: refundAmount,
      description: `Refund for ${currentStatus === "Cancelled" ? "cancelled" : "returned"} order`,
      status: "Successful",
    });
  }

  console.log(`Refund processed: ₹${refundAmount} (Product: ₹${productAmount}, Shipping: ₹${shippingAmount})`);
}

function isNewRefundEligible(order, previousPaymentStatus, currentStatus) {
  return (
    (currentStatus === "Cancelled" || currentStatus === "Returned") &&
    previousPaymentStatus !== "Refunded" &&
    (previousPaymentStatus === "Successful" || order.paymentMethod !== "Cash On Delivery")
  );
}

export const updateOrderStatus = async (req, res) => {
  try {
    let {
      newStatus = "",
      newPaymentStatus = "",
      orderId,
      paymentId,
      orderData,
    } = req.body;

    const { userId } = req.user;

    

    let order;


    if (newStatus === "Pending") {
      const currentDate = new Date();
      const expectedDeliveryDate = new Date(currentDate);
      expectedDeliveryDate.setDate(currentDate.getDate() + 7);
      orderData.paymentStatus = "Successful";
      orderData.status = 'Order placed'
      orderData.orderDate = currentDate;
      orderData.expectedDeliveryDate = expectedDeliveryDate;
      newStatus = orderData.status;
      order = await Order.create({
        ...orderData,
      });


      console.log(order);

      if (orderData.orderNumber) {
        await FailedOrder.findOneAndDelete({
          orderNumber: orderData.orderNumber,
        });
      }
    } else {
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
    }

    const previousPaymentStatus = order.paymentStatus;
    const previousStatus = order.status;

    order.status = newStatus || order.status;
    order.paymentStatus = newPaymentStatus || order.paymentStatus;
    order.paymentId = paymentId || order.paymentId;

    if (order.status === "Delivered") {
      order.paymentStatus = "Successful";
      order.deliveryDate = new Date(); 
      if (order.returnPolicy) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 7);
        order.returnWithinDate = currentDate; 
      } else {
        order.returnWithinDate = null;
      }
    }

    // Restore stock when order is cancelled or returned
    // Only restore if status is changing TO cancelled/returned (not already cancelled/returned)
    if (
      (newStatus === "Cancelled" || newStatus === "Returned") &&
      previousStatus !== "Cancelled" &&
      previousStatus !== "Returned"
    ) {
      await restoreStock(order);
    }

    // Handle refund process - set payment status to Refunded for cancelled/returned orders that were paid
    if (
      (newStatus === "Cancelled" || newStatus === "Returned") &&
      previousPaymentStatus !== "Refunded"
    ) {
      // Only refund if payment was successful or not COD
      if (previousPaymentStatus === "Successful" || order.paymentMethod !== "Cash On Delivery") {
        order.paymentStatus = "Refunded";
      } else if (order.paymentMethod === "Cash On Delivery") {
        // COD orders don't need refund if payment wasn't successful
        order.paymentStatus = previousPaymentStatus;
      }
    }

    // Handle refund process (adds money to wallet)
    await handleRefund(order, previousPaymentStatus, newStatus || order.status);

    // Validate refund status - if order is not cancelled/returned but payment is refunded, reset it
    if (
      order.paymentStatus === "Refunded" &&
      order.status !== "Cancelled" &&
      order.status !== "Returned"
    ) {
      order.paymentStatus = previousPaymentStatus || "Pending";
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};



export const orderDetails = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    { $group: { _id: null, totalCount: { $sum: "$quantity" } } },
  ]);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const ordersToday = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    { $count: "totalCount" },
  ]);

  res.status(200).json({
    totalOrders: orders[0]?.totalCount || 0, 
    ordersToday: ordersToday[0]?.totalCount || 0, 
  });
});



export const averageOrderValue = asyncHandler(async (req, res) => {
  const averageOrder = await Order.aggregate([
    {
      $group: {
        _id: null, // Group all orders together
        averageValue: { $avg: "$price" }, // Calculate the average of the 'totalPrice' field
      },
    },
  ]);

  res.status(200).json({
    averageOrderValue: averageOrder[0]?.averageValue || 0, // Return 0 if no orders exist
  });
});