import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper function to get client IP
const getClientIp = (req: Request): string => {
  console.log('Raw IP Detection Data:', {
    xForwardedFor: req.headers['x-forwarded-for'],
    xRealIp: req.headers['x-real-ip'],
    remoteAddress: req.socket.remoteAddress,
    ip: req.ip
  });

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
  console.log('Comparing IPs:', { ip1, ip2 });

  // Normalize IPs
  const normalizeIp = (ip: string): string => {
    if (ip === '::1' || ip === 'localhost') return '127.0.0.1';
    return ip.replace(/^::ffff:/, '');
  };

  const normalizedIp1 = normalizeIp(ip1);
  const normalizedIp2 = normalizeIp(ip2);

  console.log('Normalized IPs:', { normalizedIp1, normalizedIp2 });
  return normalizedIp1 === normalizedIp2;
};
export const createPixel = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { recipientEmail, emailSubject } = req.body;
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
      console.log('View logged successfully');
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
  
  try {
    const pixels = await prisma.pixel.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        recipientEmail: true,
        emailSubject: true,
        viewCount: true,
        createdAt: true,
        creatorIp: true,  // Optional: you might want to hide this
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

    console.log('Found Pixel:', pixel);
    console.log('IP Comparison:', {
      creatorIp: pixel.creatorIp,
      viewerIp: viewerIp
    });

    // Check if this is the creator viewing their own pixel
    const isCreator = areIpsEqual(viewerIp, pixel.creatorIp ?? '');
    console.log(`Is Creator? ${isCreator}`);

    // If it's not the creator, log the view
    if (!isCreator) {
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
    console.log('❌ Error serving invisible pixel:', error);
    console.error('Error serving invisible pixel:', error);
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