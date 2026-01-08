import { Outlet } from "react-router-dom";
import RightPanel from "../features/auth/components/RightPanel";

const AuthLayout = () => {
  return (
    <div className="h-screen flex">
        {/* Left Panel */}
        <Outlet/>
        {/* Right Panel */}
        <RightPanel/>
    </div>
  )
}

export default AuthLayout