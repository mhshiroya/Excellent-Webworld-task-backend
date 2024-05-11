import express, { Router } from 'express';
const router: Router = express.Router();

import * as auth from "../controller/auth"
import { verifyUserToken } from '../middleware/jwt';

router.post("/login", auth.Login)
router.post("/sign-up", auth.Register)

export { router }