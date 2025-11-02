// src/config/cloudinaryConfig.js
export const CLOUDINARY_UPLOAD_PRESET = "Mobilify";
export const CLOUDINARY_CLOUD_NAME = "dxogdfuse";
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (image) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // Check if upload was successful
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
    }

    // Return the data with secure_url and public_id
    if (!data.secure_url || !data.public_id) {
      throw new Error("Invalid response from Cloudinary");
    }

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
