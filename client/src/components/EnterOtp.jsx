import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  otpValidationSchema,
} from "../validations/validationSchemas";
import { errorToast, successToast } from "./toast";
import Form from "./Form";
import { useOtpVerifcationMutation, useResendOtpEmailMutation, useGetOtpTimeRemainingByEmailQuery } from "../redux/slices/userApiSlices";
import { RotatingLines } from "react-loader-spinner";

const EnterOtp = () => {
  const [verifyOtp] = useOtpVerifcationMutation();
  const [resendOtp] = useResendOtpEmailMutation()
  const [timeLeft, setTimeLeft] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();

  // Fetch remaining time from backend
  const { data: otpTimeData, refetch: refetchOtpTime } = useGetOtpTimeRemainingByEmailQuery(undefined, {
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
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  
  

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };
  

  const handleSubmit = async (otp) => {
      setIsLoading(true)
      try {
        await verifyOtp(otp).unwrap();
        successToast("otp verified");
        navigate("/forgotPassword", {state:{access:true}});
      } catch (error) {
        console.error("Error changing password:", error);
        errorToast(error?.message || error?.data?.message || "Error occurred");
      } finally {
        setIsLoading(false);
      }
    };

  const handleResend = async () => {
      setIsLoading(true);
      try {
        const result = await resendOtp();
        console.log(result)
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
      } finally {
        setIsLoading(false);
      }
    };




  const loginFields = [
    {
      name: "otp",
      label: "OTP",
      type: "number",
      placeholder: "Enter your otp",
      required: true,
    },
  ];

  

    const extraLinks = [
      {
        linkText: `Change email?`,
        path: "/forgotPassword/email",
      },
      {
        text: `${
          timeLeft === 0 ? "" : "Resend OTP in " + formatTime(timeLeft)
        }`,
        linkText: `${
          timeLeft === 0 ? "Resend OTP" : ""
        }`,
        onclick: handleResend,
      },
    ];



  

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <Form
            title="Enter your OTP"
            fields={loginFields}
            onSubmit={handleSubmit}
            buttonText="Next"
            validationRules={otpValidationSchema}
            extraLinks={extraLinks}
          />
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
    </>
  );
};

export default EnterOtp;
