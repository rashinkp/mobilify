import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps:true,
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Skip hashing if password is empty
  if (!this.password) {
    return next();
  }
  
  // Check if password is already hashed (bcrypt hashes start with $2b$10$ or $2a$10$)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    return next(); // Password is already hashed
  }
  
  // Hash the password before saving (fallback for cases where explicit hashing wasn't used)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
})


adminSchema.methods.matchPassword = async function (enteredPassword) {
  // Import here to avoid circular dependency
  const { comparePassword } = await import('../utils/passwordHash.js');
  return await comparePassword(enteredPassword, this.password);
}


const Admin = mongoose.model('Admin', adminSchema);

export default Admin