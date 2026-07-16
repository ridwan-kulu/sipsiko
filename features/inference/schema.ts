import { z } from "zod";

export const inferenceAnswerSchema = z.object({
  symptomId: z.string().uuid(),

  userWeight: z
    .number()
    .min(0)
    .max(1),

  durationDays: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
});

export const inferenceRequestSchema = z.object({
  consentedAt: z
    .string()
    .datetime()
    .optional(),

  answers: z
    .array(inferenceAnswerSchema)
    .min(1, "Minimal satu jawaban diperlukan.")
    .max(100, "Jumlah jawaban melebihi batas."),
});

export type InferenceRequest = z.infer<
  typeof inferenceRequestSchema
>;