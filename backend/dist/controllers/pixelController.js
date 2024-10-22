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
exports.serveInvisiblePixel = exports.getPixelStats = exports.trackPixel = exports.createPixel = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const createPixel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const { recipientEmail, emailSubject } = req.body;
    const userId = req.user.userId;
    const token = crypto_1.default.randomBytes(16).toString('hex');
    try {
        const pixel = yield prisma.pixel.create({
            data: {
                token,
                recipientEmail,
                emailSubject,
                userId,
            },
        });
        res.status(201).json({ pixelToken: pixel.token });
    }
    catch (error) {
        console.error('Error creating pixel:', error);
        res.status(500).json({ error: 'Error creating pixel' });
    }
});
exports.createPixel = createPixel;
const trackPixel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const pixel = yield prisma.pixel.findUnique({ where: { token } });
        if (!pixel) {
            res.status(404).json({ error: 'Pixel not found' });
            return;
        }
        // Increment view count and create a new view
        yield prisma.$transaction([
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
    }
    catch (error) {
        console.error('Error tracking pixel:', error);
        res.status(500).json({ error: 'Error tracking pixel' });
    }
});
exports.trackPixel = trackPixel;
const getPixelStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const userId = req.user.userId;
    try {
        const pixels = yield prisma.pixel.findMany({
            where: { userId },
            select: {
                id: true,
                token: true,
                recipientEmail: true,
                emailSubject: true,
                viewCount: true,
                createdAt: true,
                views: {
                    select: {
                        viewedAt: true,
                    },
                    orderBy: {
                        viewedAt: 'desc',
                    },
                    take: 5,
                },
            },
        });
        res.json({ pixels });
    }
    catch (error) {
        console.error('Error fetching pixel stats:', error);
        res.status(500).json({ error: 'Error fetching pixel stats' });
    }
});
exports.getPixelStats = getPixelStats;
const serveInvisiblePixel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const pixel = yield prisma.pixel.findUnique({ where: { token } });
        if (!pixel) {
            res.status(404).send('Not found');
            return;
        }
        yield prisma.$transaction([
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
        const imgPath = path_1.default.join(__dirname, '../assets/transparent.jpg');
        const img = fs_1.default.readFileSync(imgPath);
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': img.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        });
        res.end(img);
    }
    catch (error) {
        console.error('Error serving invisible pixel:', error);
        res.status(500).send('Internal server error');
    }
});
exports.serveInvisiblePixel = serveInvisiblePixel;
