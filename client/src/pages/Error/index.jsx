const Error = () => {
  return (
    <div className="h-screen w-screen grid place-content-center bg-slate-200 text-black">
      <div className="w-[500px] max-w-[90vw] p-10 flex flex-col justify-center items-center bg-white rounded-lg">
        <h1 className="text-2xl font-bold text-red-700 mb-5">
          Error While Accessing this Page
        </h1>
        <p>
          Go to{" "}
          <a href="/" className="text-blue-700 underline">
            Home Page
          </a>{" "}
          and try again.
        </p>
        <p>If you think this is a mistake contact STC</p>
      </div>
    </div>
  );
};

export default Error;
