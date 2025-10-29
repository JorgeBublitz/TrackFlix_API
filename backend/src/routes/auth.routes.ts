import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.schemas';

const router = Router();
// rota públicas
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);


router.get('/users', AuthController.getAll);
router.get('/users/search', AuthController.getByName);

// rotas protegidas (precisam de JWT válido)
router.post('/refresh', authMiddleware, validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', authMiddleware, validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;

