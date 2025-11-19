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
});

/**
 * Schema de validação para deleção de usuário
 */
export const deleteUserSchema = z.object({
  id: z
    .string({ message: 'ID do usuário é obrigatório' })
    .uuid('ID inválido'),
});

/**
 * Tipos derivados
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
