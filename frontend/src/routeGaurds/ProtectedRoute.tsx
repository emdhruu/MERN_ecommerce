import type { ReactNode } from "react";
import { useAppSelector } from "../app/hook";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireVerified?: boolean;
    requiredRole?: string;
}

const ProtectedRoute = ({ children, requireAuth, requireVerified, requiredRole } : AuthRouteProps) => {
    const { savedToken, loggedInUser } = useAppSelector(state => state.auth);
    console.log(loggedInUser);
    
    if (requireAuth && !savedToken) {
        return <Navigate to="/login" replace />
    }

    if (requireVerified && loggedInUser && !loggedInUser.isVerified) {
        return <Navigate to="/verify-otp" replace />
    }

    console.log("loggedinuser",loggedInUser?.role);
    console.log("requiredrole", requiredRole);
    
    if (requiredRole && loggedInUser && loggedInUser.role !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}   


export default ProtectedRoute;