import express from 'express';
import { authHandler } from '../../middlewares/authHandler';
import upload from '../../config/multer';

import {
    findByUserIdController,
    updateUserController
} from "./user.controller"

const router = express.Router();

router.get('/', authHandler, findByUserIdController);
router.put('/', authHandler, upload.single("file"), updateUserController);

export default router;