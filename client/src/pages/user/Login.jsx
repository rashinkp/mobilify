import React, { useEffect, useState } from "react";
import Form from "../../components/Form.jsx";
import { loginValidationSchema, emailForm } from "../../validations/validationSchemas.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLoginMutation, useOtpToEmailMutation, useOtpVerifcationMutation, useResendOtpEmailMutation } from "../../redux/slices/userApiSlices.js";
import { userLogin } from "../../redux/slices/authUser.js";
import { errorToast, successToast } from "../../components/toast/index.js";
import { RotatingLines } from "react-loader-spinner";
import GoogleSignIn from "./GoogleSignIn.jsx";

export const clientId =
  "1082671163898-isei5ie78erkjd5434c5i9umc4n18lom.apps.googleusercontent.com";

const Login = () => {
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationStep, setVerificationStep] = useState("email"); // "email" or "otp"
  const [otpUserId, setOtpUserId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  const [login, { isLoading }] = useLoginMutation();
  const [sendOtpEmail] = useOtpToEmailMutation();
  const [verifyOtp] = useOtpVerifcationMutation();
  const [resendOtpEmail] = useResendOtpEmailMutation();

  const loginFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
    },
  ];

  const emailVerificationFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
  ];

  const otpFields = [
    {
      name: "otp",
      label: "OTP",
      type: "text",
      placeholder: "Enter the OTP sent to your email",
      required: true,
    },
  ];

  const extraLinks = [
    {
      text: `don't have account?`,
      linkText: `signup`,
      path: "/signup",
    },
    {
      linkText: `forgot password?`,
      path: "/forgotPassword/email",
    },
  ];

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(userLogin({ ...res }));
      successToast("Login Successful");
      navigate("/");
    } catch (err) {
      // Check if user needs to verify their email
      if (err?.data?.requiresVerification || err?.data?.message?.includes("verify")) {
        setUserEmail(email);
        setShowVerification(true);
        setVerificationStep("email");
        errorToast(
          err?.data?.message ||
            "Please verify your email with OTP before logging in."
        );
      } else {
        errorToast(
          err?.data?.message ||
            err.error ||
            err.message ||
            "An error occurred while logging in"
        );
      }
    }
  };

  const handleSendVerificationOtp = async ({ email }) => {
    try {
      const res = await sendOtpEmail({ email, forEmailVerification: true }).unwrap();
      setOtpUserId(res.userId);
      setUserEmail(email);
      setVerificationStep("otp");
      successToast("OTP sent to your email. Please check and enter it below.");
    } catch (err) {
      errorToast(err?.data?.message || err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async ({ otp }) => {
    try {
      const res = await verifyOtp({ otp, isEmailVerification: true }).unwrap();
      successToast(res.message || "Email verified successfully! You can now login.");
      setShowVerification(false);
      setVerificationStep("email");
      setUserEmail("");
      setOtpUserId(null);
    } catch (err) {
      errorToast(err?.data?.message || err.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtpEmail().unwrap();
      successToast("OTP resent successfully. Please check your email.");
    } catch (err) {
      errorToast(err?.data?.message || err.message || "Failed to resend OTP");
    }
  };
    
    
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        {!showVerification ? (
          <>
            <Form
              title="Login"
              fields={loginFields}
              onSubmit={handleLogin}
              buttonText="Login"
              extraLinks={extraLinks}
              validationRules={loginValidationSchema}
            />
            <div className="mt-5">
              <GoogleSignIn />
            </div>
          </>
        ) : (
          <>
            {verificationStep === "email" ? (
              <>
                <Form
                  title="Verify Your Email"
                  fields={emailVerificationFields.map(field => 
                    field.name === "email" 
                      ? { ...field, defaultValue: userEmail }
                      : field
                  )}
                  onSubmit={handleSendVerificationOtp}
                  buttonText="Send OTP"
                  validationRules={emailForm}
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationStep("email");
                    }}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <Form
                  title="Enter OTP"
                  fields={otpFields}
                  onSubmit={handleVerifyOtp}
                  buttonText="Verify Email"
                />
                <div className="mt-4 text-center space-y-2">
                  <button
                    onClick={handleResendOtp}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 block mb-2"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={() => {
                      setVerificationStep("email");
                      setOtpUserId(null);
                    }}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 mr-4"
                  >
                    Change Email
                  </button>
                  <button
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationStep("email");
                    }}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {isLoading && (
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
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
    </div>
  );
};

export default Login;
