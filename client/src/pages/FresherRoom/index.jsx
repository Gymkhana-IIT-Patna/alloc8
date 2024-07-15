import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function FresherRoom() {
  // Sample data
  // import Data from the backend
  const rooms = [
    {
      roomNumber: "101",
      roommates: [
        { name: "XYZ", rollNumber: "2401CS01" },
        { name: "ABC", rollNumber: "2401CS02" },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen gap-10 bg-slate-100">
      <Header />
      <div className="flex flex-col gap-5 items-center justify-center flex-grow px-5 lg:px-20 py-10">
        <h2 className="text-3xl font-bold text-[#538ff8]">Details</h2>
        <div className="w-full max-w-4xl p-5 bg-white rounded-lg shadow-md mt-5">
          {rooms.map((room, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Room {room.roomNumber}
              </h3>
              <ul className="space-y-2">
                {room.roommates.map((roommate, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-md shadow-sm"
                  >
                    <span className="text-lg font-medium text-gray-700">
                      {roommate.name}
                    </span>
                    <span className="text-lg font-medium text-gray-500">
                      {roommate.rollNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
