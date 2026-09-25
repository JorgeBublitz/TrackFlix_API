import { Router } from 'express';
import { FriendsController } from '../../controllers/friends.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { friendIdParamSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// Adiciona um amigo
router.post(
  '/friends/:friendId',
  authMiddleware,
  validate(friendIdParamSchema, 'params'),
  FriendsController.addFriend
);
// Remove um amigo
router.delete(
  '/friends/:friendId',
  authMiddleware,
  validate(friendIdParamSchema, 'params'),
  FriendsController.removeFriend
);
// Lista os amigos do usuário
router.get('/friends', authMiddleware, FriendsController.listFriends);
// Lista os amigos públicos de um usuário
router.get('/publicFriends', FriendsController.listPublicFriends);

export default router;