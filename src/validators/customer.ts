import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "O campo é obrigatório"),
  whatsapp: z
    .string()
    .url("Insira uma URL válida")
    .optional()
    .or(z.literal("")),
  contract: z
    .string()
    .url("Insira uma URL válida")
    .optional()
    .or(z.literal("")),
  gallery: z.string().url("Insira uma URL válida").optional().or(z.literal("")),
  schedule: z
    .string()
    .url("Insira uma URL válida")
    .optional()
    .or(z.literal("")),
  presentation: z.string().optional().or(z.literal("")),
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
