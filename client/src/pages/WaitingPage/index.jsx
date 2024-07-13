import Header from "@/components/Header";

export default function WaitingPage() {
  return (
    <div className="flex flex-col gap-10 bg-slate-100">
      <Header />
      <div className="h-full w-full text-center flex flex-col gap-5 items-center font-bold text-4xl  text-[#538ff8]">
        <h2>Registered Succefully!</h2>
        <p>
          Your detail have been saved! <br />
            Kindly visit the site after 20th July to view your alloted room.
        </p>
      </div>
    </div>
  );
}
