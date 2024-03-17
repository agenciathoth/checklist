import { TaskResponsible } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "O campo é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  due: z.coerce.date(),
  responsible: z.nativeEnum(TaskResponsible),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
