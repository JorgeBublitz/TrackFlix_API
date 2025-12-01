import { Router } from 'express';
import { FavoriteController } from '../../controllers/favorite.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Adiciona um favorito
router.post('/favorite', authMiddleware, FavoriteController.addFavorite);
// Remove um favorito
router.delete('/favorite', authMiddleware, FavoriteController.removeFavorite);
// Lista os favoritos do usuário
router.get('/favorite', authMiddleware, FavoriteController.listFavorites);
// Lista os favoritos públicos de um usuário
router.get('/publicFavorite', FavoriteController.listFavorites);

export default router;