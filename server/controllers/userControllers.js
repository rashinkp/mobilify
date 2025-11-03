import asyncHandler from "express-async-handler";
import User from "../models/userSchema.js";
import generateToken from "../utils/generateToken.js";
import { OTP } from "../models/otpSchema.js";
import Referral from "../models/referralsSchema.js";
import Wallet from "../models/walletSchema.js";
import Transaction from "../models/walletTransactionSchema.js";
import { getRandomAmount } from "../utils/referralAmount.js";
import { hashPassword, comparePassword } from "../utils/passwordHash.js";



export const registerUser = asyncHandler(async (req, res) => {
  const { otp , referral } = req.body.data;
  const { id } = req.body;

  const { otpId } = await User.findById(id);

  const response = await OTP.findById(otpId);

  if (!response) {
    res.status(400).json({ message: "otp not found resend it" });
  }

  const actualOtp = response.otp;

  if (actualOtp !== otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is not matching",
    });
  }

  const user = await User.findOneAndUpdate(
    { _id: id },
    { $set: { isBlocked: false, isVerified: true } },
    { new: true }
  );

  if (referral) {
    const referredUser = await User.findOne({ referralCode: referral });

    if (!referredUser) {
      return res.status(400).json({ message: "Invalid referral code" });
    }


    const reward = getRandomAmount();
    
    // Validate reward is positive
    if (!reward || reward <= 0) {
      return res.status(400).json({ message: "Invalid referral reward amount" });
    }

    const referralData = await Referral.create({
      referrer: referredUser._id ,
      referee: id ,
      reward,
    });

    if (!referralData) {
      return res.status(400).json({ message: "Couldn't apply the coupon." });
    }

    if (referralData) {
      let refereeWallet = await Wallet.findOne({ userId: id });

      if (!refereeWallet) {
        refereeWallet = new Wallet({
          userId: id,
          balance: reward,
          currency: "INR",
        });

        await refereeWallet.save();
      } else {
        // Ensure balance never goes negative when adding reward
        refereeWallet.balance = Math.max(0, Number(refereeWallet.balance) + Number(reward));
        await refereeWallet.save();
      }

      await Transaction.create({
        walletId: refereeWallet._id,
        type: "Credit",
        userId: id,
        amount: reward,
        description: "Referral reward",
        status: "Successful",
      });

      let referrerWallet = await Wallet.findOne({ userId: referredUser._id });
      if (!referrerWallet) {
        referrerWallet = new Wallet({
          userId: referredUser._id,
          balance: reward,
          currency: "INR",
        });

        await referrerWallet.save();
      } else {
        // Ensure balance never goes negative when adding reward
        referrerWallet.balance = Math.max(0, Number(referrerWallet.balance) + Number(reward));
        await referrerWallet.save();
      }

      await Transaction.create({
        walletId: referrerWallet._id,
        type: "Credit",
        userId: referredUser._id,
        amount: reward,
        description: "Referral reward",
        status: "Successful",
      });
    }
  }
  
    if (user) {
      const updatedUser = await User.findById(id);
      generateToken(res, updatedUser._id, "user");
      await OTP.findByIdAndDelete(otpId);
      await User.findByIdAndUpdate(id, { $unset: { otpId: "" } });
      res.status(201).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(400);
      console.log("Invalid user data");
      throw new Error("Invalid user data");
    }
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  //checking if user is blocked or not

  if (!user.password) {
    return res.status(400).json({message:'This account do not have password please set password firts'})
  }
  

  // Use helper function for password comparison
  const isPasswordMatch = await comparePassword(password, user.password);
  if (isPasswordMatch) {

    // Check if user is verified (for OTP-based registration)
    // Skip verification check for users without password (Google Sign-In users)
    if (user.password && !user.isVerified) {
      return res
        .status(403)
        .json({ 
          message: "Please verify your email with OTP before logging in. Check your email for the verification code.",
          requiresVerification: true 
        });
    }

    if (user.isBlocked || !user.isActive) {
      return res
        .status(400)
        .json({ message: "This user is not availble currently" });
    }


    generateToken(res, user._id, "user");
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    console.log("Invalid user name or password");
    throw new Error("Invalid email or password");
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("user", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "User Logout Successful" });
  } catch (err) {
    console.error("Error during admin logout:", err);

    throw new Error("Failed to log out admin");
  }
});

export const signWithGoogle = asyncHandler(async (req, res) => {
  const { email, name, picture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user - Google Sign-In users are automatically verified
      user = await User.create({
        email,
        name,
        picture: {secure_url:picture},
        isVerified: true, // Google Sign-In users are verified via Google
      });
    } else {
      // Update existing user to be verified if not already
      if (!user.isVerified) {
        user = await User.findOneAndUpdate(
          { email },
          { $set: { isVerified: true } },
          { new: true }
        );
      }
    } 
    
     if (user.isBlocked || !user.isActive) {
       return res
         .status(400)
         .json({ message: "This user is not availble currently" });
     }

    generateToken(res, user._id, "user");

    res.status(201).json({
      id: user._id,
      name: user.name, 
      email: user.email, 
    });
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



export const getUser = asyncHandler(async (req, res) => {
  const { userId: id } = req.user;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findById(id);
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching the user",
      error: error.message,
    });
  }
});


export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { name, occupation, bio, phoneNumber, dateOfBirth } = req.body;


  if (!userId) {
    return res.status(400).json({ message: "User id is not found" });
  }

  // Remove the incorrect `!data` check as `data` is not defined
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update user fields only if they are provided
  if (name) user.name = name;
  if (occupation) user.occupation = occupation;
  if (bio) user.bio = bio;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;

  try {
    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated user, excluding sensitive information
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      occupation: updatedUser.occupation,
      bio: updatedUser.bio,
      phoneNumber: updatedUser.phoneNumber,
      dateOfBirth: updatedUser.dateOfBirth,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});


export const uploadProfileUrl = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const data = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  const updatedUser = await User.updateOne({ _id: userId }, { $set: { picture: data } });

  res.status(200).json({
    message: "Images updated successfully",
    product: updatedUser,
  });

}) 


export const changePassword = asyncHandler(async (req, res) => {
  const { userId } = req.user; 
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const oldPassword = user.password;

  const isMatch = await comparePassword(currentPassword, oldPassword);

  if (!isMatch) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const isSameAsOld = await comparePassword(newPassword, oldPassword);
  if (isSameAsOld) {
    return res
      .status(400)
      .json({
        error: "New password cannot be the same as the current password",
      });
  }

  // Hash the new password explicitly before saving
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});




export const forgotPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.session.email;

  if (!email) {
    return res.status(400).json({ message: "No email found in session" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Hash the password explicitly before saving
  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  await user.save();


  delete req.session.password;

  res.status(200).json({ message: "Password changed successfully" });
});
