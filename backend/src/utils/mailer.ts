import nodemailer from 'nodemailer';
import { VerificationTemplate } from '../template/verificationTemplate';

export const sendOtp = async (email: string, otp: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}. It is valid for 2 minutes.`,
            html : VerificationTemplate(otp)
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
        
    }    
}