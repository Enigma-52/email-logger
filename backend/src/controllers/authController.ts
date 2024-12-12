import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Generate OTP
    const otp = await generateOTP(); // We'll implement this function later
    
    // Send OTP via email
    await sendVerificationEmail(email, otp); // We'll implement this function later
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with pending state and OTP details
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        state: 'PENDING',
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      },
    });

    res.status(200).json({ 
      message: 'Verification code sent to email',
      email 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error during registration process' });
  }
};

const generateOTP = (): string => {
  // Generate a cryptographically secure 6-digit number
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};


export const sendVerificationEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'Email Verification for Email Tracker';
    const body = `Your verification code is: ${otp}. Please enter this code to verify your email.`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env['EMAIL_USER'],
          pass: process.env['EMAIL_PASSWORD'],
        }
      })

    await transporter.sendMail({
      from: process.env['EMAIL_USER'],
      to: email,
      subject,
      html: body
    });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpString } = await req.body;

    console.log('Received OTP:', otpString);

    // Find user and ensure they exist
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ error: 'No OTP found. Please request a new one' });
      return;
    }

    if (new Date() > user.otpExpiry) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one' });
      return;
    }

    if (otpString !== user.otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    await prisma.user.update({
      where: { email },
      data: {
        state: 'ACTIVE',
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Email verified successfully',
      token 
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
};