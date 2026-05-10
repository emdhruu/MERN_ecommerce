import Sidebar from "@/features/adminPanel/dashboard/components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-row">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content - Always maintains proper margin to avoid sidebar area */}
      <div className="flex-1 h-screen overflow-y-auto bg-blue-50 transition-all duration-300 ease-in-out ml-16 lg:ml-60">
        <div className="p-3">
          <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout