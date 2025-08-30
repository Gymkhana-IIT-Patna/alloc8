export default function Success(){
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-cyan-600 mb-4">
          Submission Successful
        </h1>
        <p className="text-gray-600 mb-2">
          Your details have been recorded successfully.  
          You can now close this page.
        </p>
      </div>
    </div>
  );
}
