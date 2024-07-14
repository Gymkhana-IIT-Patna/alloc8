import { Button } from '@/components/ui/button';
import msLogo from "../../assets/ms_logo.svg";
import logo from '/logo.png'
const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md flex flex-col items-center">
        <img src={logo} alt="ALLOC8 Logo" className='h-[40px]'/>
        <form>
          <div className="w-full flex justify-center items-center mt-10">
            <Button
              className="flex items-center justify-center font-segoe-ui font-semibold text-[15px] bg-[#2f2f2f] text-white h-[41px] px-3.5 rounded-none">
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
