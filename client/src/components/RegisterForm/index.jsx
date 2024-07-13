import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';
import data from '@/data/formoptions.json';
import Options from '../FormOptions';
import Select from 'react-select';

export default function Registerform() {
  const languages = data.languages;
  const futureinterests = data.Future_Interests;
  const places = data.places;
  const branches = data.branches;
  const nature = data.nature;
  const sleep_nature = data.sleep_nature;
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = (formData) => {
    console.log(formData);
    navigate("/waiting");
  };

  const languageOptions = languages.map(language => ({ value: language, label: language }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[100%] flex flex-col gap-4 text-[17px]"
    >
      <div>
        <label>Roll Number<span className="text-red-500">*</span></label>
        <input
          {...register("rollnum", { required: "Roll Number is required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.rollnum ? 'border-red-500' : ''}`}
        />
        {errors.rollnum && <p className="text-red-500">{errors.rollnum.message}</p>}
      </div>
      
      <div>
        <label>Languages Spoken<span className="text-red-500">*</span></label>
        <Controller
          name="motherTongue"
          control={control}
          defaultValue={[]}
          rules={{ validate: value => value.length > 0 || 'At least one language must be selected' }}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={languageOptions}
              className={`mt-2 ${errors.motherTongue ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 hover:border-blue-500 w-full`}
              classNamePrefix="select"
              placeholder="Select languages"
              onChange={(selectedOptions) => field.onChange(selectedOptions)}
              value={field.value}
            />
          )}
        />
        {errors.motherTongue && <p className="text-red-500">{errors.motherTongue.message}</p>}
      </div>

      <div>
        <label>State<span className="text-red-500">*</span></label>
        <select
          defaultValue="Select"
          {...register("placeOfLiving", { validate: value => value !== "Select" || "State is required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.placeOfLiving ? 'border-red-500' : ''}`}
        >
          <Options array={places} />
        </select>
        {errors.placeOfLiving && <p className="text-red-500">{errors.placeOfLiving.message}</p>}
      </div>

      <div>
        <label>Branch<span className="text-red-500">*</span></label>
        <select
          defaultValue="Select"
          {...register("branch", { validate: value => value !== "Select" || "Branch is required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.branch ? 'border-red-500' : ''}`}
        >
          <Options array={branches} />
        </select>
        {errors.branch && <p className="text-red-500">{errors.branch.message}</p>}
      </div>

      <div>
        <label>Sports Hobbies<span className="text-red-500">*</span></label>
        <input
          {...register("sportsHobbies", { required: "Sports Hobbies are required" })}
          type="text"
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.sportsHobbies ? 'border-red-500' : ''}`}
        />
        {errors.sportsHobbies && <p className="text-red-500">{errors.sportsHobbies.message}</p>}
      </div>

      <div>
        <label>Tech Hobbies<span className="text-red-500">*</span></label>
        <input
          {...register("techHobbies", { required: "Tech Hobbies are required" })}
          type="text"
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.techHobbies ? 'border-red-500' : ''}`}
        />
        {errors.techHobbies && <p className="text-red-500">{errors.techHobbies.message}</p>}
      </div>

      <div>
        <label>Cultural Hobbies<span className="text-red-500">*</span></label>
        <input
          {...register("culturalHobbies", { required: "Cultural Hobbies are required" })}
          type="text"
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.culturalHobbies ? 'border-red-500' : ''}`}
        />
        {errors.culturalHobbies && <p className="text-red-500">{errors.culturalHobbies.message}</p>}
      </div>

      <div>
        <label>Your Nature (Introvert / Extrovert)<span className="text-red-500">*</span></label>
        <select
          defaultValue="Select"
          {...register("nature", { validate: value => value !== "Select" || "Nature is required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.nature ? 'border-red-500' : ''}`}
        >
          <Options array={nature} />
        </select>
        {errors.nature && <p className="text-red-500">{errors.nature.message}</p>}
      </div>

      <div>
        <label>Future Interests<span className="text-red-500">*</span></label>
        <select
          defaultValue="Select"
          {...register("futureInterests", { validate: value => value !== "Select" || "Future Interests are required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.futureInterests ? 'border-red-500' : ''}`}
        >
          <Options array={futureinterests} />
        </select>
        {errors.futureInterests && <p className="text-red-500">{errors.futureInterests.message}</p>}
      </div>

      <div>
        <label>Sleep Schedule<span className="text-red-500">*</span></label>
        <select
          defaultValue="Select"
          {...register("sleep", { validate: value => value !== "Select" || "Sleep Schedule is required" })}
          className={`mt-2 border-b-2 border-gray-300 focus:border-blue-500 px-4 focus:outline-none hover:border-blue-500 w-full ${errors.sleep ? 'border-red-500' : ''}`}
        >
          <Options array={sleep_nature} />
        </select>
        {errors.sleep && <p className="text-red-500">{errors.sleep.message}</p>}
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 bg-[#000000] text-white hover:bg-[#303030] h-10 px-4 py-2 lg:text-lg w-full md:w-2/5 rounded-md lg:py-6"
      >
        Submit
      </button>
    </form>
  );
}
