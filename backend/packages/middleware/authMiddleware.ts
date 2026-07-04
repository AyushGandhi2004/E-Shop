import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from "../../apps/auth-service/prisma/index.js"

const authMiddleware = async (req : any, res : Response, next : NextFunction) => {
    try {
        // console.log(req.cookies)
        const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];
        //headers part is just for testing purpose, no need of storing cookies in headers in production/website.
        if(!token) return res.status(401).json({message : "Unauthorised, Invalid Token"});
        
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET as string) as { id : string, role : "user" | "seller"};
        if(!decoded) return res.status(401).json({message : "Unauthorised, Invalid Token"});
        const user = await prisma.users.findUnique({where : {id : decoded.id}});
        if(!user) return res.status(401).json({message : "Unauthorised, Invalid Token"});

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message : "Unauthorised, Invalid Token"});
    }
};

export default authMiddleware;