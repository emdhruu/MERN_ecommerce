import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { useForm } from "react-hook-form";
import { clearLoginError, loginAsync, resetLoginStatus } from "../authSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  type FormValues = {
    email: string,
    password: string
  }

  const dispatch = useAppDispatch();
  const {register, handleSubmit, reset, formState: {errors}} = useForm<FormValues>();
  const {loginStatus, loginError, loggedInUser } = useAppSelector((state)=> state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginError) {
      console.log("heloo",loginError);
      
      toast.error(loginError.message || "Login failed");
    }
  }, [loginError]);

  useEffect(() => {
    if (loginStatus === "fulfilled" && !loggedInUser?.isVerified) {
      navigate("/verify-otp");
    }
  }, [loggedInUser]);

  useEffect(()=> {
    if(loginStatus === "fulfilled" && loggedInUser?.isVerified === true){
      toast.success("User LoggedIn Successfully.");
      reset();
    }
    return ()=> {
      dispatch(clearLoginError());
      dispatch(resetLoginStatus());
    }
  },[loginStatus])

  const onSubmit = (data: any) => {
    console.log(data);
    const cred = {email: data.email, password: data.password};
    dispatch(loginAsync(cred));
  }

  return (  
          <div className="w-1/2 h-full ps-28 flex flex-col items-start pt-28 gap-3">
            <h1 className="text-3xl font-semibold mb-4">Welcome to MERN-EKART</h1>
            <p className="text-slate-500 font-light">Get started for a seamless shopping experience</p>

            <form className="flex flex-col w-3/4 mt-8 gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                   <label className="font-normal">Email <span className="text-red-500">*</span></label>
                   <input type="email" id="email" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="Michealscott@gmail.com"
                   {...register("email", { required: "Email is required", pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, message: "Enter a valid email" }})} />
                   {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </div>
                <div className="flex flex-col mt-4 gap-2">
                   <label className="font-normal">Password  <span className="text-red-500">*</span></label>
                   <input type="password" id="password" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="At least 8 characters" 
                   {...register("password", { required: "Password is required" })}/>
                   {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                </div>
                <button className="text-[#D54F47] text-end text-sm font-light">Forget password?</button>
                <button className="bg-[#D54F47] rounded-md py-3 text-white mt-4 cursor-pointer" type="submit">Login</button>
            </form>

            <p className="text-sm font-light mt-8">Don't have an account? <Link to="/register" className="text-[#D54F47] font-semibold">Register</Link></p>
          </div>
  )
}

export default Login;