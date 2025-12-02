import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { WatchListController } from '../../controllers/watchList.controller';

const router = Router();

// Adiciona um item à watchlist
router.post('/watchlist', authMiddleware, WatchListController.addToWatchList);
// Remove um item da watchlist
router.delete('/watchlist', authMiddleware, WatchListController.removeFromWatchList);
// Lista os itens da watchlist
router.get('/watchlist', authMiddleware, WatchListController.listWatchList);
// Lista os itens públicos da watchlist de um usuário
router.get('/publicWatchlist', WatchListController.listPublicWatchList);

export default router;