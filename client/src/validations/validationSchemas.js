import * as Yup from "yup";

// Helper function to detect emojis and special unicode characters
const hasEmoji = (value) => {
  if (!value) return false;
  // Comprehensive emoji regex pattern
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]|[\u{203C}-\u{3299}]/gu;
  return emojiRegex.test(value);
};

// Helper function to check for only alphanumeric and basic characters (no emojis, no special unicode)
const isBasicText = (value) => {
  if (!value) return true;
  // Allow letters, numbers, spaces, and basic punctuation
  const basicTextRegex = /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=:;"'<>\[\]{}|\\\/`~]*$/;
  return basicTextRegex.test(value) && !hasEmoji(value);
};

export const emailValidation = Yup.string()
  .email("Invalid email format")
  .required("Email is required")
  .test(
    "no-emoji",
    "Email cannot contain emojis or special characters",
    (value) => !hasEmoji(value) && isBasicText(value)
  )
  .test(
    "valid-email-chars",
    "Email contains invalid characters",
    (value) => {
      if (!value) return true;
      // Standard email regex without emojis
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) && !hasEmoji(value);
    }
  );

export const emailForm = Yup.object().shape({
  email: emailValidation
})

export const passwordValidation = Yup.string()
  .required("Password is required")
  .min(6, "Password must be at least 6 characters")
  .test(
    "no-emoji",
    "Password cannot contain emojis",
    (value) => !hasEmoji(value)
  )
  .test(
    "valid-password-chars",
    "Password contains invalid characters",
    (value) => {
      if (!value) return true;
      // Allow letters, numbers, and common special characters
      const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/;
      return passwordRegex.test(value) && !hasEmoji(value);
    }
  );

export const nameValidation = Yup.string()
  .required("Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(20, "Name must not exceed 20 characters")
  .test(
    "no-only-whitespace", 
    "Name cannot contain only white spaces", 
    (value) => value && value.trim().length > 0 
  )
  .test(
    "no-emoji",
    "Name cannot contain emojis",
    (value) => !hasEmoji(value)
  )
  .test(
    "valid-name-chars",
    "Name can only contain letters, numbers, spaces, hyphens, and apostrophes",
    (value) => {
      if (!value) return true;
      // Allow letters, numbers, spaces, hyphens, and apostrophes
      const nameRegex = /^[a-zA-Z0-9\s\-']*$/;
      return nameRegex.test(value) && !hasEmoji(value);
    }
  );

export const descriptionValidation = Yup.string()
  .required("Description is required")
  .min(10, "Minimum 10 characters required")
  .max(500, "Maximum 500 characters allowed");

export const signUpValidationSchema = Yup.object().shape({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .test(
      "no-emoji",
      "Password cannot contain emojis",
      (value) => !hasEmoji(value)
    ),
});

export const loginValidationSchema = Yup.object().shape({
  email: emailValidation,
  password: passwordValidation,
});

export const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^[0-9]+$/, "OTP must contain only numbers")
    .length(6, "OTP must be exactly 6 digits")
    .test(
      "no-emoji",
      "OTP cannot contain emojis",
      (value) => !hasEmoji(value)
    ),
  referral: Yup.string()
    .nullable()
    .test(
      "no-emoji",
      "Referral code cannot contain emojis",
      (value) => !value || !hasEmoji(value)
    )
    .test(
      "valid-referral-chars",
      "Referral code can only contain letters, numbers, hyphens, and underscores",
      (value) => {
        if (!value) return true;
        const referralRegex = /^[a-zA-Z0-9_-]*$/;
        return referralRegex.test(value) && !hasEmoji(value);
      }
    )
    .max(20, "Referral code must not exceed 20 characters"),
});

export const brandValidationSchema = Yup.object().shape({
  name: nameValidation,
  description: descriptionValidation,
  website: Yup.string()
    .required("Website URL is required")
    .url("Must be a valid URL"),
});

