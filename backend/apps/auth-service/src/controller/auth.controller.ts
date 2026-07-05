import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/index.js";
import { AuthError, ValidationError } from "../../../../packages/error-handler/index.js";
import { validaRegistrationData, checkEmailOtpRestrictions, trackOtpRequest, sendOtp, verifyOtp, handleForgotPassword, verifyForgotPasswordOTP } from "../utils/auth.helper.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from "path";
import { setCookie } from "../utils/setCookies.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

export const registerSeller = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { name, email, password, country, phone_number } = req.body;
        validaRegistrationData(req.body, "seller");

        const existingSeller = await prisma.sellers.findUnique({where : {email}});
        if(existingSeller) return next(new ValidationError("Seller with this email already exists"));

        await checkEmailOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(name, email, "seller-activation", next);

        res.status(200).json({
            message : "OTP sent to your mail, please verify your account to complete registration"
        })

    } catch (error) {
        next(error);
    }
}

export const verifySeller = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { email,name, password, country, phone_number, otp } = req.body;
        if(!email || !name || !password || !country || !phone_number || !otp) return next(new ValidationError("All Fields are required"));

        const existingSeller = await prisma.sellers.findUnique({where : {email}});
        if(existingSeller) return next(new ValidationError("Seller with this email already exists"));

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await prisma.sellers.create({
            data : { name, email, password : hashedPassword, phone_number, country }
        });
        res.status(201).json({
            seller,
            message : "Seller Registered Successfully"
        })
    } catch (error) {
        next(error);
    }
}

export const createShop = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {name, bio, address, opening_hours, category, website, sellerId} = req.body;
        if(!name || !category || !address || !sellerId || !opening_hours) return next(new ValidationError("Missing Required Fields"));

        const shopData : any = {
            name,
            bio,
            address,
            opening_hours,
            category,
            sellerId
        };

        if(website && website.trim()!=="") shopData.website = website;

        

        const shop = await prisma.shops.create({data : shopData})
        res.status(201).json({
            message : "Shop Created Successfully",
            shop : {
                name : shop.name,
                bio : shop.bio,
                address : shop.address,
                opening_hours : shop.opening_hours,
                category : shop.category,
                website : shop.website
            }
        })
    } catch (error) {
        next(error);
    }
}

//create strip connection link for seller:
export const createStripeConnectLink = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {sellerId} = req.body;
        if(!sellerId) return next(new ValidationError("Seller Id is required"));
        if(!/^[0-9a-fA-F]{24}$/.test(sellerId)) {
            return next(new ValidationError("Invalid Seller Id"));
        }

        const seller = await prisma.sellers.findUnique({where : {id : sellerId}});
        console.log(seller)
        if(!seller) return next(new ValidationError("No such seller exists"));
        console.log("safe")
        const account = await stripe.accounts.create({
            type : "express",
            email : seller.email, 
            country : "US",//set it to USA
            capabilities : {
                card_payments : {requested : true},
                transfers : {requested : true}
            }
        })
        console.log(account)

        await prisma.sellers.update({
            where : {id : sellerId},
            data : {stripeId : account.id}
        })

        const accountLink = await stripe.accountLinks.create({
            account : account.id,
            refresh_url : "http://localhost:3000/signup/pending",
            return_url : "http://localhost:3000/signup/success",
            type : "account_onboarding"
        });
        console.log(accountLink)
        res.status(200).json({url : accountLink.url});
    } catch (error) {
        return next(error)
    }
}

export const loginSeller = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) return next(new ValidationError("Email and Password are required"));

        const seller = await prisma.sellers.findUnique({where : {email}});
        if(!seller) return next(new ValidationError("Invalid email or password"));

        //verify Password:
        const isMatch = await bcrypt.compare(password, seller.password!);
        if(!isMatch) return next(new ValidationError("Invalid email or password"));

        //generate access and refresh token:
        const access_token = jwt.sign({id : seller.id, role : "seller"}, process.env.ACCESS_SECRET as string, {expiresIn : "15m"});
        const refresh_token = jwt.sign({id : seller.id, role : "seller"}, process.env.REFRESH_SECRET as string, {expiresIn : "7d"});

        setCookie(res, "seller_access_token", access_token);
        setCookie(res, "seller_refresh_token", refresh_token);

        res.status(200).json({
            message : "Login Successful",
            seller : {
                id : seller.id,
                email : seller.email,
                name : seller.name
            }
        })
    } catch (error) {
        next(error);
    }
}

export const getSeller = async (req : any, res : Response, next : NextFunction) => {
    try {
        const seller = req.seller;
        res.status(200).json({
            seller,
            success : true
        });
    } catch (error) {
        next(error);
    }
}

