import { useEffect, useState } from "react";
import Form from "../../components/Form.jsx";
import { otpValidationSchema } from "../../validations/validationSchemas.js";
import { useRegisterMutation, useResendotpMutation, useGetOtpTimeRemainingQuery } from "../../redux/slices/userApiSlices.js";
import { errorToast, successToast } from "../../components/toast/index.js";
import {  useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { userLogin } from "../../redux/slices/authUser.js";
const VerifyOtp = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendOtp] = useResendotpMutation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch remaining time from backend
  const { data: otpTimeData, refetch: refetchOtpTime } = useGetOtpTimeRemainingQuery(id, {
    skip: !id,
    pollingInterval: 30000, // Refetch every 30 seconds to sync with backend
  });

  // Initialize timer from backend on mount
  useEffect(() => {
    if (otpTimeData?.success && !isInitialized) {
      const remaining = otpTimeData.timeRemaining || 0;
      setTimeLeft(remaining);
      setIsInitialized(true);
    } else if (otpTimeData?.success && isInitialized) {
      // Update timer if backend data changes (e.g., after resend)
      const remaining = otpTimeData.timeRemaining || 0;
      setTimeLeft(remaining);
    }
  }, [otpTimeData, isInitialized]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft])


  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  const formFields = [
    {
      name: "otp",
      label: "OTP",
      placeholder: "Enter One Time Password",
      type: "text",
      required: true,
    },
    {
      name: "referral",
      label: "Referral",
      placeholder: "Enter referral code (optional)",
      type: "text",
    },
  ];

 
  
  const handleResend = async () => {
    try {
      const result = await resendOtp({id});
      successToast("OTP resent successfully");
      // Refetch the remaining time from backend after resend
      await refetchOtpTime();
      // Reset will happen automatically via the useEffect that watches otpTimeData
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend OTP";
      errorToast(errorMessage);
      console.log(error); 
    }
  };


  const extraLinks = [
    {
      text: `${timeLeft === 0 ? "" : "OTP expires in " + formatTime(timeLeft)}`,
      linkText: `${
        timeLeft === 0 ? "OTP Expired. Please request a new one." : ""
      }`,
      onclick: handleResend,
    },
  ];


  const handleSubmit = async (data) => {
    try {
      const res = await register({ data, id }).unwrap();
      dispatch(userLogin({ ...res }));
      successToast("User registered successfull");
      navigate("/");
    } catch (error) {
      errorToast(
        error?.data?.message || error.message || "Failed to register user"
      );
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <Form
          title="Verify OTP"
          fields={formFields}
          onSubmit={handleSubmit}
          extraLinks={extraLinks}
          buttonText="Submit"
          validationRules={otpValidationSchema}
        />
      </div>
    </div>
  );
};

export default VerifyOtp;
