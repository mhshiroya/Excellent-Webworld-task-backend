import express, { Router } from "express";
const router: Router = express.Router();

import { dynamicFileUpload } from "../utils/uploadFile";

import * as auth from "../controller/auth";
import { verifyUserToken } from "../middleware/jwt";
import * as products from "../controller/products";
import * as category from "../controller/category";
import * as brand from "../controller/brand";

router.post("/login", auth.Login);
router.post("/sign-up", auth.Register);
router.post("/get-profile", verifyUserToken, auth.getProfile);
router.post("/update-profile", verifyUserToken, auth.updateProfile);
router.post("/change-password", verifyUserToken, auth.changePassword);
router.post("/forgot-password", verifyUserToken, auth.forgotPassword);
router.post("/reset-password", verifyUserToken, auth.resetPassword);

router.post("/get-products", verifyUserToken, products.getProducts);
router.post("/add-product", verifyUserToken, products.addProduct);
router.delete("/delete-products/:id", verifyUserToken, products.deleteProduct);

router.post("/get-category", verifyUserToken, category.getCategory);
router.post("/add-category", verifyUserToken, category.addCategory);
router.post("/edit-category", verifyUserToken, category.editCategory);
router.delete("/delete-category/:id", verifyUserToken, category.deleteCategory);

router.post("/get-brand", verifyUserToken, brand.getBrand);
router.post("/add-brand", verifyUserToken, brand.addBrand);
router.post("/edit-brand", verifyUserToken, brand.editBrand);
router.delete("/delete-brand/:id", verifyUserToken, brand.deleteBrand);

export { router };
