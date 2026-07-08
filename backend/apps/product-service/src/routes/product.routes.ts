import express, { Router } from "express";
import { createDiscountCode, createProduct, deleteDiscountCode, deleteImage, deleteProduct, getCategories, getDiscountCodes, getProducts, restoreProduct, uploadImage } from "../controller/product.controller.js";
import  authMiddleware  from "../../../../packages/middleware/authMiddleware.js"
import { isSeller } from "../.././../../packages/middleware/authorizeRoles.js"

const router = Router();

router.get("/categories", getCategories);

//discount codes routes:
router.get("/discount-codes", authMiddleware, getDiscountCodes);
router.post("/discount-codes", authMiddleware, createDiscountCode);
router.delete("/discount-codes/:id",authMiddleware, deleteDiscountCode);


// Image Routes:
router.post("/image", authMiddleware, uploadImage);
router.delete("/image", authMiddleware, deleteImage);

// Product Routes:
router.post("/products", authMiddleware, createProduct);
router.get("/products", authMiddleware, getProducts);
router.delete('/products/:productId', authMiddleware, deleteProduct);
router.patch('/products/:productId', authMiddleware, restoreProduct)

export default router;