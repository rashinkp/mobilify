import React from "react";
import Form from "../Form";
import { couponValidation } from "../../validations/validationSchemas";
import { useCategoryApi } from "../../hooks/useCategoryApi";

const CouponForm = ({ isModalFormOpen, onClose, onSubmit }) => {
  // const { categories = [], isLoading } = useCategoryApi();

  // console.log(categories)

  const couponFields = [
    {
      name: "couponId",
      label: "Coupon ID",
      type: "text",
      placeholder: "Enter unique Coupon ID",
      required: true,
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      placeholder: "Enter Coupon Title",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter Coupon Description",
      required: true,
    },
    {
      name: "discount",
      label: "Discount",
      type: "number",
      placeholder: "Enter Discount Percentage",
      required: true,
      min: 1,
    },
    {
      name: "minAmount",
      label: "Mininmu Amount",
      type: "number",
      placeholder: "Enter Mininmu Amount",
      required: true,
    },
    {
      name: "maxAmount",
      label: "Maximum Amount",
      type: "number",
      placeholder: "Enter Discount Maximum Amount",
      required: true,
    },
    {
      name: "expiryDate",
      label: "Expiry Date",
      type: "date",
      placeholder: "Select Expiry Date",
      required: true,
    },
    // {
    //   name: "applicableCategories",
    //   label: "Applicable Categories",
    //   type: "select",
    //   placeholder: "select",
    //   required: true,
    // },
  ];

  if (!isModalFormOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // if (isLoading) {
  //         return (
  //           <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
  //             <RotatingLines
  //               visible={true}
  //               height="50"
  //               width="50"
  //               color="grey"
  //               strokeColor="#fff"
  //               strokeWidth="2"
  //               animationDuration="8"
  //               ariaLabel="rotating-lines-loading"
  //             />
  //           </div>
  //         );
  //       }

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
            fields={couponFields}
            title="Add Coupon"
            buttonText="Add Coupon"
            onSubmit={onSubmit}
            validationRules={couponValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponForm;
