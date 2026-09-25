import { Router } from 'express';
import { CommentController } from '../../controllers/comment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCommentSchema,
  editCommentSchema,
  crossoverIdParamSchema,
  commentIdParamSchema,
} from '../../utils/zod/validation.schemas';

const router = Router();

// Adiciona um comentário a um filme/série
router.post('/comments', authMiddleware, validate(createCommentSchema), CommentController.addComment);
// Lista os comentários de um filme/série
router.get(
  '/comments/:crossoverId',
  validate(crossoverIdParamSchema, 'params'),
  CommentController.listComments
);
// Remove um comentário feito pelo usuário
router.delete(
  '/comments/:commentId',
  authMiddleware,
  validate(commentIdParamSchema, 'params'),
  CommentController.deleteComment
);
// Edita um comentário feito pelo usuário
router.put(
  '/comments/:commentId',
  authMiddleware,
  validate(commentIdParamSchema, 'params'),
  validate(editCommentSchema),
  CommentController.editComment
);
// Adiciona um like a um comentário
router.post(
  '/comments/:commentId/like',
  authMiddleware,
  validate(commentIdParamSchema, 'params'),
  CommentController.likeComment
);
// Remove um like de um comentário
router.post(
  '/comments/:commentId/unlike',
  authMiddleware,
  validate(commentIdParamSchema, 'params'),
  CommentController.unlikeComment
);

export default router;
