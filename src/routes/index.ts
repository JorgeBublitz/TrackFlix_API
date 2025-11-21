import { Router } from 'express';
import authRoutes from './v2/auth.routes';
import favoriteRoutes from './v2/favorite.routes';
import commentRoutes from './v2/comment.routes';
import historyRoutes from './v2/history.routes';
import watchListRoutes from './v2/watchList.routes';

const router = Router();

router.use('/auth/v2', authRoutes);
router.use('/comments/v2', commentRoutes);
router.use('/favorites/v2', favoriteRoutes);
router.use('/history/v2', historyRoutes);
router.use('/watchList/v2', watchListRoutes);

export default router;
