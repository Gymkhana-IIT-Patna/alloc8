import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// import msLogo from "../../assets/ms_logo.svg";
import logo from "../../assets/logo.png";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { useIsAuthenticated, useMsal } from "@azure/msal-react";

const FreshersRoom = () => {
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const sendOTP = (e) => {
    // TODO : SEND OTP
    e.preventDefault();
    const form = e.target;
    console.log(form);
    const data = new FormData(form);
    const jeeadvrollno = data.get("rollno");
    console.log("JEEADv Roll No:", jeeadvrollno);
    setOtpSent(true);
  };
  const validateOTP = () => {
    // TODO Validate OTP
    return true;
  };
  const getRoomDetails = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const jeeadvrollno = data.get("rollno");
    const otp = data.get("pin");
    console.log("OTP", otp, "for", jeeadvrollno);
    if (!validateOTP) {
      return;
    }

    // if (jeeadvrollno.length !== 9) {
    //   return;
    // }
    // alert(jeeadvrollno);
    navigate("/fresher/success");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-200">
      <div className="w-full max-w-md p-10 pb-20  bg-white rounded-lg shadow-lg flex flex-col items-center border border-gray-300">
        <img
          src={logo}
          alt="ALLOC8 Logo"
          className="h-[40px] border-b-2 pb-2 mb-5"
        />
        <span className="w-full text-center mb-10">
          <p>Enter Your Details bellow to get your room details</p>
        </span>
        <form
          className="w-full"
          onSubmit={(e) => {
            if (otpSent) {
              getRoomDetails(e);
            } else {
              sendOTP(e);
            }
          }}
        >
          <div className="">
            {" "}
            <Label htmlFor="rollno" className="w-full">
              JEE Advanced Roll No.
            </Label>
            <Input
              type="number"
              id="rollno"
              name="rollno"
              placeholder="247018202"
              required={true}
            />
            <div
              className="my-5 p-2 w-full flex justify-center items-center flex-wrap"
              style={{ display: otpSent ? "flex" : "none" }}
            >
              <Label className="w-full text-center py-3">OTP</Label>
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-center mt-2 text-slate-500">
                OTP sent to your registered email
              </p>
            </div>
            <Button className="mt-5 w-full">
              {otpSent ? "Submit" : "Next"}
            </Button>
          </div>
        </form>
      </div>
      <Footer></Footer>
    </div>
  );
};
export default FreshersRoom;
