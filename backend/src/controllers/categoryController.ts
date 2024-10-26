import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.user.userId
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            pixels: true
          }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { name } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        userId: req.user.userId
      }
    });

    if (existingCategory) {
      res.status(400).json({ error: 'Category already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        userId: req.user.userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error creating category' });
  }
};

export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const categoryStats = await prisma.category.findMany({
      where: {
        userId: req.user.userId
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            pixels: true
          }
        },
        pixels: {
          select: {
            viewCount: true,
            views: {
              select: {
                viewedAt: true
              }
            }
          }
        }
      }
    });

    const stats = categoryStats.map(category => ({
      id: category.id,
      name: category.name,
      pixelCount: category._count.pixels,
      totalViews: category.pixels.reduce((sum, pixel) => sum + pixel.viewCount, 0),
      recentViews: category.pixels.flatMap(pixel => pixel.views)
        .filter(view => {
          const viewDate = new Date(view.viewedAt);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return viewDate >= lastWeek;
        }).length
    }));

    res.json(stats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Error fetching category stats' });
  }
};