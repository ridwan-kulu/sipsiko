import { z } from "zod";

export const conditionSchema = z.object({
  id: z.string().uuid().optional(),

  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter.")
    .max(20)
    .regex(
      /^[A-Z0-9_-]+$/,
      "Kode hanya boleh berisi huruf kapital, angka, garis bawah, dan tanda hubung.",
    ),

  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(150),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
    ),

  description: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter.")
    .max(3000),

  recommendation: z
    .string()
    .trim()
    .min(20, "Rekomendasi minimal 20 karakter.")
    .max(3000),

  isActive: z.boolean(),
});