import express from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => categoryController.getCategories(req, res));
router.post('/', authenticateToken, (req, res) => categoryController.createCategory(req, res));
router.get('/stats', authenticateToken, (req, res) => categoryController.getCategoryStats(req, res));


export default router;