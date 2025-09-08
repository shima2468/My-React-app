import { Outlet } from "react-router-dom";
import Navbar from "@/assets/Components/Navbar/Navbar.jsx";
import TabsHeader from "@/assets/Components/TabsHeader/TabsHeader.jsx";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className=" px-6 py-6 space-y-8">
        <TabsHeader />
        <Outlet />
      </div>
    </div>
  );
}
