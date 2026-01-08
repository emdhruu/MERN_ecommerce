import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hook";

const AdminRoute = ({children}: any) => {
    const { savedToken, loggedInUser } = useAppSelector(state => state.auth );

    if (!savedToken) return <Navigate to="/login" />;
    if (loggedInUser?.role !== 'admin') return <Navigate to="/" />;

    return children;
}

export default AdminRoute;