import expressAsyncHandler from "express-async-handler";
import Payment from "../models/paymentSchema.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: "rzp_test_K5otU6Q5C8lSi8",
  key_secret: "kA9UF0UuzcJRFvCrRAb35bQb",
});

// Function to save payment details in database
export const savePayment = async (paymentData) => {
  try {
    const payment = new Payment(paymentData);
    await payment.save();
    return payment;
  } catch (error) {
    console.error("Error saving payment:", error);
    throw new Error("Error saving payment");
  }
};

export const verifyPayment = expressAsyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  try {
    // Fetch payment details from Razorpay
    let payment = await razorpay.payments.fetch(paymentId);

    // Check if payment exists
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is authorized but not captured, capture it
    if (!payment.captured && payment.status === "authorized") {
      try {
        // Capture the payment with the full amount
        payment = await razorpay.payments.capture(paymentId, payment.amount);
        console.log("Payment captured successfully:", paymentId);
      } catch (captureError) {
        console.error("Error capturing payment:", captureError);
        return res.status(400).json({
          success: false,
          message: "Payment capture failed. Please try again.",
          error: captureError.message || "Failed to capture payment",
        });
      }
    }

    // Check if payment is captured now
    if (!payment.captured) {
      return res.status(400).json({
        success: false,
        message: "Payment not captured. Please try again.",
        paymentStatus: payment.status,
      });
    }

    // Check payment status - only "captured" status means successful payment
    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment ${payment.status}. Only captured payments are accepted.`,
        paymentStatus: payment.status,
      });
    }

    // Check if payment already exists in database to avoid duplicates
    let existingPayment = await Payment.findOne({ paymentId });
    
    if (!existingPayment) {
      // Save payment details with correct status
      await savePayment({
        paymentId,
        amount: payment.amount,
        status: "Successful", // Payment is captured and successful
        method: payment.method,
        timestamp: new Date(),
        paymentGateway: "Razorpay",
      });
    } else if (existingPayment.status !== "Successful") {
      // Update existing payment status if it was not successful
      existingPayment.status = "Successful";
      await existingPayment.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and captured successfully",
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});
