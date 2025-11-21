import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// Rotas públicas
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// Consultas (públicas ou administrativas)
router.get('/users', AuthController.getAll);
router.get('/getByName', AuthController.getByName);

// Rotas protegidas
router.post('/logout', authMiddleware, validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