export const categoryValidation = Yup.object().shape({
  name: nameValidation,
  description: descriptionValidation,
  offer: Yup.number()
    .nullable()
    .typeError("Offer Percent must be a number")
    .required("Offer Percent is required")
    .min(0, "Offer Percent cannot be negative")
    .max(100, "Offer Percent cannot exceed 100%"),
});

// Reusable transformation function
const transformNumberField = (value, originalValue) => {
  if (typeof originalValue === "string") {
    return originalValue.trim() === "" ? null : Number(originalValue);
  }
  return originalValue;
};

// Validation schema
export const productValidation = Yup.object().shape({
  name: Yup.string()
    .required("Product Name is required")
    .min(4, "Product Name must be at least 4 characters")
    .max(100, "Product Name can be at most 100 characters")
    .matches(
      /^[A-Za-z0-9\s]+$/,
      "Product Name can only contain letters, numbers, and spaces"
    ),

  description: Yup.string()
    .required("Product Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description can be at most 500 characters"),

  offerPercent: Yup.number()
    .transform(transformNumberField)
    .nullable()
    .typeError("Offer Percent must be a number")
    .required("Offer Percent is required")
    .min(0, "Offer Percent cannot be negative")
    .max(100, "Offer Percent cannot exceed 100%"),

  returnPolicy: Yup.string().required("return policy is required"),

  warranty: Yup.string()
    .required("Warranty is required")
    .matches(
      /^[0-9]+( months| years)$/,
      "Warranty must be in the format of 'x months' or 'x years'"
    ),

  model: Yup.string().required("Model is required"),

  size: Yup.string()
    .required("Size is required")
    .matches(
      /^[0-9.]+ (inches|cm)$/,
      "Size must be in the format of 'x inches' or 'x cm'"
    ),

  network: Yup.string()
    .required("Network is required")
    .matches(
      /^(2G|3G|4G|5G|6G)$/,
      "Network must be one of '2G', '3G', '4G','5G', or '6G'"
    ),

  price: Yup.number()
    .transform(transformNumberField)
    .nullable()
    .required("Price is required")
    .min(0, "Price cannot be negative"),

  storage: Yup.number()
    .transform(transformNumberField)
    .nullable()
    .required("Storage is required")
    .min(12, "Storage cannot be less than 12GB")
    .max(10000, "Storage cannot exceed 10TB"),

  ram: Yup.number()
    .transform(transformNumberField)
    .nullable()
    .required("RAM is required")
    .min(1, "RAM cannot be less than 1GB")
    .max(128, "RAM cannot exceed 128GB"),

  stock: Yup.number()
    .transform(transformNumberField)
    .nullable()
    .required("Stock is required")
    .min(0, "Stock cannot be negative")
    .max(10000, "Stock cannot exceed 10,000"),

  COD: Yup.string().required("COD is required"),
});

export const imageValidationSchema = Yup.object().shape({
  file: Yup.mixed()
    .required("An image file is required")
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, and SVG files are allowed",
      (value) => {
        if (!value) return false;
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/svg+xml",
          "image/webp",
        ];
        return allowedTypes.includes(value.type);
      }
    )
    .test("fileSize", "File size should not exceed 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB size limit
    }),
});


