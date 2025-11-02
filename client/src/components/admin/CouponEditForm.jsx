import React from "react";
import Form from "../Form.jsx";
import { couponValidation } from "../../validations/validationSchemas.js"; // Add a validation schema for coupons
import { useEditCouponMutation } from "../../redux/slices/couponApiSlice.js";
import { errorToast, successToast } from "../toast/index.js";

const CouponEditForm = ({ coupon, onClose }) => {
  const [editCoupon] = useEditCouponMutation();

  const couponFields = [
    {
      name: "couponId",
      label: "Coupon Code",
      type: "text",
      placeholder: "Enter coupon code",
      required: true,
      defaultValue: coupon?.couponId || "",
    },
    {
      name: "discount",
      label: "Discount (%)",
      type: "number",
      placeholder: "Enter discount percentage",
      required: true,
      defaultValue: coupon?.discount || "",
      min: 1,
      max: 100,
    },
    {
      name: "minAmount",
      label: "Mininmu Amount",
      type: "number",
      placeholder: "Enter Mininmu Amount",
      required: true,
      defaultValue: coupon?.minAmount,
    },
    {
      name: "maxAmount",
      label: "Maximum Amount",
      type: "number",
      placeholder: "Enter Discount Maximum Amount",
      required: true,
      defaultValue: coupon?.maxAmount,
    },
    {
      name: "expiryDate",
      label: "Expiry Date",
      type: "date",
      placeholder: "Select expiry date",
      required: true,
      defaultValue: coupon?.expiryDate
        ? new Date(coupon.expiryDate).toISOString().split("T")[0]
        : "",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter a description",
      required: false,
      defaultValue: coupon?.description || "",
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      placeholder: "Enter a title",
      required: false,
      defaultValue: coupon?.title || "",
    },
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (data) => {
    console.log(data);
    try {
      await editCoupon({ _id: coupon._id, data }).unwrap();
      successToast("Coupon updated successfully");
      onClose();
    } catch (error) {
      errorToast(
        error?.data?.message || error.message || "Failed to update coupon"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl my-8 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 bg-white dark:bg-gray-800 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6 sm:p-8">
          <Form
            title="Edit Coupon"
            fields={couponFields}
            onSubmit={handleSubmit}
            buttonText="Update Coupon"
            validationRules={couponValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponEditForm;
