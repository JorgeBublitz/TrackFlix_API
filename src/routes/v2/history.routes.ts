import { Router } from 'express';
import { HistoryController } from '../../controllers/history.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { crossoverSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// Adiciona um item ao histórico
router.post('/history', authMiddleware, validate(crossoverSchema), HistoryController.addToHistory);
// Lista o histórico do usuário
router.get('/history', authMiddleware, HistoryController.listHistory);
// Limpa o histórico do usuário
router.delete('/history', authMiddleware, HistoryController.clearHistory);
// Lista o histórico público de um usuário
router.get('/publicHistory', HistoryController.listPublicHistory);

export default router;
