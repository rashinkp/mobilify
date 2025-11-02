import  {  useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { emailForm } from "../validations/validationSchemas";
import { errorToast, successToast } from "./toast";
import Form from "./Form";
import { useOtpToEmailMutation } from "../redux/slices/userApiSlices";
import { RotatingLines } from "react-loader-spinner";

const EnterEamil = () => {
  const [sendOtp] = useOtpToEmailMutation()
  const [isLoading , setIsLoading ] = useState(false)
  const loginFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
  ];


    
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const { userInfo } = useSelector((state) => state.userAuth);

  // useEffect(() => {
  //   if (userInfo) {
  //     navigate("/");
  //   }
  // }, [userInfo, navigate]);

  // const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async ({ email }) => {
    setIsLoading(true)
    try {
      await sendOtp({ email }).unwrap();
      successToast('Otp send to email');
      navigate("/forgotPassword/otp");
    } catch (error) {
       console.error("Error changing password:", error);
      errorToast(error?.message || error?.data?.message || "Error occurred");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <Form
            title="Enter your email"
            fields={loginFields}
            onSubmit={handleLogin}
            buttonText="Next"
            validationRules={emailForm}
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

export default EnterEamil;
