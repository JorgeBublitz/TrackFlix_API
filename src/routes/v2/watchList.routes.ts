import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { crossoverSchema } from '../../utils/zod/validation.schemas';
import { WatchListController } from '../../controllers/watchList.controller';

const router = Router();

// Adiciona um item à watchlist
router.post('/watchlist', authMiddleware, validate(crossoverSchema), WatchListController.addToWatchList);
// Remove um item da watchlist
router.delete('/watchlist', authMiddleware, validate(crossoverSchema), WatchListController.removeFromWatchList);
// Lista os itens da watchlist
router.get('/watchlist', authMiddleware, WatchListController.listWatchList);
// Lista os itens públicos da watchlist de um usuário
router.get('/publicWatchlist', WatchListController.listPublicWatchList);

export default router;
