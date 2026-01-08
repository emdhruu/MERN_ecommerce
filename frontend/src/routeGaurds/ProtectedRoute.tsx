import { useAppSelector } from "../app/hook";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children } : any) => {
    const { savedToken } = useAppSelector(state => state.auth );
    return savedToken ? children : <Navigate to="/login" />
}   

export default ProtectedRoute;