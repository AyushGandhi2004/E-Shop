import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler/index.js';
import type { Request, Response, NextFunction } from 'express';
import redis from '../../../../packages/libs/redis/index.js';
import { sendEmail } from './sendEmail.js';
import prisma from '../../prisma/index.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 

export const validaRegistrationData = (data : any , userType : "user" | "seller" | "admin")=> {
    const { email, username, name, password, phone_number, country } = data;
    if(!email || !name || (userType === "seller" && (!phone_number || !country || !password))){
        throw new ValidationError("Missing Required Fields");
    }
    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid Email Format");
    }

    if(password && !passwordRegex.test(password)){
        throw new ValidationError("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character");
    }
}

export const checkEmailOtpRestrictions = async (email : string, next : NextFunction)=>{

    if(await redis.get(`otp:lock:${email}`)){
        return next(new ValidationError("Account Locked due to too many failed attempts.Try again after 30 minutes"));
    }
    if(await redis .get(`otp:spam:${email}`)){
        return next(new ValidationError("Too many OTP requests. Please try again after 1 hour"));
    }
    if(await redis.get(`otp:limit:${email}`)){
        return next(new ValidationError("OTP already sent. Please try again after 1 minute"));
    }
    
}


export const trackOtpRequest = async (email : string, next : NextFunction)=> {
    const otpRequestKey = `otp:count:${email}`;
    let otpRequests = parseInt(await redis.get(otpRequestKey) || "0");
    if(otpRequests >= 2){
        await redis.set(`otp:spam:${email}`, 1, "EX", 3600); // Set spam flag for 1 hour
        return next(new ValidationError("Too many OTP requests. Please try again after 1 hour"));
    }
    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); // Increment OTP request count with a 1-hour expiration
}


export const sendOtp = async (name : string, email : string, template : string, next : NextFunction)=>{
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "OTP for e-shop", template, {name, otp});
    //send email first and then do this:
    await redis.set(`otp:${email}`, otp, "EX", 300); // Set OTP with a 5-minute expiration
    await redis.set(`otp:limit:${email}`, 1, "EX", 60); // Set OTP limit with a 1-minute expiration
}

export const verifyOtp = async (email : string, otp : string, next: NextFunction)=>{
    const key = `otp:${email}`;
    const originalOtp = await redis.get(key);
    if(!originalOtp) throw new ValidationError("Invalid or Expired OTP");

    if(originalOtp !== otp){
        const failedAttempts = parseInt(await redis.get(`otp:fail:${email}`) || "0") ;
        if(failedAttempts>=2){
            await redis.set(`otp:lock:${email}`, 1, "EX", 30*60)
            await redis.del(`otp:email`)
            throw new ValidationError("Too many failed attempts, try again after 30 mins")
        }
        await redis.set(`otp:fail:${email}`, (failedAttempts+1), "EX", 300)
        throw new ValidationError(`Invalid OTP, ${2-failedAttempts} attempts remaining`)
    }

    //If otp is correct, delete the failed attempt key:
    await redis.del(`otp:fail:${email}`);
}

export const handleForgotPassword = async (req : Request, res : Response, next : NextFunction, userType : "user" | "seller")=>{
    try {
        const {email} = req.body;
        if(!email) throw new ValidationError("Email is required");

        const user = (userType === "user") ? await prisma.users.findUnique({where : {email}}) : await prisma.sellers.findUnique({where : {email}});
        if(!user) throw new ValidationError(`${userType} with this email does not exist`);
        await checkEmailOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        const otp = crypto.randomInt(1000, 9999).toString();
        await sendOtp(user.name, email, userType==="user" ? "forgot-password-otp-mail-template" : "forgot-password-seller-mail-template", next);

        res.status(200).json({
            message : "OTP sent to your email, please verify to reset your password"
        })
    } catch (error) {
        next(error);
    }
}

export const verifyForgotPasswordOTP = async (req : Request, res : Response, next : NextFunction)=>{
    try {
        const { email, otp } = req.body;
        if(!email || !otp) throw new ValidationError("Email and OTP are required");

        await verifyOtp(email, otp, next);

        res.status(200).json({
            message : "OTP verified successfully, you can now reset your password"
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}