export const addressValidationSchema = Yup.object().shape({
  label: Yup.string()
    .required("Label is required")
    .min(2, "Label must be at least 2 characters")
    .max(50, "Label must not exceed 50 characters")
    .test(
      "no-only-whitespace",
      "Label cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "Label cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-chars",
      "Label can only contain letters, numbers, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const labelRegex = /^[a-zA-Z0-9\s\-']*$/;
        return labelRegex.test(value) && !hasEmoji(value);
      }
    ),
  street: Yup.string()
    .required("Street address is required")
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must not exceed 200 characters")
    .test(
      "no-only-whitespace",
      "Street address cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "Street address cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-chars",
      "Street address can only contain letters, numbers, spaces, and basic punctuation",
      (value) => {
        if (!value) return true;
        const streetRegex = /^[a-zA-Z0-9\s\-.,'#/]*$/;
        return streetRegex.test(value) && !hasEmoji(value);
      }
    ),
  city: Yup.string()
    .required("City is required")
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters")
    .test(
      "no-only-whitespace",
      "City cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "City cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-chars",
      "City can only contain letters, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const cityRegex = /^[a-zA-Z\s\-']*$/;
        return cityRegex.test(value) && !hasEmoji(value);
      }
    ),
  state: Yup.string()
    .required("State is required")
    .min(2, "State must be at least 2 characters")
    .max(100, "State must not exceed 100 characters")
    .test(
      "no-only-whitespace",
      "State cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "State cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-chars",
      "State can only contain letters, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const stateRegex = /^[a-zA-Z\s\-']*$/;
        return stateRegex.test(value) && !hasEmoji(value);
      }
    ),
  postalCode: Yup.string()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
    .test(
      "no-emoji",
      "Pincode cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "no-spaces",
      "Pincode cannot contain spaces",
      (value) => value && !value.includes(" ")
    ),
  country: Yup.string()
    .required("Country is required")
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters")
    .test(
      "no-only-whitespace",
      "Country cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "Country cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-chars",
      "Country can only contain letters, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const countryRegex = /^[a-zA-Z\s\-']*$/;
        return countryRegex.test(value) && !hasEmoji(value);
      }
    ),
});

export const profileValidationSchema = Yup.object().shape({
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .test(
      "minimum-age",
      "You must be at least 13 years old",
      function (value) {
        if (!value) return true;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
          ? age - 1 
          : age;
        
        return actualAge >= 13;
      }
    )
    .test(
      "maximum-age",
      "Please enter a valid date of birth",
      function (value) {
        if (!value) return true;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
          ? age - 1 
          : age;
        
        return actualAge <= 120;
      }
    )
    .typeError("Please enter a valid date"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .test(
      "no-emoji",
      "Phone number cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "no-spaces",
      "Phone number cannot contain spaces",
      (value) => value && !value.includes(" ")
    )
    .test(
      "no-special-chars",
      "Phone number must contain only digits",
      (value) => {
        if (!value) return true;
        return /^[0-9]+$/.test(value);
      }
    ),
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .test(
      "no-only-whitespace",
      "Name cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    )
    .test(
      "no-emoji",
      "Name cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-name-chars",
      "Name can only contain letters, numbers, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const nameRegex = /^[a-zA-Z0-9\s\-']*$/;
        return nameRegex.test(value) && !hasEmoji(value);
      }
    ),
  bio: Yup.string()
    .max(500, "Bio must not exceed 500 characters")
    .nullable()
    .test(
      "no-emoji",
      "Bio cannot contain emojis",
      (value) => !value || !hasEmoji(value)
    )
    .test(
      "valid-bio-chars",
      "Bio contains invalid characters",
      (value) => {
        if (!value) return true;
        // Allow letters, numbers, spaces, and basic punctuation for bio
        const bioRegex = /^[a-zA-Z0-9\s\-.,!?@#$%^&*()+=:;"'<>\[\]{}|\\\/`~]*$/;
        return bioRegex.test(value) && !hasEmoji(value);
      }
    ),
  occupation: Yup.string()
    .max(100, "Occupation must not exceed 100 characters")
    .nullable()
    .test(
      "no-only-whitespace",
      "Occupation cannot contain only white spaces",
      (value) => !value || value.trim().length > 0
    )
    .test(
      "no-emoji",
      "Occupation cannot contain emojis",
      (value) => !value || !hasEmoji(value)
    )
    .test(
      "valid-occupation-chars",
      "Occupation can only contain letters, numbers, spaces, hyphens, and apostrophes",
      (value) => {
        if (!value) return true;
        const occupationRegex = /^[a-zA-Z0-9\s\-.,'&()]*$/;
        return occupationRegex.test(value) && !hasEmoji(value);
      }
    ),
});


export const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .required("Current password is required")
      .test(
        "no-emoji",
        "Password cannot contain emojis",
        (value) => !hasEmoji(value)
      ),
    newPassword: Yup
      .string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters")
      .test(
        "no-emoji",
        "Password cannot contain emojis",
        (value) => !hasEmoji(value)
      )
      .test(
        "valid-password-chars",
        "Password contains invalid characters",
        (value) => {
          if (!value) return true;
          const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/;
          return passwordRegex.test(value) && !hasEmoji(value);
        }
      )
      .notOneOf(
        [Yup.ref("currentPassword")],
        "New password must be different from current password"
      ),
    confirmNewPassword: Yup
      .string()
      .required("Please confirm your new password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .test(
        "no-emoji",
        "Password cannot contain emojis",
        (value) => !hasEmoji(value)
      ),
});
  

export const passwordSchemaWithoutCurr = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .test(
      "no-emoji",
      "Password cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-password-chars",
      "Password contains invalid characters",
      (value) => {
        if (!value) return true;
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/;
        return passwordRegex.test(value) && !hasEmoji(value);
      }
    ),
  confirmNewPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .test(
      "no-emoji",
      "Password cannot contain emojis",
      (value) => !hasEmoji(value)
    ),
});


