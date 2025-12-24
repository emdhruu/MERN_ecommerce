import api from "../../config/axios";

export const checkAuth = async ()=> {
    try {
        const res = await api.get('/auth/check-auth');
        return res.data;
    } catch (error: any) {
        throw error.response.message;
    }
}

export const login = async (cred: {email: string, password: string}) => {
    try {
        const res = await api.post('/auth/login', cred);
        return res.data;
    } catch (error : any) {
        throw error.response.message;
    }
}

export const register = async (cred: {email: string, password: string, confirmPassword: string}) => {
    try {
        const res = await api.post('/auth/register', cred);
        return res;
    } catch (error : any) {
        throw error.response.message;
    }
}

export const verifyOtp = async (data: {email: string, otp: string}) => {
    try {
        const res = await api.post('/auth/verify-otp', data);
        return res.data;
    } catch (error: any) {
        throw error.response.message;
    }
}