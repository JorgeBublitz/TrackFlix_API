import { Router } from 'express';
import { FavoriteController } from '../../controllers/favorite.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { crossoverSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// Adiciona um favorito
router.post('/favorite', authMiddleware, validate(crossoverSchema), FavoriteController.addFavorite);
// Remove um favorito
router.delete('/favorite', authMiddleware, validate(crossoverSchema), FavoriteController.removeFavorite);
// Lista os favoritos do usuário
router.get('/favorite', authMiddleware, FavoriteController.listFavorites);
// Lista os favoritos públicos de um usuário
router.get('/publicFavorite', FavoriteController.listPublicFavorites);

export default router;
