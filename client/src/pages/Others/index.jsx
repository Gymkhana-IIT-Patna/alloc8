/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling
// Room allocation for everyone except freshers

import "./index.css";
import Header from "@/components/Header";
import Stepper from "react-stepper-horizontal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getRollNumber } from "@/lib/auth_utility";
import { useEffect, useState } from "react";
import hostel_data from "@/data/available_rooms.json";
import Spinner from "@/components/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router";
import Footer from "@/components/Footer";
import { useMsal } from "@azure/msal-react";

const steps = [
  { title: "Details" },
  { title: "Hostel" },
  // { title: "Floor" },
  { title: "Room" },
];

const ControlButtons = ({ activeStep, onPrev }) => {
  return (
    <div className="w-full flex justify-between mt-8">
      <Button
        disabled={activeStep == 0}
        onClick={(e) => {
          e.preventDefault();
          onPrev();
        }}
      >
        Previous
      </Button>

      <Button type="submit">
        {activeStep == steps.length - 1 ? "Book Room" : "Next"}
      </Button>
    </div>
  );
};

const StepperForm = ({
  children,
  style,
  name,
  onSubmit,
  onPrev,
  activeStep,
}) => {
  return (
    <div style={style} className="bg-[#f1f5f9]">
      <form
        name={name}
        className="flexbox max-w-[700px] m-auto my-10 bg-gray-50 shadow-lg p-10 sm:p-20 rounded-xl"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          onSubmit(e);
        }}
      >
        {children}
        <hr />
        <ControlButtons
          onPrev={onPrev}
          activeStep={activeStep}
        ></ControlButtons>
      </form>
    </div>
  );
};

