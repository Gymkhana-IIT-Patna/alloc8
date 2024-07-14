// import Header from "@/components/Header";
// import Registerform from "@/components/RegisterForm";
// import Student_Login from "@/assets/StudentLogin.svg";

// function Hero() {
//   return (
//     <div className="flex gap-5 justify-center lg:justify-evenly p-10 items-center">
//       <div className="lg:w-2/5 w-4/5 md:w-3/5 flex-shrink-0 rounded-[23px] md:rounded-[33px] bg-white shadow-lg p-10 flex flex-col">
//         <h2 className="text-3xl font-bold text-[#000000] text-center mb-6">Register</h2>
//         <Registerform />
//       </div>
//       <div className="lg:block hidden">
//         <img
//           className="lg:block hidden"
//           src={Student_Login}
//           alt="StudentLogin"
//         />
//       </div>
//     </div>
//   );
// }

// const Register = () => {
//   return (
//     <div className="flex flex-col h-full bg-slate-100 pb-10">
//       <Header />

//       <Hero />
//     </div>
//   );
// };

// export default Register;


import Header from "@/components/Header";
import Registerform from "@/components/RegisterForm";
import StudentLoginImage from "@/assets/StudentLogin.svg";

function Hero() {
  return (
    <div className="flex gap-5 justify-center lg:justify-evenly p-3 sm:p-10 items-center">
      <Registerform />
      <div className="xl:block hidden">
        <img
          className="lg:block hidden"
          src={StudentLoginImage}
          alt="StudentLogin"
        />
      </div>
    </div>
  );
}

const Register = () => {
  return (
    <div className="flex flex-col h-full bg-slate-100 pb-10">
      <Header />

      <Hero />
    </div>
  );
};

export default Register;