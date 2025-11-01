import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Star } from "lucide-react";
import { reviewSchema } from "../../validations/validationSchemas";
import {
  useGetAReviewQuery,
  usePostReviewMutation,
} from "../../redux/slices/reviewApiSlice";
import { errorToast, successToast } from "../toast";
import { RotatingLines } from "react-loader-spinner";

const ProductReviewForm = ({ order }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [postReview] = usePostReviewMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(reviewSchema),
  });

  const watchedFields = watch(["rating", "title", "description"]);

  const {
    data = {},
    isLoading,
    isError,
    refetch,
  } = useGetAReviewQuery({ productId: order.productId });

  useEffect(() => {
    if (data) {
      setReview(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (review) {
      setValue("rating", review.rating || 0);
      setValue("title", review.title || "");
      setValue("description", review.description || "");
    }
  }, [review, setValue]);

  useEffect(() => {
    if (review === null) {
      setIsFormChanged(true);
      return;
    }

    const hasChanged =
      watchedFields[0] !== review?.rating ||
      watchedFields[1] !== review?.title ||
      watchedFields[2] !== review?.description;

    setIsFormChanged(hasChanged);
  }, [watchedFields, review]);

  const onSubmit = async (data) => {
    try {
      await postReview({ data, order }).unwrap();
      successToast(review ? "Review updated successfully" : "Review posted successfully");
      setIsFormChanged(false);
      if (review) {
        refetch();
      }
    } catch (error) {
      errorToast(
        error?.message || error?.data?.message || "Error while posting review"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
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
    <div className="mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
        {review ? "Edit Your Review" : "Write a Review"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => {
                  setValue("rating", star, { shouldValidate: true });
                }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || watch("rating") || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Select your rating from 1 to 5 stars
          </p>
          {errors.rating && (
            <p className="text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        {/* Review Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            maxLength={100}
            placeholder="Summarize your review (e.g., 'Great product!' or 'Not worth it')"
            className={`w-full px-4 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.title
                ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } rounded-md focus:outline-none`}
            onInput={(e) => {
              // Block emojis and invalid characters in real-time
              const value = e.target.value;
              const sanitized = value.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
              if (sanitized !== value) {
                e.target.value = sanitized;
                setValue("title", sanitized, { shouldValidate: true });
              }
            }}
          />
          <p className="text-xs text-gray-500">
            {watch("title")?.length || 0}/100 characters (minimum 5)
          </p>
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Review Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Review Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            {...register("description")}
            maxLength={1000}
            rows={6}
            className={`w-full px-4 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.description
                ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } rounded-md focus:outline-none resize-none`}
            placeholder="Share your detailed experience with this product. What did you like? What didn't you like? (minimum 20 characters)"
            onInput={(e) => {
              // Block emojis in real-time
              const value = e.target.value;
              const sanitized = value.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
              if (sanitized !== value) {
                e.target.value = sanitized;
                setValue("description", sanitized, { shouldValidate: true });
              }
            }}
          />
          <p className="text-xs text-gray-500">
            {watch("description")?.length || 0}/1000 characters (minimum 20)
          </p>
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="max-w-lg bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!isFormChanged}
        >
          {review ? "Update Review" : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm;
