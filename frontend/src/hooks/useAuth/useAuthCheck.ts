import { useEffect } from "react";
import { checkAuthAsync } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../app/hook";

export const useAuthCheck = () => {
    const dispatch = useAppDispatch();

    useEffect(()=> {
        dispatch(checkAuthAsync())
    },[dispatch]);
}