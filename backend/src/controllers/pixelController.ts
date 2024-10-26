import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendViewNotification } from '../services/notificationService';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';


const prisma = new PrismaClient();

// Helper function to get client IP
const getClientIp = (req: Request): string => {

  // First try x-forwarded-for header (common for proxies/load balancers)
  let ip = 
    (typeof req.headers['x-forwarded-for'] === 'string' 
      ? req.headers['x-forwarded-for'].split(',')[0] 
      : req.headers['x-forwarded-for']?.[0]) ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket.remoteAddress;

  // Clean up the IP
  if (ip) {
    // If it's localhost/::1, use a more identifiable address
    if (ip === '::1' || ip === 'localhost' || ip === '127.0.0.1') {
      ip = '127.0.0.1';
    }
    // Remove IPv6 prefix if present
    ip = ip.toString().replace(/^::ffff:/, '');  }

  console.log('Detected IP:', ip);
  return ip || 'unknown';
};

// Update the IP comparison function as well
const areIpsEqual = (ip1: string, ip2: string): boolean => {

  // Normalize IPs
  const normalizeIp = (ip: string): string => {
    if (ip === '::1' || ip === 'localhost') return '127.0.0.1';
    return ip.replace(/^::ffff:/, '');
  };

  const normalizedIp1 = normalizeIp(ip1);
  const normalizedIp2 = normalizeIp(ip2);

  return normalizedIp1 === normalizedIp2;
};
export const createPixel = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { recipientEmail, emailSubject, notifications } = req.body;
  const userId = req.user.userId;
  const token = crypto.randomBytes(16).toString('hex');
  const creatorIp = getClientIp(req);


  try {
    const pixel = await prisma.pixel.create({
      data: {
        token,
        recipientEmail,
        emailSubject,
        userId,
        creatorIp,
        categoryId: req.body.categoryId,
        notifications: notifications || false,
      },
    });
    console.log('Created Pixel:', pixel);
    res.status(201).json({ pixelToken: pixel.token });
  } catch (error) {
    console.error('Error creating pixel:', error);
    res.status(500).json({ error: 'Error creating pixel' });
  }
};

export const trackPixel = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const viewerIp = getClientIp(req);
  
  
  try {
    const pixel = await prisma.pixel.findUnique({ 
      where: { token } 
    });

    console.log('Found Pixel:', pixel);

    if (!pixel) {
      console.log('Pixel not found');
      res.status(404).json({ error: 'Pixel not found' });
      return;
    }
    
    
    const isCreator = areIpsEqual(viewerIp, pixel.creatorIp ?? '');
    console.log('Is Creator?', isCreator);

    if (isCreator) {
      console.log('Creator view detected - skipping tracking');
    } else {
      console.log('Non-creator view - logging view');
      await prisma.$transaction([
        prisma.pixel.update({
          where: { id: pixel.id },
          data: { viewCount: { increment: 1 } },
        }),
        prisma.view.create({
          data: {
            pixelId: pixel.id,
            viewerIp,
            userAgent: req.headers['user-agent'] || null,
          },
        }),
      ]);      
    }

    const sendTrackingImage = () => {
      const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': img.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(img);
    };
    sendTrackingImage();
    
  } catch (error) {
    console.error('Error in tracking pixel:', error);
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': img.length,
    });
    res.end(img);
  }
};

export const getPixelStats = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.userId;
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  
  try {
    const pixels = await prisma.pixel.findMany({
      where: { userId,
        ...(categoryId && { categoryId }),
       },
      select: {
        id: true,
        token: true,
        recipientEmail: true,
        emailSubject: true,
        viewCount: true,
        createdAt: true,
        creatorIp: true,
        categoryId: true,  // Optional: you might want to hide this
        views: {
          select: {
            viewedAt: true,
            viewerIp: true,  // Optional: you might want to hide this
            userAgent: true,
          },
          orderBy: {
            viewedAt: 'desc',
          },
          take: 5,
        },
      },
    });

    // Optionally mask IPs before sending to frontend
    const maskedPixels = pixels.map(pixel => ({
      ...pixel,
      creatorIp: '**hidden**',
      views: pixel.views.map(view => ({
        ...view,
        viewerIp: '**hidden**'
      }))
    }));

    res.json({ pixels: maskedPixels });
  } catch (error) {
    console.error('Error fetching pixel stats:', error);
    res.status(500).json({ error: 'Error fetching pixel stats' });
  }
};


