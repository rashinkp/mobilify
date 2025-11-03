import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema(
  {
    referralCode: {
        type: String,
        unique: true, 
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    interest: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    occupation: {
      type: String,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: Object,
    },
    otpId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    addresses: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: mongoose.Types.ObjectId,
        },
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true },
        label: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  // Only hash password if it was modified and is not empty
  if (!this.isModified('password')) {
    return next(); // Skip hashing if password wasn't modified
  }
  
  // Skip hashing if password is empty (e.g., Google Sign-In users)
  if (!this.password) {
    return next();
  }
  
  // Check if password is already hashed (bcrypt hashes start with $2b$10$ or $2a$10$)
  // If it's already hashed, skip hashing (passwords should be hashed explicitly before saving)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    return next(); // Password is already hashed
  }
  
  // Hash the password before saving (fallback for cases where explicit hashing wasn't used)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); 
})



userSchema.methods.matchPassword = async function (enteredPassword) {
  // Import here to avoid circular dependency
  const { comparePassword } = await import('../utils/passwordHash.js');
  return await comparePassword(enteredPassword, this.password);
}


const User = mongoose.model('User', userSchema);

export default User