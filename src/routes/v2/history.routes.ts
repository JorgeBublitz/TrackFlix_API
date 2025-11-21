import { Router } from 'express';
import { HistoryController } from '../../controllers/history.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Adiciona um item ao histórico
router.post('/history', authMiddleware, HistoryController.addToHistory);
// Lista o histórico do usuário
router.get('/history', authMiddleware, HistoryController.listHistory);
// Limpa o histórico do usuário
router.delete('/history', authMiddleware, HistoryController.clearHistory);

export default router;