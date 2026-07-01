import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/index.js";
import { ValidationError } from "../../../../packages/error-handler/index.js";
import { validaRegistrationData, checkEmailOtpRestrictions, trackOtpRequest, sendOtp } from "../utils/auth.helper.js";
// import { PrismaClient, Prisma } from "../../../../generated/prisma/client.js";

// const prisma = new PrismaClient();



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

