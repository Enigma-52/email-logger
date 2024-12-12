import express, { Request, Response } from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/register', (req: Request, res: Response) => {
  authController.register(req, res);
});

router.post('/verify-otp', (req: Request, res: Response) => {
  authController.verifyOtp(req, res);
});

router.post('/login', (req: Request, res: Response) => {
  authController.login(req, res);
});

export default router;