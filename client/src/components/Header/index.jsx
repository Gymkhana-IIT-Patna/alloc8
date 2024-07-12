import { getName } from "@/lib/auth_utility";
import { User } from "lucide-react";

function Header() {
  return (
    <div className="w-screen h-[60px] leading-[60px] py-2 px-5 bg-slate-100 relative">
      <img src="/logo.png" className="h-[30px] my-[5px]" alt="Alloc8" />
      <div className="flexbox absolute right-5 top-0 h-[60px] w-auto">
        <div>{getName()}</div>
        <div className="avatar">
          <User></User>
        </div>
      </div>
    </div>
  );
}
export default Header;
