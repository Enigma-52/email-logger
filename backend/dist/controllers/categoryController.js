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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.createCategory = exports.getCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    try {
        const categories = yield prisma.category.findMany({
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
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});
exports.getCategories = getCategories;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const { name } = req.body;
    if (!(name === null || name === void 0 ? void 0 : name.trim())) {
        res.status(400).json({ error: 'Category name is required' });
        return;
    }
    try {
        const existingCategory = yield prisma.category.findFirst({
            where: {
                name: name.trim(),
                userId: req.user.userId
            }
        });
        if (existingCategory) {
            res.status(400).json({ error: 'Category already exists' });
            return;
        }
        const category = yield prisma.category.create({
            data: {
                name: name.trim(),
                userId: req.user.userId
            }
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Error creating category' });
    }
});
exports.createCategory = createCategory;
const getCategoryStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    try {
        const categoryStats = yield prisma.category.findMany({
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
    }
    catch (error) {
        console.error('Error fetching category stats:', error);
        res.status(500).json({ error: 'Error fetching category stats' });
    }
});
exports.getCategoryStats = getCategoryStats;
