import type { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/prisma/index.js";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/error-handler/index.js";
import { imagekit } from "../../../../packages/libs/imagekit/index.js"
import type { Prisma } from "../../../../packages/generated/prisma/client.js";

//Get Product Categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if (!config) return res.status(404).json({ message: "Categories not found" });
        res.status(200).json({ message: "Categories found", data: config });
    } catch (error) {
        next(error);
    }
}

//Create Discount Codes:
export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body;
        const sellerId = req.seller.id;

        const doExist = await prisma.discount_codes.findUnique({ where: { discountCode } });
        if (doExist) return next(new ValidationError("Discount Code already available"));

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId
            },
        });

        res.status(201).json({
            message: "Discount Code Created Successfully",
            discount_code
        })
    } catch (error) {
        return next(error);
    }
}

//Get Discount Codes for a seller:
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller.id;
        const discount_codes = await prisma.discount_codes.findMany({ where: { sellerId } });

        res.status(200).json({
            message: "Discount Codes Found",
            discount_codes
        })
    } catch (error) {
        return next(error);
    }
}

//Delete Discount Codes:
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller?.id;

        const doExist = await prisma.discount_codes.findUnique({ where: { id }, select: { id: true, sellerId: true } });
        if (!doExist) return next(new NotFoundError("Discount Code not found"));

        if (doExist.sellerId !== sellerId) return next(new AuthError("You are not authorized to delete this discount code"));

        await prisma.discount_codes.delete({ where: { id } });

        return res.status(204).json({ message: "Discount Code Deleted Successfully" });
    } catch (error) {
        return next(error);
    }
}

//Upload Images :
export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        if (!fileName) return next(new ValidationError("File name is required"));

        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products"
        })
        res.status(201).json({
            message: "Image Uploaded Successfully",
            file_url: response.url,
            fileId: response.fileId
        })
    } catch (error) {
        return next(error);
    }
}

//Delete Image:
export const deleteImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;
        if (!fileId) return next(new ValidationError("File ID is required"));
        const response = await imagekit.deleteFile(fileId);
        res.status(204).json({
            message: "Image Deleted Successfully"
        })
    } catch (error) {
        return next(error);
    }
}

//Create Product:
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { title, description, detailed_description, warranty, custom_specifications, slug, tags, cash_on_delivery, brand, video_url, category, colors = [], sizes = [], discountCodes, stock, sale_price, regular_price, subCategory, customProperties = {}, images = [] } = req.body;

        if (
            !title ||
            !description ||
            !slug ||
            !category ||
            !subCategory ||
            stock == null ||
            sale_price == null ||
            regular_price == null ||
            !tags ||
            !images?.length
        ) {
            return next(new ValidationError("Missing required fields"));
        }

        if (!req.seller.id) return next(new AuthError("You are not authorized to create a product"));

        const existingSlug = await prisma.products.findUnique({ where: { slug } });
        if (existingSlug) return next(new ValidationError("Slug already exists. Please choose a different slug"));

        const newProduct = await prisma.products.create({
            data: {
                title, description, detailed_description, warranty,
                custom_specifications: custom_specifications || {},
                slug,
                //we need to convert string into array and also remove whitespaces
                tags: Array.isArray(tags) ? tags : tags.split(",")?.map((tag: string) => tag.trim()),
                cashOnDelivery: cash_on_delivery,
                brand, video_url, category,
                colors: colors || [],
                sizes: sizes || [],
                discount_codes: (discountCodes || []).map((codeId: string) => codeId),
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                subCategory, custom_properties: customProperties || {},
                images: {
                    create: images.filter((img: any) => img && img.file_url && img.fileId).map((img: any) => ({
                        url: img.file_url,
                        file_id: img.fileId
                    }))
                },
                shopId: req.seller?.shop?.id,
            },
            include: { images: true }
        });
        res.status(201).json({
            success: true,
            newProduct
        })
    } catch (error) {
        return next(error);
    }
}

//Get Products by shop:
export const getProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const shopId = req.seller?.shop?.id;
        const products = await prisma.products.findMany({ where: { shopId }, include: { images: true } });

        res.status(200).json({
            success: true,
            products
        })
    } catch (error) {
        return next(error);
    }
}

//delete product:
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({ where: { id: productId }, select: { id: true, shopId: true, isDeleted: true } });

        if (!product) return next(new NotFoundError("Product not found"));

        if (product.shopId !== sellerId) return next(new AuthError("You are not authorized to delete this product"));

        if (product.isDeleted) return next(new ValidationError("Product is already deleted"));

        const deletedProduct = await prisma.products.update({ where: { id: productId }, data: { isDeleted: true, deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });

        return res.status(200).json({
            message: "Product scheduled for deletion. It will be permanently deleted after 24 hours.",
            deletedAt: deletedProduct.deletedAt
        })
    } catch (error) {
        return next(error);
    }
}

//Restoring Product:
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;

        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true, deletedAt: true }
        });

        if (!product) return next(new NotFoundError("Product not found"));

        if (product.shopId !== sellerId) return next(new AuthError("You are not authorized to delete this product"));

        if (!product.isDeleted) return next(new ValidationError("Product is not deleted"));

        //check if the timeline for deleting product is not exceeded, as the cron job might be pending:
        if (product.deletedAt && product.deletedAt.getTime() < Date.now()) return next(new ValidationError("Product cannot be restored as the deletion timeline has exceeded"));

        await prisma.products.update({ where: { id: productId }, data: { isDeleted: false, deletedAt: null } });

        return res.status(204).json({
            message: "Product restored successfully"
        })

    } catch (error) {
        return next(error);
    }
}

//Get All Products:
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type;

        const baseFilter = {
            OR: [{
                starting_date: null,
            }, {
                ending_date: null
            }]
        };

        const orderBy : Prisma.productsOrderByWithRelationInput = 
            type === "latest" ? { createdAt: "desc" as Prisma.SortOrder } : { totalSales : "desc" as Prisma.SortOrder };

        const [products, total, top10Products] = await Promise.all([
            prisma.products.findMany({
                skip,
                take : limit,
                include : {
                    images : true,
                    shop : true
                },
                // where : baseFilter,
                orderBy : {
                    totalSales : "desc"
                },
            }),

            prisma.products.count({ where : baseFilter }),

            prisma.products.findMany({
                take : 10,
                where : baseFilter,
                orderBy
            }),
        ]);

        res.status(200).json({
            products,
            top10By : type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage : page,
            totalPages : Math.ceil(total / limit)
        })
    } catch (error) {
        return next(error);
    }
}