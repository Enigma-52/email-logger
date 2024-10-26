import express from 'express';
import * as pixelController from '../controllers/pixelController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new pixel (protected route)
router.post('/create', authenticateToken, (req, res) => pixelController.createPixel(req, res));

// Track a pixel view (public route)
router.get('/track/:token', (req, res) => pixelController.trackPixel(req, res));

// Serve invisible pixel (public route)
router.get('/invisible/:token.jpg', (req, res) => pixelController.serveInvisiblePixel(req, res));

// Get pixel stats (protected route)
router.get('/stats', authenticateToken, (req, res) => pixelController.getPixelStats(req, res));

//Delete
router.delete('/:id', authenticateToken, (req, res) => pixelController.deletePixel(req, res));

export default router;