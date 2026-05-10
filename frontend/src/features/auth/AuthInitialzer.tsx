import { useAppDispatch, useAppSelector } from "@/app/hook";
import { useEffect, useRef } from "react";
import { authApi } from "./authApi";
import { logout } from "./authSlice";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const hasInitialized = useRef(false);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const isInitialized = useAppSelector((state) => state.auth.isInitialized);

    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      if (!accessToken && !isInitialized) {
        dispatch(authApi.endpoints.refresh.initiate(undefined));
      }
    }, [dispatch, accessToken, isInitialized]);

  return (
    <>{children}</>
  )
}

export default AuthInitializer;