import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/index.js";
import { AuthError, ValidationError } from "../../../../packages/error-handler/index.js";
import { validaRegistrationData, checkEmailOtpRestrictions, trackOtpRequest, sendOtp, verifyOtp, handleForgotPassword, verifyForgotPasswordOTP } from "../utils/auth.helper.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from "path";
import { setCookie } from "../utils/setCookies.js";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});


//Register a new user:
export const registerUser = async (req : Request , res : Response, next : NextFunction) => {
    try {
        validaRegistrationData(req.body, "user");
        const {name, email } = req.body;

        const existingUser = await prisma.users.findUnique({where : {email}});
        if(existingUser){
            return next(new ValidationError("User with this email already exists"));
        }

        await checkEmailOtpRestrictions(email, next);

        await trackOtpRequest(email, next);

        await sendOtp(name, email, "otp-mail-template", next);

        res.status(200).json({
            message : "OTP sent to your mail, please verify your account"
        });
    } catch (error) {
        return next(error);
    }
};

//Verify the user:
export const verifyUser = async (req : Request, res : Response, next : NextFunction)=>{
    try {
        const {otp, email, name, password} = req.body;
        if(!email || !password || !otp || !name) return next(new ValidationError("All Fields are required"))
        //verify the otp:
        await verifyOtp(email, otp, next);
        //now hash the password and create user:
        const hashPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data : {name, email, password : hashPassword}
        })
        res.status(201).json({
            message : "User Created Successfully",
            status : true
        })
    } catch (error) {
        return next(error);
    }

}

//login user:
export const loginUser = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) return next(new ValidationError("Email and Password are required"));

        const user = await prisma.users.findUnique({where : {email}});
        if(!user) return next(new ValidationError("Invalid email or password"));

        //verify password:
        const isMatch = await bcrypt.compare(password, user.password!)
        if(!isMatch)  return next(new ValidationError("Invalid email or password"));

        //generate access and refresh token:
        const access_secret = process.env.ACCESS_SECRET as string;
        const accessToken = jwt.sign({id : user.id, role : "user"}, access_secret, {
            expiresIn : "15m"
        });
        
        const refresh_secret = process.env.REFRESH_SECRET as string;
        const refreshToken = jwt.sign({id : user.id, role : "user"}, refresh_secret, {
            expiresIn : "7d"
        });

        //store access and secret token in httpOnly secure cookie:
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message : "Login Successful",
            user : {
                id : user.id,
                email : user.email,
                name : user.name
            }
        })

    } catch (error) {
        next(error)
    }
}

//refresh token user:
export const refreshToken = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if(!refreshToken) return new AuthError("Unauthorised Access, Please LogIn");

        //If token is present decode it:
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as {id : string, role : string};

        if(!decoded || !decoded.id || !decoded.role) return new AuthError("Forbidden Access, Invalid Token");


        //As of now no seller db so consider user type only then extend it to seller and admin roles:
        const user = await prisma.users.findUnique({where : {id : decoded.id}});
        if(!user) return new AuthError("No such user exists");

        const newAccessToken = jwt.sign({id : decoded.id, role : decoded.role}, process.env.ACCESS_SECRET as string, {expiresIn : "15m"});
        setCookie(res,"access_token",newAccessToken);

        return res.status(201).json({
            success : true
        })
    } catch (error) {
        next(error);
    }
}

//get Logged in user Info:
export const getUser = async (req : any, res : Response, next : NextFunction)=>{
    try {
        const user = req.user;
        res.status(201).json({
            success : true,
            user : {
                name : user.name,
                email : user.email,
                role : user.role
            }
        })

    } catch (error) {
        next(error);
    }
}

export const forgotPassword = async (req : Request, res : Response, next : NextFunction) => {
    try {
        handleForgotPassword(req, res, next, "user")
    } catch (error) {
        next(error);
    }
}

//verify forgot password otp:
export const verifyForgotPasswordOtp = async (req : Request, res : Response, next : NextFunction) => {
    await verifyForgotPasswordOTP(req, res, next);
}

export const resetPassword = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {email, newPassword} = req.body;

        if(!email || !newPassword) return next( new ValidationError("Email and New Password are required"));

        const user = await prisma.users.findUnique({where : {email}});
        if(!user) return next(new ValidationError("User with this email does not exist"));

        //compare new password with the existing one:
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if(isSamePassword) return next(new ValidationError("New password cannot be same as the old password"));

        //Hash the newPassword and store it:
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where : {email},
            data : {password : hashedPassword}
        });

        res.status(200).json({
            message : "Password reset successful"
        })
    } catch (error) {
        next(error);
    }
}