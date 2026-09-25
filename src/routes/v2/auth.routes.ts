import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../../utils/zod/validation.schemas';

const router = Router();

// CRUD de usuários
router.post('/register', validate(registerSchema), AuthController.register);
router.get('/users', authMiddleware, AuthController.getAll);
router.get('/getByName', authMiddleware, AuthController.getByName);
router.put(
  '/users/:id',
  authMiddleware,
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  AuthController.update
);
router.delete(
  '/users/:id',
  authMiddleware,
  validate(userIdParamSchema, 'params'),
  AuthController.delete
);

// Autenticação
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authMiddleware, validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
