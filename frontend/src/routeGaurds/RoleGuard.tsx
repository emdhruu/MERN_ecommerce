import { useAppSelector } from "@/app/hook";
import { Navigate } from "react-router-dom";

const RoleGuard = ({ children, role }: { children: React.ReactNode, role: string }) => {
    const { user } = useAppSelector(state => state.auth);
    console.log(user);
    
    if (!user || user.role !== role) {
        return <Navigate to="/" replace />
    }

    return (
        <>{children}</>
    )
}

export default RoleGuard;