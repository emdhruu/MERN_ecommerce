import { useForm } from "react-hook-form";
import { useAppSelector } from "../../../app/hook";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRegisterUserMutation } from "../authApi";

const Register = () => {
    const { loggedInUser} = useAppSelector((state)=> state.auth);
    const navigate = useNavigate();
    const [registerUser , { isLoading }] = useRegisterUserMutation();

   useEffect(() => {
     if (loggedInUser && !loggedInUser?.isVerified) {
         navigate("/verify-otp");
      }
   }, [loggedInUser]);

    type FormsValue = {
        name: string, 
        email: string, 
        password: string,   
        confirmPassword?: string
    }

    const {register, handleSubmit, reset, formState:{errors}} =useForm<FormsValue>();

   const onSubmit = async (data: FormsValue) => {
      try {
        const res = await registerUser(data).unwrap();
        toast.success(res.data.message);
        reset();
        navigate("/verify-otp");
      } catch (error: any) {
        toast.error(error?.data?.message || "Registration failed. Please try again.");
      }
   }

    return (
      <div className="w-full md:w-1/2 h-full xl:px-40 lg:px-10 px-0 flex flex-col items-center md:items-start pt-28 gap-3 bg-white">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold mb-4">Register</CardTitle>
            <CardDescription className="text-slate-500 font-light">
              We will send you an <b className="text-slate-600">One Time Password</b> on a provided mobile number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col w-full mt-6 gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                   <Label htmlFor="name" className="font-normal">Name  <span className="text-red-500">*</span></Label>
                   <Input 
                     type="text" 
                     id="name" 
                     className="border-slate-200 rounded-sm" 
                     placeholder="Micheal Scott" 
                     {...register("name", { required: "Name is required" })}
                   />
                   {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                   <Label htmlFor="email" className="font-normal">Email <span className="text-red-500">*</span></Label>
                   <Input 
                     type="email" 
                     id="email" 
                     className="border-slate-200 rounded-sm" 
                     placeholder="Michealscott@gmail.com"
                     {...register("email", { required: "Email is required", pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, message: "Enter a valid email" }})} 
                   />
                   {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                   <Label htmlFor="password" className="font-normal">Password  <span className="text-red-500">*</span></Label>
                   <Input 
                     type="password" 
                     id="password" 
                     className="border-slate-200 rounded-sm" 
                     placeholder="At least 8 characters" 
                     {...register("password",{required:"Password is required",pattern:{value:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,message:`at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters`}})}
                   />
                   {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                   <Label htmlFor="confirmPassword" className="font-normal">Confirm Password  <span className="text-red-500">*</span></Label>
                   <Input 
                     type="password" 
                     id="confirmPassword"
                     className="border-slate-200 rounded-sm" 
                     placeholder="Confirm your password" 
                     {...register("confirmPassword",{required:"Confirm Password is required",validate:(value,fromValues)=>value===fromValues.password || "Passwords doesn't match"})}
                   />
                   {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                </div>
                <Button variant="link" className="text-[#D54F47] text-end text-sm font-light p-0 h-auto justify-end hover:cursor-pointer">
                  Forget password?
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#D54F47] hover:bg-[#B8423B] rounded-md py-3 text-white mt-4">
                  {isLoading ? "User Registering..." : "Register"}
                </Button>
            </form>
            <p className="text-sm font-light mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-[#D54F47] font-semibold hover:underline hover:cursor-pointer">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
  )
}

export default Register