import {
  describe,
  expect,
  it,
} from "vitest";
import { ruleSchema } from "./rule-schema";

const validRule = {
  conditionId:
    "11111111-1111-4111-8111-111111111111",

  symptomId:
    "22222222-2222-4222-8222-222222222222",

  expertWeight: 0.8,
  isRequired: true,
  minimumDurationDays: 14,
};

describe("ruleSchema", () => {
  it("menerima aturan yang valid", () => {
    const result =
      ruleSchema.safeParse(validRule);

    expect(result.success).toBe(true);
  });

  it("menerima ID aturan yang valid", () => {
    const result = ruleSchema.safeParse({
      ...validRule,

      id:
        "33333333-3333-4333-8333-333333333333",
    });

    expect(result.success).toBe(true);
  });

  it("menolak conditionId yang bukan UUID", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      conditionId: "condition-invalid",
    });

    expect(result.success).toBe(false);
  });

  it("menolak symptomId yang bukan UUID", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      symptomId: "symptom-invalid",
    });

    expect(result.success).toBe(false);
  });

  it("menolak bobot nol", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      expertWeight: 0,
    });

    expect(result.success).toBe(false);
  });

  it("menolak bobot di atas satu", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      expertWeight: 1.1,
    });

    expect(result.success).toBe(false);
  });

  it("menerima durasi null", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      minimumDurationDays: null,
    });

    expect(result.success).toBe(true);
  });

  it("menolak durasi negatif", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      minimumDurationDays: -1,
    });

    expect(result.success).toBe(false);
  });

  it("menolak durasi desimal", () => {
    const result = ruleSchema.safeParse({
      ...validRule,
      minimumDurationDays: 14.5,
    });

    expect(result.success).toBe(false);
  });
});
