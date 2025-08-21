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

import { useEffect, useState } from "react";
import hostel_data from "@/../../data-gen/available_rooms.json";
import emailmap from "@/../../data-gen/email_map.json";
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
import { BrowserAuthError, InteractionRequiredAuthError } from "@azure/msal-browser";
import { getName } from "@/lib/auth_utility";

const steps = [
  { title: "Hostel" },
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

const Hostel = ({ data, onNext, onPrev, activeStep }) => {
  const batchDetails = {};
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
                <div className="flex flex-wrap items-center space-x-2 px-10 py-16 bg-slate-200 rounded-lg">
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
  idToken
}) => {
  const floors = Object.keys(data);
  const [floor, setFloor] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [rooms, setRooms] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const navigate = useNavigate();

  const updateRooms = () => {
    if (
      !floor ||
      !hostel ||
      !idToken
    ) {
      return;
    }
    const postBody = {
      hostel: hostel.toLowerCase(),
      floor: floor.toString(),
    };

    setLoading(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/nonfresher/room-status`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Alloc8-IDToken": idToken,
      },
      body: JSON.stringify(postBody),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        // console.log(data);
        let rooms = data.rooms;
        rooms.sort((a, b) => a.roomNum - b.roomNum);
        setRoomData(data.rooms);
      });
  };
  const [roommateCode, setRoommateCode] = useState("");
  const bookRoom = (roomId) => {
    if (!idToken) return;
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/nonfresher/room-booking`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Alloc8-IDToken": idToken,
      },
      body: JSON.stringify({
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
  };
  useEffect(() => {
    updateRooms();
  }, [hostel, floor, idToken]);
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
                      { room.capacity != room.numFilled &&
                        <div className="text-purple-700 my-5">
                          <div className="font-semibold">Room Members: </div>
                          {room.students.length == 0
                            ? "Empty Until Now"
                            : room.students.map((stud) => {
                                return <div key={stud}>{stud}</div>;
                              })}
                        </div>
                      }
                      <div
                        className="my-5"
                        style={{
                          display:
                            getRoomStatus(room) == "Partial" &&
                            !room.codeExpired
                              ? "block"
                              : "none",
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
                              roommateCode.length == 0 &&
                              room.roommateCode &&
                              room.roommateCode.length != 0) ||
                            getRoomStatus(room) == "Full"
                          }
                        >
                          { getRoomStatus(room) == "Full" ? "Already Booked" : "Book Room" }
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
  const { instance } = useMsal();
  const [idToken, setIdToken] = useState();
  const [ name, setName ] = useState();
  const [ availableRooms, setAvailableRooms ] = useState([]);
  const request = { scopes: [] };

  useEffect(() => {
    instance.acquireTokenSilent(request).then(tokenResponse => {
      setIdToken(tokenResponse.idToken);
      setName(tokenResponse.idTokenClaims.name);
      const { batch, gender } = emailmap[tokenResponse.idTokenClaims.email];
      setAvailableRooms(hostel_data[batch][gender]["hostels"]);
    }).catch(async (error) => {
      if (error instanceof InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        return msalInstance.acquireTokenRedirect(request);
      } else if (error instanceof BrowserAuthError) {
        navigate("/");
        return;
      }

      // handle other errors
      console.log(error);
    });
  }, [instance]);
  let [activeStep, setActiveStep] = useState(0);
  const [hostel, setHostel] = useState("");
  // const [floor, setFloor] = useState(0);

  const getComponent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Hostel
            data={availableRooms}
            activeStep={0}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setHostel(data);
              setActiveStep((a) => a + 1);
            }}
          />
        );
      case 1:
        return (
          <FloorAndRoom
            activeStep={1}
            data={availableRooms[hostel.toLowerCase()]}
            hostel={hostel}
            idToken={idToken}
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
      <Header name={name}></Header>
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
