import { getName, getRollNumber } from "@/lib/auth_utility";
import Spinner from "@/components/spinner";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [studData, setStudData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "/api/nonfresher/allocated-details?" +
        new URLSearchParams({
          rollnum: getRollNumber(),
        }).toString(),
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          navigate("/");
          return;
        }
        setLoading(false);
        setStudData(data);
      });
  }, []);
  return (
    <div className="bg-[#f1f5f9] h-full w-full">
      <Header></Header>
      <Spinner loading={loading}></Spinner>
      <div className="p-10 max-w-[700px] m-auto bg-white mt-10 shadow-md rounded-lg">
        <p>Congratulations ,</p>
        <div>
          Your room has been booked successfully. The details of the booked room
          are as follows -
          <div className="p-5 text-xl font-mono border-2">
            <div>
              <b>Name: </b> {getName()}
            </div>
            <div>
              <b>Roll No.: </b> {getRollNumber()}
            </div>
            <div>
              <b>Hostel: </b> {studData?.hostel}
            </div>
            <div>
              <b>Room No.: </b> {studData?.roomNum}
            </div>
            <div>
              <b>Occupancy: </b> {studData?.occupancy}
            </div>
            <div>
              <b>Roommates Until Now: </b>{" "}
              {studData?.roommates?.map((roommate) => {
                return (
                  <div key={roommate.rollnum} className="px-10">
                    {roommate.rollnum} - {roommate.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>Regards</div>
        <div>IIT Patna</div>
      </div>
    </div>
  );
};

export default SuccessPage;
