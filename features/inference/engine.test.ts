import {
  describe,
  expect,
  it,
} from "vitest";
import {
  calculateAllResults,
  calculateConditionResult,
  clampCertaintyFactor,
  combinePositiveCertaintyFactors,
  getResultLevel,
} from "./engine";
import type { ExpertRule } from "./types";

const depressionRules: ExpertRule[] = [
  {
    conditionId: "condition-depression",
    conditionName: "Indikasi Gejala Depresi",
    conditionSlug: "indikasi-gejala-depresi",
    conditionDescription:
      "Deskripsi kondisi contoh.",
    recommendation:
      "Pertimbangkan berkonsultasi dengan tenaga kesehatan.",

    symptomId: "symptom-mood",
    symptomCode: "G001",
    symptomName: "Suasana hati menurun",

    expertWeight: 0.8,
    isRequired: true,
    minimumDurationDays: 14,
  },
  {
    conditionId: "condition-depression",
    conditionName: "Indikasi Gejala Depresi",
    conditionSlug: "indikasi-gejala-depresi",
    conditionDescription:
      "Deskripsi kondisi contoh.",
    recommendation:
      "Pertimbangkan berkonsultasi dengan tenaga kesehatan.",

    symptomId: "symptom-interest",
    symptomCode: "G002",
    symptomName: "Kehilangan minat",

    expertWeight: 0.7,
    isRequired: true,
    minimumDurationDays: 14,
  },
];

describe("clampCertaintyFactor", () => {
  it("mempertahankan nilai yang valid", () => {
    expect(
      clampCertaintyFactor(0.5),
    ).toBe(0.5);
  });

  it("membatasi nilai maksimum menjadi satu", () => {
    expect(
      clampCertaintyFactor(1.5),
    ).toBe(1);
  });

  it("membatasi nilai minimum menjadi nol", () => {
    expect(
      clampCertaintyFactor(-0.5),
    ).toBe(0);
  });
});

describe(
  "combinePositiveCertaintyFactors",
  () => {
    it("menggabungkan dua nilai CF", () => {
      const result =
        combinePositiveCertaintyFactors([
          0.6,
          0.7,
        ]);

      expect(result).toBeCloseTo(0.88);
    });

    it("menghasilkan nol untuk array kosong", () => {
      expect(
        combinePositiveCertaintyFactors([]),
      ).toBe(0);
    });

    it("tidak menghasilkan nilai lebih dari satu", () => {
      expect(
        combinePositiveCertaintyFactors([
          1,
          0.9,
        ]),
      ).toBe(1);
    });
  },
);

describe("getResultLevel", () => {
  it.each([
    [0, "rendah"],
    [0.39, "rendah"],
    [0.4, "sedang"],
    [0.74, "sedang"],
    [0.75, "tinggi"],
    [1, "tinggi"],
  ] as const)(
    "mengubah skor %s menjadi %s",
    (score, expectedLevel) => {
      expect(
        getResultLevel(score),
      ).toBe(expectedLevel);
    },
  );
});

describe("calculateConditionResult", () => {
  it("menghitung gabungan Certainty Factor", () => {
    const result =
      calculateConditionResult(
        depressionRules,
        [
          {
            symptomId: "symptom-mood",
            userWeight: 0.75,
            durationDays: 14,
          },
          {
            symptomId: "symptom-interest",
            userWeight: 1,
            durationDays: 14,
          },
        ],
      );

    /*
     * G001: 0.8 × 0.75 = 0.6
     * G002: 0.7 × 1 = 0.7
     * CF: 0.6 + 0.7 × (1 - 0.6) = 0.88
     */
    expect(result).not.toBeNull();
    expect(result?.score).toBeCloseTo(0.88);
    expect(result?.percentage).toBe(88);
    expect(result?.level).toBe("tinggi");
    expect(
      result?.matchedSymptoms,
    ).toHaveLength(2);
  });

  it("menghasilkan skor nol jika gejala wajib tidak ada", () => {
    const result =
      calculateConditionResult(
        depressionRules,
        [
          {
            symptomId: "symptom-mood",
            userWeight: 1,
            durationDays: 14,
          },
        ],
      );

    expect(result?.score).toBe(0);

    expect(
      result?.missingRequiredSymptoms,
    ).toContain("Kehilangan minat");
  });

  it("menghasilkan skor nol jika durasi belum memenuhi aturan", () => {
    const result =
      calculateConditionResult(
        depressionRules,
        [
          {
            symptomId: "symptom-mood",
            userWeight: 1,
            durationDays: 7,
          },
          {
            symptomId: "symptom-interest",
            userWeight: 1,
            durationDays: 7,
          },
        ],
      );

    expect(result?.score).toBe(0);

    expect(
      result?.missingRequiredSymptoms,
    ).toHaveLength(2);
  });

  it("menghasilkan null jika aturan kosong", () => {
    expect(
      calculateConditionResult([], []),
    ).toBeNull();
  });
});

describe("calculateAllResults", () => {
  it("mengurutkan kondisi berdasarkan skor tertinggi", () => {
    const lowWeightRules =
      depressionRules.map((rule) => ({
        ...rule,
        conditionId: "condition-low",
        conditionName: "Kondisi Bobot Rendah",
        conditionSlug: "kondisi-rendah",
        expertWeight: 0.3,
      }));

    const results = calculateAllResults(
      [
        ...lowWeightRules,
        ...depressionRules,
      ],
      [
        {
          symptomId: "symptom-mood",
          userWeight: 1,
          durationDays: 14,
        },
        {
          symptomId: "symptom-interest",
          userWeight: 1,
          durationDays: 14,
        },
      ],
    );

    expect(results).toHaveLength(2);

    expect(
      results[0].conditionId,
    ).toBe("condition-depression");

    expect(
      results[0].score,
    ).toBeGreaterThan(results[1].score);
  });
});