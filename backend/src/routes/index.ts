import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando' });
});

router.use("/auth", authRoutes);

export default router;

