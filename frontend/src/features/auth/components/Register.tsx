import { useForm } from "react-hook-form";
import { clearRegisterError, registerAsync, resetRegisterStatus } from "../authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Register = () => {
    const dispatch = useAppDispatch();
    const {registerStatus, registerError, loggedInUser} = useAppSelector((state)=> state.auth);
    const navigate = useNavigate();

   useEffect(() => {
    if (registerError) {
      console.log("heloo", registerError);
      
      toast.error(registerError.message || "Registeration failed");
    }
   }, [registerError]);

   useEffect(() => {
     if (loggedInUser && !loggedInUser?.isVerified) {
         navigate("/verify-otp");
      }
   }, [loggedInUser]);

  useEffect(()=> {
    if(registerStatus === "fulfilled"){
      console.log(loggedInUser);
      
      toast.success("Welcome! Verify your email to start your endless shopping.");
      reset();
    }
    return ()=> {
      dispatch(clearRegisterError());
      dispatch(resetRegisterStatus());
    }
  },[registerStatus])

    type FormsValue = {
        name: string, 
        email: string, 
        password: string, 
        confirmPassword?: string
    }
    const {register, handleSubmit, reset, formState:{errors}} =useForm<FormsValue>();

   const onSubmit = (data: FormsValue) => {
      const cred = { name: data.name, email: data.email, password: data.password, confirmPassword: data.confirmPassword };
      delete cred.confirmPassword;
      dispatch(registerAsync(cred));
      reset();
   }

    return (
      <div className="w-1/2 h-full ps-28 flex flex-col items-start pt-28 gap-3">
            <h1 className="text-3xl font-semibold">Register</h1>

            <form className="flex flex-col w-3/4 mt-6 gap-4" onSubmit={handleSubmit(onSubmit)} >
                <div className="flex flex-col gap-2">
                   <label className="font-normal">Name  <span className="text-red-500">*</span></label>
                   <input type="text" id="name" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="Micheal Scott" 
                   {...register("name", { required: "Name is required" })}/>
                   {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                   <label className="font-normal">Email <span className="text-red-500">*</span></label>
                   <input type="email" id="email" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="Michealscott@gmail.com"
                   {...register("email", { required: "Email is required", pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, message: "Enter a valid email" }})} />
                   {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </div>
                <div className="flex flex-col mt-4 gap-2">
                   <label className="font-normal">Password  <span className="text-red-500">*</span></label>
                   <input type="password" id="password" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="At least 8 characters" 
                   {...register("password",{required:"Password is required",pattern:{value:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,message:`at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters`}})}/>
                   {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                </div>
                <div className="flex flex-col mt-4 gap-2">
                   <label className="font-normal">Confirm Password  <span className="text-red-500">*</span></label>
                   <input type="password" className="border border-slate-200 px-3 py-4 rounded-sm" placeholder="Confirm your password" 
                   {...register("confirmPassword",{required:"Confirm Password is required",validate:(value,fromValues)=>value===fromValues.password || "Passwords doesn't match"})}/>
                   {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
                </div>
                <button className="text-[#D54F47] text-end text-sm font-light">Forget password?</button>
                <button className="bg-[#D54F47] rounded-md py-3 text-white mt-4 cursor-pointer" type="submit">Register</button>
            </form>

            {/* <p className="text-sm font-light mt-8">Don't have an account? <Link to="/register" className="text-[#D54F47] font-semibold">Register</Link></p> */}
          </div>
  )
}

export default Register