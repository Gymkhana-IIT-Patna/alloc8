import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import data from "@/data/formoptions.json";
import Options from "../FormOptions";
import Select from "react-select";
import { Button } from "../ui/button";
import "./index.css";
import { useMsal } from "@azure/msal-react";

export default function SmpForm() {
  const languages = data.languages;
  const futureinterests = data.Future_Interests;
  const places = data.places;
  const branches = data.branches;
  const nature = data.nature;
  const sleep_nature = data.sleep_nature;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { accounts, instance } = useMsal();

  const accessTokenRequest = {
    account: accounts[0],
  };


  const handleReset = () => {
    instance.acquireTokenSilent(accessTokenRequest).then(res => {
      fetch(`${import.meta.env.VITE_SERVER_URL}/api/smp/reset-details`, {
        method: "PUT",
        headers: {
          "X-Alloc8-IDToken": res.idToken,
        }
      }).then(res => {
        if (res.status == 200) {
          alert("Deleted your record successfully, you can submit again now");
        } else {
          alert("Could not find your record to delete, it does not exist in the database");
        }
      });
    });
  }

  const onSubmit = (formData) => {
    // console.log(formData);
    instance.acquireTokenSilent(accessTokenRequest).then((res) => {
      fetch(`${import.meta.env.VITE_SERVER_URL}/api/smp/submit-details`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Alloc8-IDToken": res.idToken,
        },
        body: JSON.stringify(formData),
      }).then((res) => {
        // console.log(res);
        if (res.status == 201) {
          navigate("/waiting");
        } else {
          res.json().then(res => alert("Error in submitting the form: " + res.error));
        }
      });
    });
  };

  const languageOptions = languages.map((language) => ({
    value: language,
    label: language,
  }));

  return (
    <div className="max-w-2xl mx-auto px-10 pt-[3em] pb-[5em] rounded-[23px] md:rounded-[33px] bg-white shadow-lg">
      <h2 className="text-4xl font-medium text-[#000000] text-center mb-[1em]">
        Register
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 text-lg"
      >
        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Branch<span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Select"
            {...register("branch", {
              validate: (value) => value !== "Select" || "Branch is required",
            })}
            className={`mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.branch ? "border-red-500" : ""
            }`}
          >
            <Options array={branches} />
          </select>
          {errors.branch && (
            <p className="text-red-500">{errors.branch.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            State<span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Select"
            {...register("placeOfLiving", {
              validate: (value) => value !== "Select" || "State is required",
            })}
            className={`mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.placeOfLiving ? "border-red-500" : ""
            }`}
          >
            <Options array={places} />
          </select>
          {errors.placeOfLiving && (
            <p className="text-red-500">{errors.placeOfLiving.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Languages Spoken<span className="text-red-500">*</span>
          </label>
          <div className="w-2/3 input-container">
            <Controller
              name="motherTongue"
              control={control}
              defaultValue={[]}
              rules={{
                validate: (value) =>
                  value.length > 0 || "At least one language must be selected",
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={languageOptions}
                  className={`multiselect mt-2 ${
                    errors.motherTongue ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500`}
                  classNamePrefix="select"
                  placeholder="Select languages"
                  onChange={(selectedOptions) =>
                    field.onChange(selectedOptions)
                  }
                  value={field.value}
                />
              )}
            />
            {errors.motherTongue && (
              <p className="text-red-500">{errors.motherTongue.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Sports Hobbies<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("sportsHobbies", {
              required: "Sports Hobbies are required",
            })}
            className={`overflow-auto mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 resize-none h-[75px] ${
              errors.sportsHobbies ? "border-red-500" : ""
            }`}
          />
          {errors.sportsHobbies && (
            <p className="text-red-500">{errors.sportsHobbies.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Tech Hobbies<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("techHobbies", {
              required: "Tech Hobbies are required",
            })}
            className={`overflow-auto h-[75px] resize-none mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.techHobbies ? "border-red-500" : ""
            }`}
            onInput={(e) => {
              e.target.style.height = "35px"; // reset the height
              e.target.style.height = `${e.target.scrollHeight}px`; // adjust height based on content
            }}
          />
          {errors.techHobbies && (
            <p className="text-red-500">{errors.techHobbies.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Cultural Hobbies<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("culturalHobbies", {
              required: "Cultural Hobbies are required",
            })}
            className={`overflow-auto h-[75px] resize-none mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.culturalHobbies ? "border-red-500" : ""
            }`}
            onInput={(e) => {
              e.target.style.height = "35px"; // reset the height
              e.target.style.height = `${e.target.scrollHeight}px`; // adjust height based on content
            }}
          />
          {errors.culturalHobbies && (
            <p className="text-red-500">{errors.culturalHobbies.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Your Nature (Introvert / Extrovert)
            <span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Select"
            {...register("nature", {
              validate: (value) => value !== "Select" || "Nature is required",
            })}
            className={`mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.nature ? "border-red-500" : ""
            }`}
          >
            <Options array={nature} />
          </select>
          {errors.nature && (
            <p className="text-red-500">{errors.nature.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Future Interests<span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Select"
            {...register("futureInterests", {
              validate: (value) =>
                value !== "Select" || "Future Interests are required",
            })}
            className={`mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 ${
              errors.futureInterests ? "border-red-500" : ""
            }`}
          >
            <Options array={futureinterests} />
          </select>
          {errors.futureInterests && (
            <p className="text-red-500">{errors.futureInterests.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            CPI<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("cpi", {
              required: "CPI is required (Enter 10 if you are a fresher)",
            })}
            className={`overflow-auto mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 resize-none h-[75px] ${
              errors.cpi ? "border-red-500" : ""
            }`}
          />
          {errors.cpi && (
            <p className="text-red-500">{errors.cpi.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 input-container">
          <label className="w-1/3">
            Remarks<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("remarks", {
              required: "Remarks are required (Enter 'None' if no remarks)",
            })}
            className={`overflow-auto mt-2 border-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none w-2/3 resize-none h-[75px] ${
              errors.remarks ? "border-red-500" : ""
            }`}
          />
          {errors.remarks && (
            <p className="text-red-500">{errors.remarks.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="inline-flex items-center justify-center text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 bg-black text-white hover:bg-gray-800 h-12 px-6 rounded-md w-full md:w-auto mx-auto"
        >
          Submit
        </Button>
      </form>
      <br />
      <div
        className="flex flex-col gap-6 text-lg"
      >
        <button
          onClick={handleReset}
          className="inline-flex items-center justify-center text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 bg-black text-white hover:bg-gray-800 h-12 px-6 rounded-md w-full md:w-auto mx-auto"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
}
/* vi: set et sw=2: */
