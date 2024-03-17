import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "O campo é obrigatório"),
  email: z
    .string()
    .email("Informe um e-mail válido")
    .min(1, "O campo é obrigatório"),
  password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
  role: z.nativeEnum(UserRole),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  name: z.string().min(1, "O campo é obrigatório"),
  email: z
    .string()
    .email("Informe um e-mail válido")
    .min(1, "O campo é obrigatório"),
  password: z
    .string()
    .min(8, "A senha deve conter no mínimo 8 caracteres")
    .min(4, "Please enter a valid value")
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(UserRole),
});
