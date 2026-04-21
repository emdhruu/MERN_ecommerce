import { useAppDispatch } from "@/app/hook";
import { useEffect } from "react";
import { authApi } from "./authApi";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(authApi.endpoints.refresh.initiate(undefined));
    }, [dispatch]);
  return (
    <>{children}</>
  )
}

export default AuthInitializer;