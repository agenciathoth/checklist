import { z } from "zod";

export const createCommentSchema = z
  .object({
    text: z.string().min(1, "O campo é obrigatório"),
    parentId: z.string().cuid().optional(),
    userId: z.string().nullable().optional(),
    author: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.userId) {
        return !!data.author?.trim();
      }

      return true;
    },
    {
      message: "O campo 'author' é obrigatório quando não há usuário",
      path: ["author"],
    }
  );

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
