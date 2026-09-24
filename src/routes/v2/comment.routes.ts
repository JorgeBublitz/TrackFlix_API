import { Router } from 'express';
import { CommentController } from '../../controllers/comment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCommentSchema, editCommentSchema } from '../../utils/zod/validation.schemas';

const router = Router();

// Adiciona um comentário a um filme/série
router.post('/comments', authMiddleware, validate(createCommentSchema), CommentController.addComment);
// Lista os comentários de um filme/série
router.get('/comments/:crossoverId', CommentController.listComments);
// Remove um comentário feito pelo usuário
router.delete('/comments/:commentId', authMiddleware, CommentController.deleteComment);
// Edita um comentário feito pelo usuário
router.put('/comments/:commentId', authMiddleware, validate(editCommentSchema), CommentController.editComment);
// Adiciona um like a um comentário
router.post('/comments/:commentId/like', authMiddleware, CommentController.likeComment);
// Remove um like de um comentário
router.post('/comments/:commentId/unlike', authMiddleware, CommentController.unlikeComment);

export default router;
