import { useAppSelector } from "@/app/hook";
import { Navigate } from "react-router-dom";

const AuthGard = ({ children }: { children: React.ReactNode}) => {
    const { status, user, isInitialized } = useAppSelector(state => state.auth);
    console.log("Status in auth", status);
    console.log("user", user);
    //check
    // Show loading while checking authentication
    if (!isInitialized) {
        return <div>Loading...</div>; // You can replace with a proper loading component
    }
    
    // If status is undefined or idle, redirect to login
    if (!status || status === "idle") {
        return <Navigate to="/login" replace />;
    } 

    // If status is not authenticated, redirect to login
    if (status !== "authenticated") {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <>{children}</>
    )
}

export default AuthGard;