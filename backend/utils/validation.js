import { z } from 'zod';

export const esquemaRegistro = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .email('Email deve ter formato válido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .toLowerCase()
    .trim(),
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(255, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    )
});

export const esquemaLogin = z.object({
  email: z.string()
    .email('Email deve ter formato válido')
    .toLowerCase()
    .trim(),
  senha: z.string()
    .min(1, 'Senha é obrigatória')
});