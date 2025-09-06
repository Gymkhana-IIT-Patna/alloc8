import { Button } from "@/components/ui/button";
import msLogo from "../../assets/ms_logo.svg";
import logo from "../../assets/logo.png";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useSearchParams } from "react-router";

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-512", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

const HomePage = () => {
  const navigate = useNavigate();

  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [digestHex, setDigestHex] = useState("");

  useEffect(() => {
    digestMessage(searchParams.get("pass") || "").then((digestHex) => setDigestHex(digestHex));
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/getSMP");
    }
  }, [isAuthenticated]);

  const initializeSignIn = () => {
    instance.loginRedirect();
  };

  /* if (digestHex != "ac0d0a66508c239711429e6d05d6068659d9a44beac3a6d718dc0ac33ce11a7cfb8cf7368a0b0078e7aeffcaa9df2679ee14901658839fd0ce6c22e743b46ad2") {
    return <>Site under maintenance. Please wait for an official mail</>;
  } */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-200">
      <div className="w-full max-w-md p-10 pb-20 bg-white rounded-lg shadow-lg flex flex-col items-center border border-gray-300">
        <img
          src={logo}
          alt="ALLOC8 Logo"
          className="h-[40px] border-b-2 pb-2 mb-5"
        />
        <span className="w-full text-center">
          Hostel/SMP Allotment Platform of IIT Patna
        </span>
        <form className="w-full">
          <div className="w-full flex justify-center items-center mt-8">
            <Button
              onClick={initializeSignIn}
              className="flex items-center justify-center font-segoe-ui font-light text-[15px] bg-[#2f2f2f] text-white h-[45px] px-4 rounded-sm hover:bg-[#0e0202] transition duration-300 "
            >
              <img src={msLogo} className="w-5 h-5 mr-3" alt="Microsoft" />
              Sign In with Microsoft
            </Button>
          </div>
        </form>
      </div>
      <Footer></Footer>
    </div>
  );
};
export default HomePage;
/* vi: set et sw=2: */
