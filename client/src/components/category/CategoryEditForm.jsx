import React from "react";
import Form from "../Form.jsx";
import { categoryValidation } from "../../validations/validationSchemas.js";
import { useEditCategoryMutation } from "../../redux/slices/categoryApiSlices.js";
import { errorToast, successToast } from "../toast/index.js";

const CategoryEditForm = ({ category, onClose }) => {
  const [editCategory] = useEditCategoryMutation();
  const categoryFields = [
    {
      name: "name",
      label: "Category Name",
      type: "text",
      placeholder: "Enter category name",
      required: true,
      defaultValue: category?.name || "",
    },
    {
      name: "offer",
      label: "Offer Percentage",
      type: "number",
      placeholder: "Enter category offer percentage",
      required: true,
      defaultValue: category?.offer || "",
    },
    {
      name: "description",
      label: "Category Description",
      type: "text",
      placeholder: "Enter category description",
      required: true,
      defaultValue: category?.description || "",
    },
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (data) => {
    try {
      await editCategory({ categoryId: category._id, data }).unwrap();
      successToast("Category updated successfully");
      onClose();
    } catch (error) {
      errorToast(
        error?.data?.message || error.message || "Failed to update category"
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
            title="Edit Category"
            fields={categoryFields}
            onSubmit={handleSubmit}
            buttonText="Update Category"
            validationRules={categoryValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryEditForm;
