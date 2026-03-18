import { useAppSelector } from "../../../app/hook";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "../authApi";

const Login = () => {
  type FormValues = {
    email: string,
    password: string
  }
  const [login, { isLoading }] = useLoginMutation();
  const {register, handleSubmit, reset, formState: {errors}} = useForm<FormValues>();
  const { loggedInUser } = useAppSelector((state)=> state.auth);
  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
   try {
    const res = await login(data).unwrap();

    toast.success(res.data.message);
    reset();

    if (!res.user.isVerified) {
      navigate("/verify-otp");
    } else {
      navigate(res.user.role === "admin" ? "/admin/dashboard" : "/profile"); 
    }
   } catch (error: any) {
    toast.error(error?.data?.message || "Login failed. Please check your credentials and try again.");
   }
  }

  useEffect(() => {
    if (loggedInUser){
      if (!loggedInUser.isVerified ) {
        navigate("/verify-otp");
      } else {
        navigate(loggedInUser.role === "admin" ? "/admin/dashboard" : "/profile");
      }
    }
  }, [loggedInUser]);

  return (  
    <div className="w-full md:w-1/2 h-full xl:px-40 lg:px-10 px-0 flex flex-col items-center md:items-start pt-28 gap-3 bg-white">
      <Card className="w-full max-w-md border-0 shadow-none ">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold mb-4">
            Welcome to MERN-EKART
          </CardTitle>
          <CardDescription className="text-slate-500 font-light">
            Get started for a seamless shopping experience
          </CardDescription>  
        </CardHeader>
        <CardContent>
          <form className="flex flex-col w-full mt-8 gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-normal">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Michealscott@gmail.com"
                className="border-slate-200 rounded-sm w-full"
                {...register("email", { 
                  required: "Email is required", 
                  pattern: {
                    value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, 
                    message: "Enter a valid email" 
                  }
                })} 
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div className="flex flex-col mt-4 gap-2">
              <Label htmlFor="password" className="font-normal">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                id="password"
                placeholder="At least 8 characters"
                className="border-slate-200 rounded-sm"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>
            <Button variant="link" className="text-[#D54F47] text-end text-sm font-light p-0 h-auto justify-end hover:cursor-pointer">
              Forget password?
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#D54F47] hover:bg-[#B8423B] rounded-md py-3 text-white mt-4">
              {isLoading ? "Logging in..." : "Login" }
            </Button>
          </form>
          <p className="text-sm font-light mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#D54F47] font-semibold hover:underline hover:cursor-pointer">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login;