import type { Response, NextFunction } from 'express'
import { ForbiddenError } from "../error-handler/index.js"

export const isSeller = (req : any, res : Response, next : NextFunction) => {
    if(req.role !== "seller") return next(new ForbiddenError("Forbidden, You are not authorized to access this resource"));
}

export const isUser = (req : any, res : Response, next : NextFunction) => {
    if(req.role !== "user") return next(new ForbiddenError("Forbidden, You are not authorized to access this resource"));
}