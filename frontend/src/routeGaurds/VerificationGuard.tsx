import { useAppSelector } from "@/app/hook";
import { Navigate } from "react-router-dom";

const VerificationGuard = ({children}: {children: React.ReactNode}) => {
    const { user } = useAppSelector(state => state.auth);
    if (!user) {
        return <Navigate to="/login" replace />
    }
    if (user.isVerified) {
        return <Navigate to={`/${user.role === "admin" ? "admin/dashboard" : "profile"}`} replace />
    }

    return (
        <>{children}</>
    )
}

export default VerificationGuard;