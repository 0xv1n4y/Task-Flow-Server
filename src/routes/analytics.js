import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getSummary, getHeatmap, getBreakdown } from '../controllers/analyticsController.js';

const router = Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/heatmap', getHeatmap);
router.get('/breakdown', getBreakdown);

export default router;
