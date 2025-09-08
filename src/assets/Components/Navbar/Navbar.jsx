import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full shadow-sm bg-white ">
      <div className=" flex  items-center justify-between px-7 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
            <Brain className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold font-serif text-gray-900">
            Revisily
          </span>
        </Link>
        <Link
          to="/signIn"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
