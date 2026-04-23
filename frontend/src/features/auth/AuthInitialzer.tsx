import { useAppDispatch } from "@/app/hook";
import { useEffect, useRef } from "react";
import { authApi } from "./authApi";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const hasInitialized = useRef(false);

    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      dispatch(authApi.endpoints.refresh.initiate(undefined));
    }, [dispatch]);
  return (
    <>{children}</>
  )
}

export default AuthInitializer;