import { z } from 'zod';
import { PATTERNS } from '@/utils/constants';

/**
 * Acepta un email válido o un identificador de usuario razonablemente largo.
 * La respuesta del backend es genérica, así que acá solo evitamos envíos inútiles.
 */
export const formForgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Ingresá tu email o usuario')
    .refine(
      (value) => PATTERNS.email.test(value) || value.length >= 3,
      'Ingresá un email o un usuario válido',
    ),
});
