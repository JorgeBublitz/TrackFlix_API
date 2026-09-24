import { z } from 'zod';

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z.object({
  email: z
    .string({ message: 'Email é obrigatório' })
    .email('Email inválido'),

  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/\d/, 'A senha deve conter pelo menos um número')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter pelo menos um caractere especial'),

  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email é obrigatório' })
    .email('Email inválido'),

  password: z.string({ message: 'Senha é obrigatória' }),
});

/**
 * Schema de validação para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token é obrigatório' }),
});

/**
 * Schema de validação para atualização de usuário
 * (os campos são opcionais, pois o usuário pode atualizar só um deles)
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .optional(),

  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/\d/, 'A senha deve conter pelo menos um número')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter pelo menos um caractere especial')
    .optional(),

  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .optional(),

  bio: z
    .string()
    .max(160, 'Bio deve ter no máximo 160 caracteres')
    .optional(),
});

/**
 * Schema de validação do parâmetro :id de usuário (PUT/DELETE /users/:id)
 */
export const userIdParamSchema = z.object({
  id: z
    .string({ message: 'ID do usuário é obrigatório' })
    .uuid('ID inválido'),
});

/**
 * ID de um filme/série da TMDB. Aceita número ou string e normaliza para string.
 */
const crossoverId = z
  .union([z.string().trim().min(1), z.number().int().positive()], {
    message: 'crossoverId é obrigatório',
  })
  .transform((value) => String(value));

/**
 * Body com o ID de um filme/série (favoritos, watchlist e histórico)
 */
export const crossoverSchema = z.object({ crossoverId });

/**
 * Body para criar um comentário
 */
export const createCommentSchema = z.object({
  crossoverId,
  content: z
    .string({ message: 'content é obrigatório' })
    .trim()
    .min(1, 'content é obrigatório')
    .max(1000, 'O comentário deve ter no máximo 1000 caracteres'),
});

/**
 * Body para editar um comentário
 */
export const editCommentSchema = createCommentSchema.pick({ content: true });

/**
 * Tipos derivados
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CrossoverInput = z.infer<typeof crossoverSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
