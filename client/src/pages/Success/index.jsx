import { getName, getRollNumber } from "@/lib/auth_utility";
import Spinner from "@/components/spinner";
import Header from "@/components/Header";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [studData, setStudData] = useState({});
  const navigate = useNavigate();
  const contentRef = useRef();

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

  const downloadPDF = () => {
    const input = contentRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("room_allocation_details.pdf");
    });
  };

  return (
    <div className="bg-[#f1f5f9] h-full w-full">
      <Header></Header>
      <Spinner loading={loading}></Spinner>
      <div ref={contentRef} className="p-10 max-w-[700px] m-auto bg-white mt-10 shadow-md rounded-lg">
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
      <div className="flex justify-center mt-5">
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
