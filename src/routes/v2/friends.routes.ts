import { Router } from 'express';
import { FriendsController } from '../../controllers/friends.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Adiciona um amigo
router.post('/friends/:friendId', authMiddleware, FriendsController.addFriend);
// Remove um amigo
router.delete('/friends/:friendId', authMiddleware, FriendsController.removeFriend);
// Lista os amigos do usuário
router.get('/friends', authMiddleware, FriendsController.listFriends);
// Lista os amigos públicos de um usuário
router.get('/publicFriends', FriendsController.listFriends);

export default router;