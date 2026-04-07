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
    const { savedToken, loggedInUser } = useAppSelector(state => state.auth);
    console.log(loggedInUser);
    
    if (requireAuth && !savedToken) {
        return <Navigate to="/login" replace />
    }

    if (requireUnVerified) {
        if (!loggedInUser) {
            return <Navigate to="/login" replace />
        } else if (loggedInUser.isVerified) {
            return <Navigate to={`/${loggedInUser.role === "admin" ? "admin/dashboard" : "profile"}`} replace />
        }
    }

    console.log("loggedinuser",loggedInUser?.role);
    console.log("requiredrole", requiredRole);
    
    if (requiredRole && (!loggedInUser || loggedInUser.role !== requiredRole)) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}   


export default ProtectedRoute;