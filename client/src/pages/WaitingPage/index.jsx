import Header from "@/components/Header";

export default function WaitingPage() {
  return (
    <div className="flex flex-col gap-10 bg-slate-100">
      <Header />
      <div className="h-full w-full p-6 flex justify-center">
        <div className="md:w-4/5 lg:w-3/5 xl:2/5 shadow-lg rounded-lg bg-slate-50 flex flex-col gap-5  text-center  items-center font-bold p-6 text-[18px] sm:text-xl  text-[#538ff8]">
        <h2 className="text-2xl sm:text-3xl">Registered Succefully!</h2>
        <p>
          Your detail have been saved! <br />
            Kindly visit the site after 20th July to view your alloted room.
        </p></div>
      </div>
    </div>
  );
}