const Details = ({ onNext, onPrev, activeStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const details = {
      rollno: getRollNumber(),
      gender: data.get("gender"),
      batch: data.get("batch"),
    };
    if (!details.rollno || !details.gender || !details.batch) {
      alert("Please fill all the fields");
      return;
    }
    onNext(details);
  };
  return (
    <StepperForm
      name="detailData"
      onSubmit={handleSubmit}
      onPrev={onPrev}
      activeStep={activeStep}
    >
      <Label htmlFor="rollno" className="w-full">
        Roll No.
      </Label>
      <Input
        type="text"
        id="rollno"
        name="rollno"
        value={getRollNumber().toUpperCase()}
        disabled={true}
      />
      <Label htmlFor="gender" className="mt-3">
        Gender
      </Label>
      <RadioGroup id="gender" name="gender" defaultValue="Male">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Male" id="male" />
          <Label htmlFor="male">Male</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Female" id="female" />
          <Label htmlFor="female">Female</Label>
        </div>
      </RadioGroup>
      <Label htmlFor="gender" className="mt-3">
        Batch
      </Label>
      <Select id="batch" name="batch">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Batch" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>B.Tech</SelectLabel>
            <SelectItem value="BTech21">{"BTech'21"}</SelectItem>
            <SelectItem value="BTech22">{"BTech'22"}</SelectItem>
            <SelectItem value="BTech23">{"BTech'23"}</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>M.Tech</SelectLabel>
            <SelectItem value="MTech23">{"MTech'23"}</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>M.Sc</SelectLabel>
            <SelectItem value="MSc23">{"MSc'23"}</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Ph.D</SelectLabel>
            <SelectItem value="PhD14">{"PhD'14"}</SelectItem>
            <SelectItem value="PhD16">{"PhD'16"}</SelectItem>
            <SelectItem value="PhD17">{"PhD'17"}</SelectItem>
            <SelectItem value="PhD18">{"PhD'18"}</SelectItem>
            <SelectItem value="PhD19">{"PhD'19"}</SelectItem>
            <SelectItem value="PhD20">{"PhD'20"}</SelectItem>
            <SelectItem value="PhD21">{"PhD'21"}</SelectItem>
            <SelectItem value="PhD22">{"PhD'22"}</SelectItem>
            <SelectItem value="PhD23">{"PhD'23"}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </StepperForm>
  );
};
const Hostel = ({ data, onNext, onPrev, activeStep }) => {
  const batchDetails = {};
  console.log(batchDetails);
  console.log(data);
  const available_hostels = Object.keys(data);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const hostel = data.get("hostel");
    if (!hostel) {
      alert("Please select a hostel");
      return;
    }
    onNext(hostel);
  };
  return (
    <StepperForm
      name="hostelData"
      onSubmit={handleSubmit}
      onPrev={onPrev}
      activeStep={activeStep}
    >
      <Label htmlFor="hostel" className="mt-3">
        Choose Hostel
      </Label>
      <RadioGroup
        id="hostel"
        name="hostel"
        className="flex w-full flex-wrap sm:flex-nowrap "
      >
        {available_hostels.map((hostel) => {
          return (
            <div key={hostel} className="w-full ">
              <Label htmlFor={hostel} className="text-lg">
                <div className="flex flex-wrap items-center space-x-2 px-10 py-16 bg-slate-200 rounded-lg ">
                  <RadioGroupItem value={hostel} id={hostel} />

                  <span
                    className="block ml-5"
                    style={{ textTransform: "capitalize" }}
                  >
                    {hostel}
                  </span>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </StepperForm>
  );
};
// const Floor = ({ onNext, onPrev, activeStep, data, hostel }) => {
//   console.log(data);

//   const available_floors = Object.keys(data);
//   available_floors.sort();
//   available_floors.reverse();
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const form = e.target;
//     const data = new FormData(form);
//     let floor = data.get("floor");
//     if (!floor) {
//       alert("Please select a floor");
//       return;
//     }
//     if (floor == "Ground") {
//       floor = 0;
//     }
//     onNext(floor);
//   };
//   return (
//     <StepperForm
//       name="floorData"
//       onSubmit={handleSubmit}
//       onPrev={onPrev}
//       activeStep={activeStep}
//     >
//       <b className="text-xl" style={{ textTransform: "capitalize" }}>
//         {hostel}
//       </b>
//       <Label htmlFor="floor" className="mt-3">
//         Choose Floor
//       </Label>
//       <RadioGroup id="floor" name="floor" className="flex w-full flex-wrap">
//         {available_floors.map((floor) => {
//           return (
//             <div key={floor} className="w-full">
//               <Label htmlFor={floor} className="text-lg">
//                 <div className="flex flex-wrap items-center space-x-2 p-5  bg-slate-200 rounded-lg ">
//                   <RadioGroupItem value={floor} id={floor} />

//                   <span className="block ml-5">
//                     {floor == 0 ? "Ground" : floor}
//                   </span>
//                 </div>
//               </Label>
//             </div>
//           );
//         })}
//       </RadioGroup>
//     </StepperForm>
//   );
// };
const FloorAndRoom = ({
  onNext,
  onPrev,
  activeStep,
  data,
  hostel,
  studDetails,
}) => {
  const floors = Object.keys(data);
  const [floor, setFloor] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [rooms, setRooms] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const navigate = useNavigate();
  const { accounts, instance } = useMsal();

  const accessTokenRequest = {
    account: accounts[0],
  };
  const updateRooms = () => {
    if (
      !floor ||
      !studDetails ||
      !studDetails.batch ||
      !studDetails.gender ||
      !hostel
    ) {
      return;
    }
    const postBody = {
      batch: studDetails.batch.toLowerCase(),
      gender: studDetails.gender.toLowerCase(),
      hostel: hostel.toLowerCase(),
      floor: floor.toString(),
    };

    console.log(postBody);
    setLoading(true);
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      fetch("/api/nonfresher/room-status", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Alloc8-IDToken": res.idToken,
        },
        body: JSON.stringify(postBody),
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          console.log(data);
          setRoomData(data.rooms);
        });
    });
  };
  const [roommateCode, setRoommateCode] = useState("");
  const bookRoom = (roomId) => {
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      fetch("/api/nonfresher/room-booking", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Alloc8-IDToken": res.idToken,
        },
        body: JSON.stringify({
          studentId: getRollNumber(),
          roomId: roomId,
          roommateCode: roommateCode ? roommateCode : null,
        }),
      }).then((res) => {
        if (res.status == 200) {
          navigate("/success");
        } else {
          res.json().then((data) => alert(data.error));
        }
      });
    });
  };
  const getStudDetail = (rollnum) => {
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      fetch(
        "/api/nonfresher/allocated-details?" +
          new URLSearchParams({
            rollnum: rollnum,
          }).toString(),
        {
          method: "GET",
          headers: {
            "X-Alloc8-IDToken": res.idToken,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.error) {
            return;
          }
          return data;
        });
    });
  };
  useEffect(() => {
    updateRooms();
  }, [floor]);
  const getRoomStatus = (room) => {
    if (room.capacity <= room.numFilled) {
      return "Full";
    } else {
      if (room.numFilled == 0) {
        return "Available";
      } else {
        return "Partial";
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
  };

  return (
    <>
      <StepperForm
        name="roomData"
        onSubmit={handleSubmit}
        onPrev={onPrev}
        activeStep={activeStep}
      >
        <Spinner loading={loading}></Spinner>

        <b className="text-xl" style={{ textTransform: "capitalize" }}>
          {hostel}
        </b>
        <Label htmlFor="floor" className="px-1">
          Floor
        </Label>
        <Select
          id="floor"
          name="floor"
          onValueChange={(value) => {
            // setRooms(data[value]);
            setFloor(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Floor" />
          </SelectTrigger>
          <SelectContent>
            {floors.map((floor) => {
              return (
                <SelectItem id={floor} value={floor} key={floor}>
                  {floor}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-5 mb-5 flex-col sm:flex-row">
          <div className="flex  justify-start align-start">
            <div className="w-[50px] h-[30px] bg-blue-100 border-[1px] border-blue-200  hover:bg-blue-500 hover:text-blue-50"></div>
            <span className="mx-2">Available</span>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-[50px] h-[30px] Partial border-[1px]"></div>
            <span className="mx-2">Partially Full</span>
          </div>
          <div className="flex justify-start items-start">
            <div className="w-[50px] h-[30px] bg-blue-100 Full border-[1px]"></div>
            <span className="mx-2"> Full</span>
          </div>
        </div>
        <div></div>
        <div className="flex flex-wrap gap-3">
          {roomData.map((room) => {
            return (
              <Dialog key={room.roomNum}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      updateRooms();
                      // if (room.capacity <= room.numFilled) {
                      //   alert("Room became full according to updated data");
                      //   return;
                      // }
                    }}
                    className={`${getRoomStatus(
                      room
                    )} w-[50px] bg-blue-100 text-blue-700 border-blue-300 border-[1px] hover:bg-blue-500 hover:text-blue-50`}
                  >
                    {room.roomNum}
                  </Button>
                </DialogTrigger>
                <DialogContent className="py-10 min-h-[300px]">
                  <DialogHeader>
                    <DialogTitle style={{ textTransform: "capitalize" }}>
                      {hostel}: Room {room.roomNum}
                    </DialogTitle>
                    <DialogDescription className="flex h-full w-full flex-col justify-between">
                      <div className="">
                        <b className="">Details</b>
                        <div className="capitalize">
                          <b>Hostel:</b> {hostel}
                        </div>
                        <div className="capitalize">
                          <b>Floor:</b> {floor}
                        </div>
                        <div className="capitalize">
                          <b>Room Number:</b> {room.roomNum}
                        </div>
                      </div>
                      <div className="text-purple-700 my-5">
                        <div className="font-semibold">Room Members: </div>
                        {room.students.length == 0
                          ? "Empty Until Now"
                          : room.students.map((stud) => {
                              return <div key={stud}>{stud}</div>;
                            })}
                      </div>
                      <div
                        className="my-5"
                        style={{
                          display:
                            getRoomStatus(room) == "Partial" ? "block" : "none",
                        }}
                      >
                        <Label htmlFor="roommateCode">Roommate Code:</Label>
                        <Input
                          type="text"
                          id="roommateCode"
                          value={roommateCode}
                          onChange={(e) => setRoommateCode(e.target.value)}
                        />
                        <div className="mt-3">
                          (You need to get this code from current room members
                          to get this room)
                        </div>
                      </div>
                      <div>
                        <Button
                          onClick={() => {
                            updateRooms();
                            bookRoom(room.roomId);
                          }}
                          disabled={
                            (getRoomStatus(room) == "Partial" &&
                              roommateCode.length == 0) ||
                            getRoomStatus(room) == "Full"
                          }
                        >
                          Book Room
                        </Button>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </StepperForm>
    </>
  );
};
const OthersRoomAllocPage = () => {
  const { accounts, instance } = useMsal();
  const accessTokenRequest = {
    account: accounts[0],
  };
  useEffect(() => {
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      console.log(res);
    });
  }, []);
  const [available_rooms, setAvailableRooms] = useState({});
  let [activeStep, setActiveStep] = useState(0);
  const [hostel, setHostel] = useState("");
  const [studDetails, setStudDetails] = useState({});
  // const [floor, setFloor] = useState(0);

  const fetchAvailableRooms = (details) => {
    console.log(hostel_data);
    let floors =
      hostel_data[details.batch.toLowerCase()][details.gender.toLowerCase()];
    setAvailableRooms(floors);
    return floors;
  };

  const getComponent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Details
            activeStep={0}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setStudDetails(data);
              fetchAvailableRooms(data);
              setActiveStep((a) => a + 1);
            }}
          />
        );
      case 1:
        return (
          <Hostel
            data={available_rooms}
            activeStep={1}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setHostel(data);
              setActiveStep((a) => a + 1);
            }}
          />
        );
      // case 2:
      //   return (
      //     <Floor
      //       activeStep={2}
      //       data={available_rooms[hostel.toLowerCase()]}
      //       hostel={hostel}
      //       onPrev={() => {
      //         setActiveStep((a) => a - 1);
      //       }}
      //       onNext={(data) => {
      //         setFloor(data);
      //         setActiveStep((a) => a + 1);
      //       }}
      //     />
      //   );
      case 2:
        return (
          <FloorAndRoom
            activeStep={3}
            data={available_rooms[hostel.toLowerCase()]}
            hostel={hostel}
            studDetails={studDetails}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              // console.log(hostel, data);
            }}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="bg-[#f1f5f9] h-full w-full">
      <Header></Header>
      <div style={{ fontFamily: "sans-serif" }} className="bg-[#f1f5f9]">
        <Stepper
          steps={steps}
          activeStep={activeStep}
          defaultTitleColor="#000"
        />
      </div>
      <div className="px-5">{getComponent()}</div>
      <Footer></Footer>
    </div>
  );
};

export default OthersRoomAllocPage;
/* vi: set et sw=2: */
