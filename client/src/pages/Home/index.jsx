import { Button } from '@/components/ui/button';
import msLogo from "../../assets/ms_logo.svg";
import logo from '../../assets/logo.png'

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-200">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-lg flex flex-col items-center border border-gray-300">
        <img src={logo} alt="ALLOC8 Logo" className='h-[40px] border-b-2 pb-2 mb-5' />
        <span className="w-full text-center">
          Hostel Allotment Platform of IIT Patna
        </span>
        <form className="w-full">
          <div className="w-full flex justify-center items-center mt-8">
            <Button
              className="flex items-center justify-center font-segoe-ui font-semibold text-[15px] bg-[#2f2f2f] text-white h-[45px] px-4 rounded-lg hover:bg-[#0e0202] transition duration-300">
              <img
                src={msLogo}
                className="w-5 h-5 mr-3"
                alt="Microsoft"
              />
              Sign In with Microsoft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default HomePage;