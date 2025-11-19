import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, updateUserSchema, deleteUserSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// CRUD de usuários
router.post('/register', validate(registerSchema), AuthController.register);
router.get('/users', AuthController.getAll);
router.get('/getByName', AuthController.getByName);
router.get('/getByNickname', AuthController.getByNickname);
// Rotas de autenticação protegidas para atualização e deleção de usuário
router.put('/users/:id', authMiddleware, validate(updateUserSchema), AuthController.update);
router.delete('/users/:id', authMiddleware, validate(deleteUserSchema), AuthController.delete);

//========================================================

// Rotas de autenticação
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', authMiddleware, validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
