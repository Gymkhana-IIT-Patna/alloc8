import { Button } from "@/components/ui/button";
import msLogo from "../../assets/ms_logo.svg";
import logo from "../../assets/logo.png";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
const HomePage = () => {
  const navigate = useNavigate();

  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  console.log(query.get("pass"));
  if (query.get("pass") != "ALAB") {
    return <>Site under maintenance. Please wait for an official mail</>;
  }

  useEffect(() => {
    if (isAuthenticated) {
      let navigated = false;
      let parts = accounts[0].username.split("_");
      for (let part of parts) {
        if (part.startsWith("24") && !part.startsWith("2421")) {
          navigate("/Register");
          navigated = true;
        }
      }
      if (!navigated) {
        navigate("/success");
      }
    }
  }, [isAuthenticated]);
  const initializeSignIn = () => {
    instance.loginRedirect();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-200">
      <div className="w-full max-w-md p-10 pb-20  bg-white rounded-lg shadow-lg flex flex-col items-center border border-gray-300">
        <img
          src={logo}
          alt="ALLOC8 Logo"
          className="h-[40px] border-b-2 pb-2 mb-5"
        />
        <span className="w-full text-center">
          Hostel Allotment Platform of IIT Patna
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
