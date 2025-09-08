import { z } from "zod";

export const createPresignedURLSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  customerId: z.string().cuid(),
});

export type CreatePresignedURLSchema = z.infer<typeof createPresignedURLSchema>;
