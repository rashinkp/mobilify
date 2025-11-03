import React from "react";
import Form from "../Form";
import { getProductFields } from "../product/productFields.js";
import { productValidation } from "../../validations/validationSchemas.js";
import { useGetAllCategoryQuery } from "../../redux/slices/categoryApiSlices.js";

const ProductAddForm = ({ isModalFormOpen, onClose, onSubmit }) => {
  const { data: categories = [], isLoading } = useGetAllCategoryQuery({
    filterBy: "All",
  });

  if (!isModalFormOpen) return null;

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category._id,
  }));

  const productFields = getProductFields(categoryOptions);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  {
    isLoading && (
      <div className="h-screen w-full absolute top-0 z-50 left-0 backdrop-blur-sm bg-black/30 flex justify-center items-center">
        <RotatingLines
          visible={true}
          height="50"
          width="50"
          color="grey"
          strokeColor="#fff"
          strokeWidth="2"
          animationDuration="8"
          ariaLabel="rotating-lines-loading"
        />
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl my-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
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
            fields={productFields}
            title="Add Product"
            buttonText="Add Product"
            onSubmit={onSubmit}
            validationRules={productValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductAddForm;
