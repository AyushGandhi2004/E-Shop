import type { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/prisma/index.js";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/error-handler/index.js";
import {imagekit} from "../../../../packages/libs/imagekit/index.js"

//Get Product Categories
export const getCategories = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if(!config) return res.status(404).json({ message: "Categories not found" });
        res.status(200).json({ message: "Categories found", data: config });
    } catch (error) {
        next(error);
    }
}

//Create Discount Codes:
export const createDiscountCode = async (req: any, res : Response, next : NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body;
        const sellerId = req.seller.id;

        const doExist = await prisma.discount_codes.findUnique({where : {discountCode}});
        if(doExist) return next( new ValidationError("Discount Code already available"));

        const discount_code = await prisma.discount_codes.create({
            data : {
                public_name,
                discountType,
                discountValue : parseFloat(discountValue),
                discountCode,
                sellerId
            },
        });

        res.status(201).json({
            message : "Discount Code Created Successfully",
            discount_code
        })
    } catch (error) {
        return next(error);
    }
}

//Get Discount Codes for a seller:
export const getDiscountCodes = async (req: any, res : Response, next : NextFunction) => {
    try {
        const sellerId = req.seller.id;
        const discount_codes = await prisma.discount_codes.findMany({where : {sellerId}});

        res.status(200).json({
            message : "Discount Codes Found",
            discount_codes
        })
    } catch (error) {
        return next(error);
    }
}

//Delete Discount Codes:
export const deleteDiscountCode = async (req: any, res : Response, next : NextFunction) => {
    try {
        const {id} = req.params;
        const sellerId = req.seller?.id;

        const doExist = await prisma.discount_codes.findUnique({where : {id}, select : {id : true, sellerId : true}});
        if(!doExist) return next( new NotFoundError("Discount Code not found"));

        if(doExist.sellerId !== sellerId) return next(new AuthError("You are not authorized to delete this discount code"));

        await prisma.discount_codes.delete({where : {id}});

        return res.status(204).json({ message : "Discount Code Deleted Successfully" });
    } catch (error) {
        return next(error);
    }
}

//Upload Images :
export const uploadImage = async (req : any, res : Response, next : NextFunction) => {
    try {
        const {fileName} = req.body;
        if(!fileName) return next(new ValidationError("File name is required"));

        const response = await imagekit.upload({
            file : fileName,
            fileName : `product-${Date.now()}.jpg`,
            folder : "/products"
        })
        res.status(201).json({
            message : "Image Uploaded Successfully",
            file_url : response.url,
            fileId : response.fileId
        })
    } catch (error) {
        return next(error);
    }
}

//Delete Image:
export const deleteImage = async (req : any, res : Response, next : NextFunction) => {
    try {
        const {fileId} = req.body;
        if(!fileId) return next(new ValidationError("File ID is required"));
        const response = await imagekit.deleteFile(fileId);
        res.status(204).json({
            message : "Image Deleted Successfully"
        })
    } catch (error) {
        return next(error);
    }
}

//Create Product:
export const createProduct = async (req : any, res : Response, next : NextFunction) => {
    try {
        const {title, description, detailed_description, warranty, custom_specifications, slug, tags, cash_on_delivery, brand, video_url, category, colors=[], sizes=[], discountCodes, stock, sale_price, regular_price, subCategory, customProperties={}, images=[]} = req.body;

        if(!title || !description || !slug || !category || !subCategory || !stock || !sale_price || !regular_price || !images || !tags) return next(new ValidationError("Missing required fields"));

        if(!req.seller.id) return next(new AuthError("You are not authorized to create a product"));

        const existingSlug = await prisma
    } catch (error) {
        return next(error);
    }
}