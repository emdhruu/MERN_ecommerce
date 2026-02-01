import { Response } from "express";

export const saveCookie = ( res: Response, refreshToken : string) => {
    res.cookie(process.env.TOKEN_KEY as string, refreshToken, {   
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    })
}

export const clearCookie = (res: Response) => {
    res.clearCookie(process.env.TOKEN_KEY as string, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'none',
        maxAge: 0
    })
}