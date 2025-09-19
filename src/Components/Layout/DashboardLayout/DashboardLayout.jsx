import { Outlet } from "react-router-dom";
import { Navbar, TabsHeader } from "../..";


export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className=" px-6 py-6 space-y-8">
        <TabsHeader/>
        <Outlet />
      </div>
    </div>
  );
}
