import { Router } from 'express';
import { FavoriteController } from '../../controllers/favorite.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { addFavoriteSchema, removeFavoriteSchema } from '../../utils/zod/favorite.schemas';

const router = Router();

// Adiciona um favorito
router.post('/favorite', authMiddleware, validate(addFavoriteSchema), FavoriteController.addFavorite);

// Remove um favorito
router.delete('/favorite', authMiddleware, validate(removeFavoriteSchema), FavoriteController.removeFavorite);

// Lista os favoritos do usuário
router.get('/favorite', authMiddleware, FavoriteController.listFavorites);

export default router;