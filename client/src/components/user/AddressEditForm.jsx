import React from "react";
import Form from "../Form";
import { useUpdateAddressMutation } from "../../redux/slices/addressApiSlice";
import { addressValidationSchema } from "../../validations/validationSchemas";
import { errorToast, successToast } from "../toast";

const AddressEditForm = ({ address, onClose }) => {
  const [editAddress] = useUpdateAddressMutation();
  const addressFields = [
    {
      name: "label",
      label: "Label",
      type: "text",
      placeholder: "Enter label (e.g., Home, Work)",
      required: true,
      defaultValue: address?.label || "",
      maxLength: 50,
    },
    {
      name: "street",
      label: "Street",
      type: "text",
      placeholder: "Enter street address",
      required: true,
      defaultValue: address?.street || "",
      maxLength: 200,
    },
    {
      name: "city",
      label: "City",
      type: "text",
      placeholder: "Enter city",
      required: true,
      defaultValue: address?.city || "",
      maxLength: 100,
    },
    {
      name: "state",
      label: "State",
      type: "text",
      placeholder: "Enter state",
      required: true,
      defaultValue: address?.state || "",
      maxLength: 100,
    },
    {
      name: "postalCode",
      label: "Pincode",
      type: "text",
      placeholder: "Enter 6-digit pincode",
      required: true,
      defaultValue: address?.postalCode || "",
      maxLength: 6,
      pattern: "[0-9]{6}",
      inputMode: "numeric",
    },
    {
      name: "country",
      label: "Country",
      type: "text",
      placeholder: "Enter country",
      required: true,
      defaultValue: address?.country || "",
      maxLength: 100,
    },
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (data) => {
    console.log;
    try {
      await editAddress({ addressId: address._id, data }).unwrap();
      successToast("Address updated successfully");
      onClose();
    } catch (error) {
      errorToast(
        error?.data?.message || error.message || "Failed to update address"
      );
    }
  };

  return (
    <>
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="p-6 sm:p-8">
            <Form
              title="Edit Address"
              fields={addressFields}
              onSubmit={handleSubmit}
              buttonText="Update Address"
              validationRules={addressValidationSchema}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressEditForm;
