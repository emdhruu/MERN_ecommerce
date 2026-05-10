import { useAppSelector } from "@/app/hook";
import { Navigate } from "react-router-dom";

const AuthGard = ({ children }: { children: React.ReactNode}) => {
    const { status, isInitialized } = useAppSelector(state => state.auth);

    if (!isInitialized) {
        return <div>Loading...</div>;
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