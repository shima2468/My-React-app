import { NavLink } from "react-router-dom";

const base =
  "flex-1 h-9 rounded-xl text-sm font-semibold grid place-items-center transition";
const active   = "bg-white text-slate-900 border border-slate-200 shadow-sm";
const inactive = "text-slate-700 hover:text-slate-900";

export default function TabsHeader() {
  return (
    <div className="flex gap-2 rounded-xl  bg-[#f5f5f5] p-1 w-full" role="tablist">
      <NavLink to="/dashboard" end className={({ isActive }) => [base, isActive ? active : inactive].join(" ")} role="tab">
        Overview
      </NavLink>
      <NavLink to="/dashboard/materials" className={({ isActive }) => [base, isActive ? active : inactive].join(" ")} role="tab">
        My Materials
      </NavLink>
      <NavLink to="/dashboard/tools" className={({ isActive }) => [base, isActive ? active : inactive].join(" ")} role="tab">
        AI Tools
      </NavLink>
    </div>
  );
}
