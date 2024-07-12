const Spinner = () => {
  return (
    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-opacity-50 bg-gray-200 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default Spinner;
