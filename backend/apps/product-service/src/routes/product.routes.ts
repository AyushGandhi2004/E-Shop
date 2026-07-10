import express, { Router } from "express";
import { createDiscountCode, createProduct, deleteDiscountCode, deleteImage, deleteProduct, getAllProducts, getCategories, getDiscountCodes, getProducts, restoreProduct, uploadImage } from "../controller/product.controller.js";
import  authMiddleware  from "../../../../packages/middleware/authMiddleware.js"
import { isSeller } from "../.././../../packages/middleware/authorizeRoles.js"

const router = Router();

router.get("/categories", getCategories);

//discount codes routes:
router.get("/seller/discount-codes", authMiddleware, getDiscountCodes);
router.post("/seller/discount-codes", authMiddleware, createDiscountCode);
router.delete("/seller/discount-codes/:id",authMiddleware, deleteDiscountCode);


// Image Routes:
router.post("/image", authMiddleware, uploadImage);
router.delete("/image", authMiddleware, deleteImage);

// Product Routes:
router.post("/seller/products", authMiddleware, createProduct);
router.get("/seller/products", authMiddleware, getProducts);
router.delete('/seller/products/:productId', authMiddleware, deleteProduct);
router.patch('/seller/products/:productId', authMiddleware, restoreProduct)
router.get('/products', getAllProducts);

export default router;