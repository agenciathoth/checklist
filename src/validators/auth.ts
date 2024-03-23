import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .email("Informe um e-mail válido")
    .min(1, "O campo é obrigatório"),
  password: z.string().min(1, "O campo é obrigatório"),
});

export type AuthSchema = z.infer<typeof authSchema>;
