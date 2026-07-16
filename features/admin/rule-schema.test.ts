import { z } from "zod";

export const ruleSchema = z.object({
  id: z
    .string()
    .uuid("ID aturan tidak valid.")
    .optional(),

  conditionId: z
    .string()
    .uuid("Kondisi tidak valid."),

  symptomId: z
    .string()
    .uuid("Gejala tidak valid."),

  expertWeight: z
    .number()
    .finite("Bobot harus berupa angka.")
    .min(0.01, "Bobot minimal 0.01.")
    .max(1, "Bobot maksimal 1."),

  isRequired: z.boolean(),

  minimumDurationDays: z
    .number()
    .finite()
    .int("Durasi harus berupa bilangan bulat.")
    .min(0, "Durasi tidak boleh negatif.")
    .max(3650, "Durasi terlalu besar.")
    .nullable(),
});

export type RuleInput = z.infer<
  typeof ruleSchema
>;