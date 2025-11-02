import otpGenerator from "otp-generator";
import { OTP } from "../models/otpSchema.js";
import User from "../models/userSchema.js";
import asyncHandler from "express-async-handler";

export const sendOTP = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const checkUserPresent = await User.findOne({ email });
    
    // If user exists and is verified, they should login instead
    if (checkUserPresent && checkUserPresent.isVerified) {
      return res.status(401).json({
        success: false,
        message: "User is already registered. Please login instead.",
      });
    }

    // Generate new OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { otp, email };
    const otpBody = await OTP.create(otpPayload);

    const otpId = otpBody._id;

    let user;
    let userId;

    // If user exists but is not verified, update their info and OTP
    if (checkUserPresent && !checkUserPresent.isVerified) {
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name,
            password,
            otpId,
            isBlocked: true,
            isVerified: false,
          },
        },
        { new: true }
      );
      userId = user._id;
    } else {
      // Create new user if they don't exist
      user = await User.create({
        name,
        email,
        password,
        otpId,
        isBlocked: true,
        isVerified: false,
      });
      userId = user._id;
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};



export const sendOTPToEmail = async (req, res) => {
  try {
    const { email, forEmailVerification } = req.body;


    req.session.email = email;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    // If sending OTP for email verification, check if user is already verified
    if (forEmailVerification && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { otp, email };
    const otpBody = await OTP.create(otpPayload);

    const otpId = otpBody._id;

    user.otpId = otpId;

    await user.save();

    const userId = user._id;

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};




export const resendOTP = asyncHandler(async (req, res) => {
  const { id:userId } = req.body;

  console.log(userId)

  if (!userId) {
    return res.status(400).json({ message: "No userid found pealease login again" });
  }

  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const { email } = await User.findById(userId);


    const otpPayload = { otp, email };
    const otpBody = await OTP.create(otpPayload);


    const otpId = otpBody._id;

    const updatedUser = await User.findByIdAndUpdate(userId , { $set: { otpId: otpId } })


    
    
    console.log(updatedUser);

    res.status(200).json({
      success: true,
      message: "OTP resend successfully",
      otpId,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});


export const verifyOtp = async (req, res) => {
  try {
    const { otp, isEmailVerification } = req.body;

    const otpRecord = await OTP.findOne({ otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const { email } = otpRecord;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (isEmailVerification && !user.isVerified) {
      user.isVerified = true;
      user.isBlocked = false; 
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: isEmailVerification 
        ? "Email verified successfully. You can now login." 
        : "OTP verified successfully",
      email,
      userId: user._id,
      isVerified: user.isVerified,
    });

    await OTP.deleteOne({ _id: otpRecord._id });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const resendOtpEamil = asyncHandler(async (req, res) => {
  const email = req.session.email;
  
  if (!email) {
    return res.status(404).json({message:'email not found please enter email again'})
  }

  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }


    const otpPayload = { otp, email };
    const otpBody = await OTP.create(otpPayload);

    const otpId = otpBody._id;

    // Update user's otpId with the new OTP
    const user = await User.findOne({ email });
    if (user) {
      user.otpId = otpId;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "OTP resend successfully",
      otpId,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
})

// Get OTP time remaining for registration (by userId)
export const getOtpTimeRemaining = asyncHandler(async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpId) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
        timeRemaining: 0,
      });
    }

    const otpRecord = await OTP.findById(user.otpId);
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
        timeRemaining: 0,
      });
    }

    // OTP expires in 5 minutes (300 seconds)
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const createdAt = new Date(otpRecord.createdAt);
    const now = new Date();
    const elapsed = now - createdAt;
    const timeRemaining = Math.max(0, Math.floor((expirationTime - elapsed) / 1000)); // Convert to seconds

    res.status(200).json({
      success: true,
      timeRemaining,
      expiresAt: new Date(createdAt.getTime() + expirationTime),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get OTP time remaining for forgot password (by email from session)
export const getOtpTimeRemainingByEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.session.email;

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found in session",
        timeRemaining: 0,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        timeRemaining: 0,
      });
    }

    if (!user.otpId) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
        timeRemaining: 0,
      });
    }

    const otpRecord = await OTP.findById(user.otpId);
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
        timeRemaining: 0,
      });
    }

    // OTP expires in 5 minutes (300 seconds)
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const createdAt = new Date(otpRecord.createdAt);
    const now = new Date();
    const elapsed = now - createdAt;
    const timeRemaining = Math.max(0, Math.floor((expirationTime - elapsed) / 1000)); // Convert to seconds

    res.status(200).json({
      success: true,
      timeRemaining,
      expiresAt: new Date(createdAt.getTime() + expirationTime),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});