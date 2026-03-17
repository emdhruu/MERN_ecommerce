import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const correctOtp = "123456";
const OtpLength = 6;

const VerifyOtp = () => { 
  const [otp, setOtp] = useState<string[]>(new Array(OtpLength).fill(""));
  const [otpError , setOtpError] = useState<string | null>(null);
  const [triggerShake , setTriggerShake] = useState<boolean>(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasEmpty = otp.some((digit)=> digit === "");
    
    if (hasEmpty) {
      triggerError("Please enter all digits");
      return;
    }

    const otpValue = otp.join("");
      
    if (otpValue !== correctOtp) {
      triggerError("Invalid OTP. Please try again.");
      return;
    }

    setOtpError(null);
    console.log("OTP Entered: ", otpValue);
  }

  const handleChange = (value: string, index: number)=> {
    setOtpError(null);

    if (!/^[0-9]?$/.test(value)) {
      triggerError("Only numbers are allowed");
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    
    if(value && index < OtpLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number)=> {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0){
      inputsRef.current[index - 1]?.focus();
    }
  }

  const triggerError = (message: string) => {
    setOtpError(message);
    setTriggerShake(false);
    requestAnimationFrame(() => setTriggerShake(true))
  }

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-slate-400">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Enter One-Time Code</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            We've sent a verification code to your provided email address. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
            <div className={`flex flex-wrap items-center gap-3 ${triggerShake ? "animate-shake" : ""}`}>
              {otp.map((digit, index) =>(
                <Input
                  key={index}
                  maxLength={1}
                  value={digit}
                  ref={el => { if (el) inputsRef.current[index] = el; }}
                  inputMode="numeric"
                  type="text"
                  autoComplete="one-time-code"
                  className={`w-12 text-center font-semibold text-3xl h-auto p-3 rounded-md ${otpError ? "border-red-400 focus-visible:ring-red-500" : "border-slate-300 focus-visible:ring-slate-600"}`}
                  onChange={(e)=> {handleChange(e.target.value, index)}}
                  onKeyUp={(e)=> {handleBackspace(e, index)}}
                />
              ))}
            </div>
            {otpError && <span className="text-red-400 text-sm font-light">{otpError || "Please enter a valid OTP"}</span>}

            <p className="text-sm font-light mt-2">
              Didn't get the code?{" "}
              <Button variant="link" type="button" className="text-[#D54F47] font-semibold p-0 h-auto hover:underline">
                Send Again
              </Button>
            </p>
            <Button type="submit" className="bg-[#D54F47] hover:bg-[#B8423B] rounded-md py-3 text-white mt-4 w-3/4">
              Confirm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyOtp;