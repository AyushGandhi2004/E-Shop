import type { Request, Response } from "express";
import { AppError } from "./index.js"


export const errorMiddleware = (err : Error, req : Request, res : Response)=>{
    if(err instanceof AppError){
        console.log(`Error: ${err.message}, ${req.method} - ${req.url}}`);

        return res.status(err.statusCode).json({
            status : "error",
            message : err.message,
            ...(err.details && {details : err.details})
        });
    }
    console.log("Unexpected Error: ", err);
    return res.status(500).json({
        status : "error",
        message : "Internal Server Error"
    });
}