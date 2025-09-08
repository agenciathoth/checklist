import { TaskResponsible } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "O campo é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  due: z
    .string()
    .min(1, "O campo é obrigatório")
    .refine(
      (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value),
      { message: "Insira uma data válida" }
    ),
  responsible: z.nativeEnum(TaskResponsible),
  customerId: z.string().cuid(),
  medias: z.array(
    z.object({
      id: z.string().cuid().optional(),
      order: z.number().min(1),
      path: z.string(),
      type: z.string(),
      url: z.string().url(),
      isVideo: z.boolean().optional(),
    })
  ),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
