import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const createPixel = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.userId;
  const token = crypto.randomBytes(16).toString('hex');
  
  try {
    const pixel = await prisma.pixel.create({
      data: {
        token,
        userId,
      },
    });
    res.status(201).json({ pixelToken: pixel.token });
  } catch (error) {
    console.error('Error creating pixel:', error);
    res.status(500).json({ error: 'Error creating pixel' });
  }
};

export const trackPixel = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  
  try {
    const pixel = await prisma.pixel.findUnique({ where: { token } });
    if (!pixel) {
      res.status(404).json({ error: 'Pixel not found' });
      return;
    }

    // Increment view count and create a new view
    await prisma.$transaction([
      prisma.pixel.update({
        where: { id: pixel.id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      }),
      prisma.view.create({
        data: {
          pixelId: pixel.id,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        },
      }),
    ]);

    // Send a 1x1 transparent GIF
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': img.length,
    });
    res.end(img);
  } catch (error) {
    console.error('Error tracking pixel:', error);
    res.status(500).json({ error: 'Error tracking pixel' });
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
        viewCount: true,
        createdAt: true,
        views: {
          select: {
            viewedAt: true,
            userAgent: true,
            ipAddress: true,
          },
          orderBy: {
            viewedAt: 'desc',
          },
        },
      },
    });

    res.json({ pixels });
  } catch (error) {
    console.error('Error fetching pixel stats:', error);
    res.status(500).json({ error: 'Error fetching pixel stats' });
  }
};

export const serveInvisiblePixel = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  
  try {
    const pixel = await prisma.pixel.findUnique({ where: { token } });
    if (!pixel) {
      res.status(404).send('Not found');
      return;
    }

    await prisma.$transaction([
      prisma.pixel.update({
        where: { id: pixel.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.view.create({
        data: {
          pixelId: pixel.id,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        },
      }),
    ]);

    // Serve a 1x1 transparent JPG
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
    console.error('Error serving invisible pixel:', error);
    res.status(500).send('Internal server error');
  }
};