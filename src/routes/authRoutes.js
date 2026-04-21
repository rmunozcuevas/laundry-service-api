import express from 'express';
import { validateSignUp, validateLogIn } from '../middleware/userValidators.js';
import { signUpHandler, logInHandler } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/signup', validateSignUp, asyncHandler(signUpHandler));
router.post('/login', validateLogIn, asyncHandler(logInHandler));

export default router;
