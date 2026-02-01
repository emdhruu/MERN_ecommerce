import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import hash from "object-hash";

class RedisClientWrapper {
    redisClient: Redis | null = null;

    public initializeRedisClient = () => {
        try {
            const URL = process.env.REDIS_URL;
            if (!URL) {
                throw new Error("REDIS_URL is not defined in .env file");
            }
            this.redisClient = new Redis(URL);

            this.redisClient.on("connect", () => {
                console.log("Connected to Redis");
            });

            this.redisClient.on("error", (error)=> {
                console.error("Redis connection error:", error);
            })
        } catch (error) {
            console.error("Failed to initialize Redis client:", error);
        }
    }

    public isRedisWorking = () => {
        return this.redisClient?.status === "ready";
    }

    readonly getRedisClient = () => {
        return this.redisClient;
    }

    private writeToRedis = async (key: string, data: any, options?: any ) => {
        if (!this.isRedisWorking()) return;

        const redis = this.getRedisClient();
        if (!redis) return;

        try {
            if (options && options.EX){
                await redis.set(key, data, "EX", options.EX);
            } else {
                await redis.set(key, data);
            }
        } catch (error) {
            console.error("Error writing to Redis:", error); 
        }
    }

    public readFromRedis = async (key: string) => {
        if (!this.isRedisWorking()) return null;

        const redis = this.getRedisClient();
        if (!redis) return null;

        try {
            return await redis.get(key);
        } catch (error) {
            console.error("Error reading from Redis:", error);
        }
    }

    private requestToKey = (req: Request): string => {
        const reqDataToHash = {
            query: req.query,
            body: req.body,
        };

        return `${req.path}@${hash.sha1(reqDataToHash)}`
    }

    public redisCachingMiddleware = (options= { EX: 21600 }) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (!this.isRedisWorking()) return next();

            const key = this.requestToKey(req);
            const cachedValue = await this.readFromRedis(key);

            if (cachedValue) {
                try {
                    return res.json(JSON.parse(cachedValue));
                } catch (error) {
                    return res.json(cachedValue);
                }
            }

            const originalJson = res.json.bind(res);

            res.send = (data) => {
                if (res.statusCode.toString().startsWith("2")){
                    this.writeToRedis(key, JSON.stringify(data), options)
                }
                return originalJson(data);
            };
            next();
        }
    }
}

export default new RedisClientWrapper();