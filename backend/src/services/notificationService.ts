import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { Transporter } from 'nodemailer';

const prisma = new PrismaClient();

// Create a transporter using SMTP
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendViewNotification = async (
  pixelId: number, 
  viewTime: Date
) => {
  try {
    // Get pixel details with user info
    const pixel = await prisma.pixel.findUnique({
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

    if (!pixel || !pixel.notifications) return;

    // Send email notification
    await transporter.sendMail({
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

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};