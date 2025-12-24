import { useAppSelector } from "../app/hook";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children } : any) => {
    const { token } = useAppSelector(state => state.auth );
    return token ? children : <Navigate to="/login" />
}   

export default ProtectedRoute;