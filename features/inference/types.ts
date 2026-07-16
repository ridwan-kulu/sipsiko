export type UserAnswer = {
  symptomId: string;
  userWeight: number;
  durationDays?: number | null;
};

export type ExpertRule = {
  conditionId: string;
  conditionName: string;
  conditionSlug: string;
  conditionDescription: string;
  recommendation: string;

  symptomId: string;
  symptomCode: string;
  symptomName: string;

  expertWeight: number;
  isRequired: boolean;
  minimumDurationDays?: number | null;
};

export type MatchedSymptom = {
  symptomId: string;
  symptomCode: string;
  symptomName: string;
  expertWeight: number;
  userWeight: number;
  certaintyValue: number;
};

export type InferenceResult = {
  conditionId: string;
  conditionName: string;
  conditionSlug: string;
  description: string;
  recommendation: string;
  score: number;
  percentage: number;
  level: "rendah" | "sedang" | "tinggi";
  matchedSymptoms: MatchedSymptom[];
  missingRequiredSymptoms: string[];
};