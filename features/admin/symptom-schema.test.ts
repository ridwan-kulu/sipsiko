import {
  describe,
  expect,
  it,
} from "vitest";
import { symptomSchema } from "./symptom-schema";

const validSymptom = {
  code: "G001",
  name: "Suasana hati menurun",

  question:
    "Dalam dua minggu terakhir, seberapa sering Anda merasa sedih?",

  explanation:
    "Perasaan sedih yang terjadi berulang.",

  displayOrder: 1,
  isCrisis: false,
  isActive: true,
};

describe("symptomSchema", () => {
  it("menerima gejala yang valid", () => {
    const result =
      symptomSchema.safeParse(
        validSymptom,
      );

    expect(result.success).toBe(true);
  });

  it("menerima ID gejala yang valid", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,

        id:
          "11111111-1111-4111-8111-111111111111",
      });

    expect(result.success).toBe(true);
  });

  it("menolak ID gejala tidak valid", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        id: "bukan-uuid",
      });

    expect(result.success).toBe(false);
  });

  it("menolak kode dengan huruf kecil", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        code: "g001",
      });

    expect(result.success).toBe(false);
  });

  it("menolak kode dengan spasi", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        code: "G 001",
      });

    expect(result.success).toBe(false);
  });

  it("menolak nama yang terlalu pendek", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        name: "AB",
      });

    expect(result.success).toBe(false);
  });

  it("menolak pertanyaan yang terlalu pendek", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        question: "Pendek",
      });

    expect(result.success).toBe(false);
  });

  it("menerima explanation null", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        explanation: null,
      });

    expect(result.success).toBe(true);
  });

  it("menolak displayOrder negatif", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        displayOrder: -1,
      });

    expect(result.success).toBe(false);
  });

  it("menolak displayOrder desimal", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        displayOrder: 1.5,
      });

    expect(result.success).toBe(false);
  });

  it("menerima pertanyaan keselamatan", () => {
    const result =
      symptomSchema.safeParse({
        ...validSymptom,
        code: "G999",
        isCrisis: true,
      });

    expect(result.success).toBe(true);
  });
});
