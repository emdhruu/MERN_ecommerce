import type { ReactNode } from "react";
import { useAppSelector } from "../app/hook";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireUnVerified?: boolean;
    requiredRole?: string;
}

const ProtectedRoute = ({ children, requireAuth, requireUnVerified, requiredRole } : AuthRouteProps) => {
    const { user, status } = useAppSelector(state => state.auth);
    console.log("user", user?.isVerified);
    console.log("status in protected route", status);
    
    
    if (status === "idle" ) {
        return null; // or a loading spinner
    }

    if (requireAuth && status !== "authenticated") {
        return <Navigate to="/login" replace />
    }
    
    if (requireUnVerified) {
        if (!user) {
            return <Navigate to="/login" replace />
        } 
        if (status === "authenticated" && user?.isVerified) {
            return <Navigate to={`/${user.role === "admin" ? "admin/dashboard" : "profile"}`} replace />
        }
    }
    
    if (requiredRole && (!user || user.role !== requiredRole)) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}   


export default ProtectedRoute;