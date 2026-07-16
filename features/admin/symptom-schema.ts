import { z } from "zod";

export const symptomSchema = z.object({
  id: z
    .string()
    .uuid("ID gejala tidak valid.")
    .optional(),

  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter.")
    .max(20, "Kode maksimal 20 karakter.")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Kode hanya boleh berisi huruf kapital, angka, garis bawah, dan tanda hubung.",
    ),

  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(150, "Nama maksimal 150 karakter."),

  question: z
    .string()
    .trim()
    .min(10, "Pertanyaan minimal 10 karakter.")
    .max(1000, "Pertanyaan maksimal 1000 karakter."),

  explanation: z
    .string()
    .trim()
    .max(2000, "Penjelasan maksimal 2000 karakter.")
    .nullable(),

  displayOrder: z
    .number()
    .finite()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan tidak boleh negatif.")
    .max(10000, "Urutan terlalu besar."),

  isCrisis: z.boolean(),
  isActive: z.boolean(),
});

export type SymptomInput = z.infer<typeof symptomSchema>;
