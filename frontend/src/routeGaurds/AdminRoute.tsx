import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hook";

const AdminRoute = ({children}: any) => {
    const { token, user } = useAppSelector(state => state.auth );

    if (!token) return <Navigate to="/login" />;
    if (user?.role !== 'admin') return <Navigate to="/" />;

    return children;
}

export default AdminRoute;