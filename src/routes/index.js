import { Router } from 'express';
import taskRoutes from './tasks.js';
import analyticsRoutes from './analytics.js';

const router = Router();

router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
