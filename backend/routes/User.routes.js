import express from 'express';
import { Router } from 'express';
import {authUser} from '/middlewares/authentication.js';
import { userHandler } from '../controllers/userHandler';

const router = Router();

router.post('', authUser , userHandlerr);



module.exports = router;