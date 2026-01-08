import Lottie from "lottie-react";
import online_shopping_bg from "../../../assets/online_shopping_bg.json";

const RightPanel = () => {
  return (
    <div className="w-1/2 bg-slate-100 h-full flex flex-col">
          <div className="flex-grow pt-28 ps-16 ">
            <p className="font-light text-3xl">Start Shopping Today</p>
            <div className="flex flex-col mt-8 font-light text-slate-500 text-sm">
            <span>Get personalized shopping and customization experience on BOS Unlimited </span> 
            <span>when you sign in to your account.</span>
            </div>
          </div>
          <div className="flex justify-center items-center h-3/5">
            {/* Image for backup */}
            {/* <img src="src/assets/loginbg.jpg" className="w-xl float-end rounded-t-2xl h-full shadow-gray-500 shadow-2xl"/> */}
            <Lottie animationData={online_shopping_bg} className="w-xl" />
          </div>
    </div>
  )
}

export default RightPanel