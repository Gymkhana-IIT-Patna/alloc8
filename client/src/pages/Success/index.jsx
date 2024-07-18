import { getName, getRollNumber } from "@/lib/auth_utility";
import Spinner from "@/components/spinner";
import Header from "@/components/Header";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Footer from "@/components/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useMsal } from "@azure/msal-react";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [studData, setStudData] = useState({});
  const navigate = useNavigate();
  const contentRef = useRef();
  const { accounts, instance } = useMsal();

  const accessTokenRequest = {
    account: accounts[0],
  };

  useEffect(() => {
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      fetch(
        "/api/nonfresher/allocated-details?" +
          new URLSearchParams({
            rollnum: getRollNumber(),
          }).toString(),
        {
          method: "GET",
          headers: { "X-Alloc8-IDToken": res.idToken },
          preferred_username: "hemant_2301cs20@iitp.ac.in",
          name: "Hemant Kumar",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.error) {
            navigate("/allotroom");
            return;
          }
          setLoading(false);
          setStudData(data);
        });
    });
  }, []);

  const viewport = document.querySelector("meta[name=viewport]");
  const downloadPDF = () => {
    // window.print();
    viewport.setAttribute("content", "width=1024");

    const input = contentRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("room_allocation_details.pdf");
      viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
    });
  };

  return (
    <div className="bg-[#f1f5f9] h-full w-full">
      <Header></Header>
      <Spinner loading={loading}></Spinner>

      <div
        ref={contentRef}
        className="p-10 max-w-[700px] m-auto bg-white mt-10 shadow-md rounded-lg"
      >
        <div
          className=""
          style={{
            fontFamily: "Poppins, Arial, sans-serif",
            margin: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={"/gymkhana.jpg"}
            alt="Gymkhana"
            style={{ width: "100px", height: "auto", marginRight: "10px" }}
          />
          <h1
            className="mb-0 text-xl"
            style={{
              fontFamily: "Poppins, Arial, sans-serif",
              // marginBottom: "10px",
              flexGrow: 1,
              textAlign: "center",
            }}
          >
            {"Students' Gymkhana, IIT Patna"}
          </h1>
          <img
            src={"/gymkhana.jpg"}
            alt="Gymkhana"
            style={{ width: "100px", height: "auto", marginRight: "10px" }}
          />
        </div>
        <hr />
        <div className="pt-10">
          <p>Congratulations ,</p>
          <div>
            Your room has been booked successfully. The details of the booked
            room are as follows -
            <div className="p-5 text-xl font-mono border-2 my-5 capitalize">
              <div>
                <b>Name: </b> {getName()}
              </div>
              <div>
                <b>Roll No.: </b> {getRollNumber().toUpperCase()}
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
                <b>Timestamp: </b>
                {new Date().toString()}
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
              {studData &&
              studData.roommateCode &&
              studData.roommateCode.length > 0 ? (
                <div style={{ textTransform: "lowercase" }}>
                  <b>Roommate Code: </b> {studData?.roommateCode?.toLowerCase()}
                  <div style={{ textTransform: "lowercase" }}>
                    <b>Roommate Code: </b>{" "}
                    {studData?.roommateCode?.toLowerCase()}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div>Regards</div>
          <div>IIT Patna</div>
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded mb-[7em]"
        >
          Download PDF
        </button>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default SuccessPage;
/* vi: set et sw=2: */
