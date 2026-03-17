import { Outlet } from "react-router-dom";
import RightPanel from "../features/auth/components/RightPanel";

const AuthLayout = () => {
  return (
    <div className="h-screen flex">
        {/* Left Panel */}
        <Outlet/>
        {/* Right Panel */}
        <div className="hidden md:block w-1/2 h-full">
          <RightPanel/>
        </div>
    </div>
  )
}

export default AuthLayout