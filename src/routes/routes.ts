import express, { Router } from 'express';
const router: Router = express.Router();

import * as auth from "../controller/auth"
import { verifyUserToken } from '../middleware/jwt';
import * as products from "../controller/products"

router.post("/login", auth.Login)
router.post("/sign-up", auth.Register)

router.post('/get-products', products.getProducts)
router.get('/get-all-categories', products.getAllCategories)

export { router }