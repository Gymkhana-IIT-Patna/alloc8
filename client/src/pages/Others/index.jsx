/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling
// Room allocation for everyone except freshers

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
import { useState } from "react";
import hostel_data from "@/data/hostel.json";

const steps = [
  { title: "Details" },
  { title: "Hostel" },
  { title: "Floor" },
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

      <Button type="submit">Next</Button>
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
    <>
      <form
        name="details"
        className="flexbox max-w-[700px] m-auto my-10 bg-slate-100 p-5 sm:p-20 rounded-xl"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <Label htmlFor="rollno" className="w-full">
          Roll No.
        </Label>
        <Input
          type="text"
          id="rollno"
          name="rollno"
          value={getRollNumber()}
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
              <SelectItem value="BTech21">BTech'21</SelectItem>
              <SelectItem value="BTech22">BTech'22</SelectItem>
              <SelectItem value="BTech23">BTech'23</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>M.Tech</SelectLabel>
              <SelectItem value="MTech23">MTech'23</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>M.Sc</SelectLabel>
              <SelectItem value="MSc23">MSc'23</SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel>Ph.D</SelectLabel>
              <SelectItem value="PhD14">PhD'14</SelectItem>
              <SelectItem value="PhD16">PhD'16</SelectItem>
              <SelectItem value="PhD17">PhD'17</SelectItem>
              <SelectItem value="PhD18">PhD'18</SelectItem>
              <SelectItem value="PhD19">PhD'19</SelectItem>
              <SelectItem value="PhD20">PhD'20</SelectItem>
              <SelectItem value="PhD21">PhD'21</SelectItem>
              <SelectItem value="PhD22">PhD'22</SelectItem>
              <SelectItem value="PhD23">PhD'23</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <hr />
        <ControlButtons
          onPrev={onPrev}
          activeStep={activeStep}
        ></ControlButtons>
      </form>
    </>
  );
};
const Hostel = ({ details, onNext, onPrev, activeStep }) => {
  const batchDetails = JSON.parse(hostel_data);
  console.log(batchDetails);
  console.log(details);

  let hostel_str = "";
  for (let i = 0; i < batchDetails.length; i++) {
    let batchDetail = batchDetails[i];
    if (
      batchDetail.batch.trim().toLowerCase() ===
        details.batch.trim().toLowerCase() &&
      batchDetail.gender.trim().toLowerCase() ===
        details.gender.trim().toLowerCase()
    ) {
      hostel_str = batchDetail.hostel;
      break;
    }
  }
  const available_hostels = hostel_str.split(",");
  console.log(available_hostels);

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
    <>
      <form
        name="details"
        className="flexbox max-w-[700px] m-auto my-10 bg-slate-100 p-5 sm:p-20 rounded-xl"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
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
                  <div className="flex flex-wrap items-center space-x-2 px-10 py-16 bg-slate-300 rounded-lg ">
                    <RadioGroupItem value={hostel} id={hostel} />

                    <span className="block ml-5">{hostel}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        <hr />
        <ControlButtons
          onPrev={onPrev}
          activeStep={activeStep}
        ></ControlButtons>
      </form>
    </>
  );
};
const Floor = ({ onNext, onPrev, activeStep, details }) => {
  console.log(details);
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const floor = data.get("floor");
    if (!floor) {
      alert("Please select a floor");
      return;
    }
    onNext(floor);
  };
  return (
    <>
      <form
        name="details"
        className="flexbox max-w-[700px] m-auto my-10 bg-slate-100 p-5 sm:p-20 rounded-xl"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <b className="text-xl">{details.hostel}</b>
        <Label htmlFor="floor" className="mt-3">
          Choose Floor
        </Label>
        <RadioGroup id="floor" name="floor" className="flex w-full flex-wrap">
          {["Ground", 1, 2, 3, 4, 5, 6, 7].map((floor) => {
            return (
              <div key={floor} className="w-full">
                <Label htmlFor={floor} className="text-lg">
                  <div className="flex flex-wrap items-center space-x-2 p-5  bg-slate-300 rounded-lg ">
                    <RadioGroupItem value={floor} id={floor} />

                    <span className="block ml-5">{floor}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        <hr />
        <ControlButtons
          onPrev={onPrev}
          activeStep={activeStep}
        ></ControlButtons>
      </form>
    </>
  );
};
const Room = ({ onNext, onPrev, activeStep, details }) => {
  console.log(details);
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const details = {
      rollno: getRollNumber(),
      gender: data.get("gender"),
      batch: data.get("batch"),
    };
    onNext(details);
  };
  return (
    <>
      <form
        name="details"
        className="flexbox max-w-[700px] m-auto my-10 bg-slate-100 p-5 sm:p-20 rounded-xl"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <hr />
        <ControlButtons
          onPrev={onPrev}
          activeStep={activeStep}
        ></ControlButtons>
      </form>
    </>
  );
};
const OthersRoomAllocPage = () => {
  const [details, setDetails] = useState({});
  let [activeStep, setActiveStep] = useState(0);

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
              setDetails(data);
              setActiveStep((a) => a + 1);
            }}
          />
        );
      case 1:
        return (
          <Hostel
            details={details}
            activeStep={1}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setDetails((detail) => {
                detail.hostel = data;
                return detail;
              });
              setActiveStep((a) => a + 1);
            }}
          />
        );
      case 2:
        return (
          <Floor
            activeStep={2}
            details={details}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setDetails((detail) => {
                detail.floor = data;
                return detail;
              });
              setActiveStep((a) => a + 1);
            }}
          />
        );
      case 3:
        return (
          <Room
            activeStep={3}
            details={details}
            onPrev={() => {
              setActiveStep((a) => a - 1);
            }}
            onNext={(data) => {
              setDetails(data);
              setActiveStep((a) => a + 1);
            }}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div>
      <Header></Header>
      <div style={{ fontFamily: "sans-serif" }}>
        <Stepper
          steps={steps}
          activeStep={activeStep}
          defaultTitleColor="#000"
        />
      </div>
      {getComponent()}
    </div>
  );
};

export default OthersRoomAllocPage;
