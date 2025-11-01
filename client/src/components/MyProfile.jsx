import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "../redux/slices/userApiSlices";
import {
  Edit,
  Calendar,
  User,
  Star,
  Briefcase,
  LifeBuoyIcon,
  PhoneCallIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { errorToast, successToast } from "./toast";
import { profileValidationSchema } from "../validations/validationSchemas";
import { RotatingLines } from "react-loader-spinner";

const MyProfile = () => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { data, isLoading, isError, error } = useGetUserQuery();
  const { user } = data || {};
  const [updateUser] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      dateOfBirth: "",
      phoneNumber: "",
      bio: "",
      occupation: "",
    },
    resolver: yupResolver(profileValidationSchema),
  });

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      // Format date for date input (YYYY-MM-DD)
      if (user.dateOfBirth) {
        const date = new Date(user.dateOfBirth);
        const formattedDate = date.toISOString().split('T')[0];
        setValue("dateOfBirth", formattedDate);
      } else {
        setValue("dateOfBirth", "");
      }
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("bio", user.bio || "");
      setValue("occupation", user.occupation || "");
    }
  }, [user, setValue]);

  const onSubmit = async (formData) => {
    try {
      await updateUser(formData).unwrap();
      setIsEditingProfile(false);
      successToast("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating user:", error);
      errorToast(error?.data?.message || error?.message || "Error occurred");
      setIsEditingProfile(false);
    }
  };

  if (isError) return <div>Error: {error.message}</div>;

  if (isLoading) {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white text-gray-800">
              My Profile
            </h1>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Edit size={16} className="mr-2" />
              {isEditingProfile ? "Cancel" : "Edit"}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="mr-3 text-gray-500" size={24} />
                <div>
                  <p className="font-semibold">@{user.name}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-3 text-gray-500" size={24} />
                <p>
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="flex items-center">
                <Briefcase className="mr-3 text-gray-500" size={24} />
                <p>{user.occupation || "No occupation specified"}</p>
              </div>
              <div className="flex items-center">
                <LifeBuoyIcon className="mr-3 text-gray-500" size={24} />
                <p>{user.bio || "No bio specified"}</p>
              </div>

              <div className="flex items-center">
                <PhoneCallIcon className="mr-3 text-gray-500" size={24} />
                <p>{user.phoneNumber || "No bio specified"}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block mb-2 dark:text-white">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  maxLength={50}
                  placeholder="Enter your full name"
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onInput={(e) => {
                    // Block emojis and invalid characters in real-time
                    const value = e.target.value;
                    const sanitized = value.replace(/[^\w\s\-']/g, '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
                    if (sanitized !== value) {
                      e.target.value = sanitized;
                      setValue("name", sanitized, { shouldValidate: true });
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {watch("name")?.length || 0}/50 characters
                </p>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 dark:text-white">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be between 13 and 120 years old
                </p>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 dark:text-white">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("phoneNumber")}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onInput={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    e.target.value = value;
                    setValue("phoneNumber", value, { shouldValidate: true });
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10 digits only (e.g., 9876543210)
                </p>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 dark:text-white">Occupation</label>
                <input
                  type="text"
                  {...register("occupation")}
                  maxLength={100}
                  placeholder="Enter your occupation"
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onInput={(e) => {
                    // Block emojis in real-time
                    const value = e.target.value;
                    const sanitized = value.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
                    if (sanitized !== value) {
                      e.target.value = sanitized;
                      setValue("occupation", sanitized, { shouldValidate: true });
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {watch("occupation")?.length || 0}/100 characters (optional)
                </p>
                {errors.occupation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.occupation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 dark:text-white">Bio</label>
                <textarea
                  {...register("bio")}
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="4"
                  onInput={(e) => {
                    // Block emojis in real-time
                    const value = e.target.value;
                    const sanitized = value.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
                    if (sanitized !== value) {
                      e.target.value = sanitized;
                      setValue("bio", sanitized, { shouldValidate: true });
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {watch("bio")?.length || 0}/500 characters (optional)
                </p>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  disabled={!isDirty}
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
