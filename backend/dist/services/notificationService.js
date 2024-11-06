"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendViewNotification = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a transporter using SMTP
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendViewNotification = (pixelId, viewTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get pixel details with user info
        const pixel = yield prisma.pixel.findUnique({
            where: { id: pixelId },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
        console.log(pixel);
        if (!pixel || !pixel.notifications)
            return;
        // Send email notification
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: pixel.user.email,
            subject: `Email Tracking Notification: Your email "${pixel.emailSubject}" was viewed`,
            html: `
        <div>
          <h2>Email Tracking Notification</h2>
          <p>Your email to ${pixel.recipientEmail} was viewed.</p>
          <p><strong>Subject:</strong> ${pixel.emailSubject}</p>
          <p><strong>Viewed at:</strong> ${viewTime.toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            You received this notification because you enabled email notifications for this tracked email.
          </p>
        </div>
      `,
        });
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
});
exports.sendViewNotification = sendViewNotification;
