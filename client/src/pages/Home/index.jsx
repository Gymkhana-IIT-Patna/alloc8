import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import msLogo from "../../assets/ms_logo.svg";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Alloc8</h2>
        <form>
          <div className="w-full flex justify-center items-center mt-10">
            <Button
              // onClick={}
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
        <footer className="mt-6 text-center">
          <p className="mt-2 text-gray-600"><Link to="/" className="text-indigo-600 hover:underline">Homepage</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