export const serveInvisiblePixel = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const viewerIp = getClientIp(req);

  try {
    const pixel = await prisma.pixel.findUnique({ where: { token } });
    if (!pixel) {
      console.log('❌ No pixel found for token');
      res.status(404).send('Not found');
      return;
    }

    // Check if this is the creator viewing their own pixel
    const isCreator = areIpsEqual(viewerIp, pixel.creatorIp ?? '');

    // If it's not the creator, log the view
    if (true) {
      console.log('➡️ Logging view for non-creator');
      await prisma.$transaction([
        prisma.pixel.update({
          where: { id: pixel.id },
          data: { viewCount: { increment: 1 } },
        }),
        prisma.view.create({
          data: {
            pixelId: pixel.id,
            userAgent: req.headers['user-agent'],
            viewerIp: viewerIp, // Make sure schema uses viewerIp instead of ipAddress
          },
        }),
      ]);
      console.log('✅ View logged successfully');
      console.log('Pixel:', pixel.notifications);
      
      if (pixel.notifications) {
        sendViewNotification(pixel.id, new Date());
      }
    } else {
      console.log('⚠️ Creator view detected - skipping tracking');
    }

    // Always serve the image regardless of creator status
    const imgPath = path.join(__dirname, '../assets/transparent.jpg');
    const img = fs.readFileSync(imgPath);
    
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': img.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(img);

  } catch (error) {
    res.status(500).send('Internal server error');
  }
};

export const deletePixel = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const pixelId = parseInt(req.params.id);

  try {
    // First verify that the pixel belongs to the user
    const pixel = await prisma.pixel.findFirst({
      where: {
        id: pixelId,
        userId: req.user.userId
      }
    });

    if (!pixel) {
      res.status(404).json({ error: 'Pixel not found or unauthorized' });
      return;
    }

    // Delete related views first (due to foreign key constraints)
    await prisma.view.deleteMany({
      where: {
        pixelId: pixelId
      }
    });

    // Then delete the pixel
    await prisma.pixel.delete({
      where: {
        id: pixelId
      }
    });

    res.status(200).json({ message: 'Pixel deleted successfully' });
  } catch (error) {
    console.error('Error deleting pixel:', error);
    res.status(500).json({ error: 'Error deleting pixel' });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
 
  const { range = 'week' } = req.query;
  const userId = req.user.userId;
 
  try {
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
 
    // Get all pixels for user with their views
    const pixels = await prisma.pixel.findMany({
      where: {
        userId: userId,
      },
      include: {
        views: {
          where: {
            viewedAt: {
              gte: startDate,
            },
          },
        },
      },
    });
 
    // Calculate total views
    const totalViews = pixels.reduce((sum, pixel) => sum + pixel.viewCount, 0);
 
    // Calculate active pixels (pixels with views in selected time range)
    const activePixels = pixels.filter(pixel => pixel.views.length > 0).length;
 
    // Calculate views today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewsToday = pixels.reduce(
      (sum, pixel) => 
        sum + pixel.views.filter(view => 
          new Date(view.viewedAt) >= today
        ).length,
      0
    );
 
    // Calculate views this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const viewsThisWeek = pixels.reduce(
      (sum, pixel) => 
        sum + pixel.views.filter(view => 
          new Date(view.viewedAt) >= weekStart
        ).length,
      0
    );
 
    // Calculate views this month
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);
    const viewsThisMonth = pixels.reduce(
      (sum, pixel) => 
        sum + pixel.views.filter(view => 
          new Date(view.viewedAt) >= monthStart
        ).length,
      0
    );
 
    // Get top performing pixels
    const topPixels = pixels
      .map(pixel => ({
        emailSubject: pixel.emailSubject,
        recipientEmail: pixel.recipientEmail,
        viewCount: pixel.viewCount,
        createdAt: pixel.createdAt,
      }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);
 
    // Get recent activity
    const recentActivity = pixels
      .flatMap(pixel =>
        pixel.views.map(view => ({
          emailSubject: pixel.emailSubject,
          recipientEmail: pixel.recipientEmail,
          viewedAt: view.viewedAt,
        }))
      )
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, 10);
 
    // Calculate views by day for the selected time range
    const viewsByDay = new Map();
    pixels.forEach(pixel => {
      pixel.views.forEach(view => {
        const date = new Date(view.viewedAt).toISOString().split('T')[0];
        viewsByDay.set(date, (viewsByDay.get(date) || 0) + 1);
      });
    });
 
    // Convert viewsByDay map to sorted array
    const viewsByDayArray = Array.from(viewsByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
 
    res.json({
      totalViews,
      totalPixels: pixels.length,
      activePixels,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      topPixels,
      recentActivity,
      viewsByDay: viewsByDayArray,
    });
 
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
 };