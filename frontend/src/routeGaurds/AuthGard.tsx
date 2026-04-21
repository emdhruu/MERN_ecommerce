import { useAppSelector } from "@/app/hook";
import { Navigate } from "react-router-dom";

const AuthGard = ({ children }: { children: React.ReactNode}) => {
    const { status, user } = useAppSelector(state => state.auth);
    console.log("Status in auth", status);
    console.log("user", user);
    
    
    // If status is undefined or idle, redirect to login
    if (status === "idle") {
        return <Navigate to="/login" replace />;
    } 

    // If status is not authenticated, redirect to login
    if (status !== "authenticated") {
        return <Navigate to="/login" replace />
    }
    
    return (
        <>{children}</>
    )
}

export default AuthGard