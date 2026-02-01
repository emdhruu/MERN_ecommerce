import * as crypto from 'crypto';
import { compare, hash } from 'bcrypt';
import  RedisClientWrapper  from './redisClient.service';
import redisClientService from './redisClient.service';
import { sendOtpViaMail } from '../utils/mailer';

interface OtpVerificationResult {
    success: boolean;
    message: string;
    remainingAttempts?: number;
}

class OtpService {
    otpExpirationTime :number = 300;  // 5 minutes
    maxRetryAttempts :number = 5;
    shortRetryWindow :number = 60;  // 1 minute
    lockoutDuration :number = 3600; // 1 hour
    saltRounds :number = 10;
    initialAttemptCount :number = 0;

    constructor(
        private readonly redisClientService: typeof RedisClientWrapper
    ) {}

    private getRandomSixDigitCode = (): string => {
        return crypto.randomInt(100000, 1000000).toString();
    }

    public storeOtp = async (email: string, otp: string): Promise<void> => {
        const redis = this.redisClientService.getRedisClient();
        if (!redis) throw new Error("Redis client not available");

        try {
            await redis.set(`otp:${email}`, otp, "EX", this.otpExpirationTime);
            await redis.set(`otp_attempts:${email}`, this.initialAttemptCount, "EX", this.otpExpirationTime);
        } catch (error) {
            throw new Error("Failed to store OTP in Redis");
        }
    }

    public applyCooldown = async (email: string, cooldownTime: number): Promise<void> => {
        const redis = this.redisClientService.getRedisClient();
        if (!redis) throw new Error("Redis client not available");

        try {
            const currentTime = Math.floor(Date.now() / 1000);
            await redis.set(`otp_cooldown:${email}`, (currentTime + cooldownTime).toString(), "EX", cooldownTime);
        } catch (error) {
            throw new Error("Failed to apply cooldown in Redis");
        }
    }

    public isInCooldown = async (email: string): Promise<{ inCooldown: boolean, timeLeft?: number, message?: string }> => {
        const redis = this.redisClientService.getRedisClient();
        if (!redis) throw new Error("Redis client not available");

        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const cooldownExpiry = await redis.get(`otp_cooldown:${email}`);

            if (cooldownExpiry && currentTime < Number(cooldownExpiry)){
                const timeLeft = Number(cooldownExpiry) - currentTime;
                const minutesLeft = Math.floor(timeLeft / 60);
                const secondsLeft = timeLeft % 60;

                return {
                    inCooldown: true,
                    message: `Cooldown active. Please wait ${minutesLeft}m ${secondsLeft}s before retrying.`
                }
            }
            return { inCooldown: false };
        } catch (error) {
            throw new Error("Failed to check cooldown in Redis");
        }
    }

    public requestOtp = async (email: string) => {
        const cooldownState = await this.isInCooldown(email);
        
        if(!cooldownState.inCooldown){
            const otp = this.getRandomSixDigitCode().toString();
            const hasedOtp = await hash(otp, this.saltRounds);
            
            await this.storeOtp(email, hasedOtp);
            
            await this.applyCooldown(email, this.shortRetryWindow);
            
            //mailService: send otp via email
            await sendOtpViaMail(email, otp);
            
            return { message : `OTP sent to ${email}. Valid for ${Math.floor(this.otpExpirationTime /60)}m.`}
        }
        return cooldownState;
    } 

    public verifyOtp = async (email: string, otp: string): Promise<OtpVerificationResult> => {
        const redis = this.redisClientService.getRedisClient();
        if (!redis) throw new Error("Redis client not available.");

        try {
            const storedHasedOtp = await redis.get(`otp:${email}`);
            if (!storedHasedOtp) {
                return { success: false, message : "OTP expired or not found. Please request a new one."};
            }

            const retryCount = await redis.get(`otp_attempts:${email}`);

            if ( retryCount && Number(retryCount) >= this.maxRetryAttempts){
                throw new Error("Maximum retry reached.");
            }

            const isVerified = await compare(otp, storedHasedOtp);
            
            const currentRetryCount = Number(retryCount) + 1;
            if (!isVerified) {
                await redis.incr(`otp_attempts:${email}`);

                if (currentRetryCount >= this.maxRetryAttempts) {
                    await this.applyCooldown(email, this.lockoutDuration);
                    return {
                        success: false,
                        message: "Maximum retry reached. You are locked out for 1 hour."
                    };
                }
                return {
                    success: false,
                    message: "Invalid OTP. Please try again.",
                    remainingAttempts: this.maxRetryAttempts - currentRetryCount
                }
            }
            await this.cleanUpOtpData(email);
            return {
                success: true,
                message: "OTP verified successfully."
            }
        } catch (error) {
            throw new Error("Failed to verify OTP in Redis");
        }
    }

    private cleanUpOtpData = async (email: string): Promise<void> => {
        const redis = this.redisClientService.getRedisClient();
        if (!redis) throw new Error("Redis client not available");

        try {
            await Promise.all([
                redis.del(`otp:${email}`),
                redis.del(`otp_attempts:${email}`),
                redis.del(`otp_cooldown:${email}`)
            ]);
        } catch (error) {
            throw new Error("Failed to clean up OTP data in Redis");
        }
    }
}

export default new OtpService(redisClientService);