export const couponValidation = Yup.object().shape({
  couponId: Yup.string()
    .required("Coupon ID is required")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Coupon ID can only contain letters, numbers, underscores, and dashes"
    ),
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title must be less than 100 characters")
    .test(
      "no-only-whitespace",
      "Name cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    ),
  minAmount: Yup.number()
    .required("Minimum amount is required")
    .min(100, "Minimum amount must be at least 100")
    .max(10000, "Minimum amount cannot exceed 10000"),
  maxAmount: Yup.number()
    .required("Maximum amount is required")
    .min(
      Yup.ref("minAmount"),
      "Maximum amount must be greater than or equal to the minimum amount"
    )
    .max(1000000, "Maximum amount cannot exceed 10000"),
  description: Yup.string()
    .required("Description is required")
    .max(500, "Description must be less than 500 characters")
    .test(
      "no-only-whitespace",
      "Name cannot contain only white spaces",
      (value) => value && value.trim().length > 0
    ),
  discount: Yup.number()
    .required("Discount is required")
    .min(1, "Discount must be at least 1")
    .max(100, "Discount cannot exceed 100"),
  expiryDate: Yup.date()
    .required("Expiry date is required")
    .min(new Date(), "Expiry date must be in the future"),
});

//review related validations

export const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, "Please select a rating")
    .max(5, "Invalid rating")
    .required("Rating is required")
    .integer("Rating must be a whole number")
    .typeError("Rating must be a number"),
  title: Yup.string()
    .required("Review title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters")
    .test(
      "no-only-whitespace",
      "Title cannot contain only white spaces",
      (value) => value && value.trim().length >= 5
    )
    .test(
      "no-emoji",
      "Title cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-title-chars",
      "Title contains invalid characters",
      (value) => {
        if (!value) return true;
        // Allow letters, numbers, spaces, and basic punctuation for review titles
        const titleRegex = /^[a-zA-Z0-9\s\-.,!?'"():]*$/;
        return titleRegex.test(value) && !hasEmoji(value);
      }
    ),
  description: Yup.string()
    .required("Review description is required")
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .test(
      "no-only-whitespace",
      "Description cannot contain only white spaces",
      (value) => value && value.trim().length >= 20
    )
    .test(
      "no-emoji",
      "Description cannot contain emojis",
      (value) => !hasEmoji(value)
    )
    .test(
      "valid-description-chars",
      "Description contains invalid characters",
      (value) => {
        if (!value) return true;
        // Allow letters, numbers, spaces, and extended punctuation for reviews
        const descRegex = /^[a-zA-Z0-9\s\-.,!?@#$%^&*()+=:;"'<>\[\]{}|\\\/`~]*$/;
        return descRegex.test(value) && !hasEmoji(value);
      }
    ),
});