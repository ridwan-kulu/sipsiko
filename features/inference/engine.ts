import type {
  ExpertRule,
  InferenceResult,
  MatchedSymptom,
  UserAnswer,
} from "./types";

export function clampCertaintyFactor(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function combinePositiveCertaintyFactors(
  certaintyValues: number[],
): number {
  return certaintyValues.reduce((current, next) => {
    const normalizedCurrent = clampCertaintyFactor(current);
    const normalizedNext = clampCertaintyFactor(next);

    return (
      normalizedCurrent +
      normalizedNext * (1 - normalizedCurrent)
    );
  }, 0);
}

export function getResultLevel(
  score: number,
): "rendah" | "sedang" | "tinggi" {
  if (score >= 0.75) {
    return "tinggi";
  }

  if (score >= 0.4) {
    return "sedang";
  }

  return "rendah";
}

function answerSatisfiesDuration(
  rule: ExpertRule,
  answer: UserAnswer,
): boolean {
  if (!rule.minimumDurationDays) {
    return true;
  }

  if (answer.durationDays == null) {
    return true;
  }

  return answer.durationDays >= rule.minimumDurationDays;
}

export function calculateConditionResult(
  rules: ExpertRule[],
  answers: UserAnswer[],
): InferenceResult | null {
  if (rules.length === 0) {
    return null;
  }

  const answerMap = new Map(
    answers.map((answer) => [answer.symptomId, answer]),
  );

  const missingRequiredSymptoms = rules
    .filter((rule) => rule.isRequired)
    .filter((rule) => {
      const answer = answerMap.get(rule.symptomId);

      if (!answer || answer.userWeight <= 0) {
        return true;
      }

      return !answerSatisfiesDuration(rule, answer);
    })
    .map((rule) => rule.symptomName);

  if (missingRequiredSymptoms.length > 0) {
    return {
      conditionId: rules[0].conditionId,
      conditionName: rules[0].conditionName,
      conditionSlug: rules[0].conditionSlug,
      description: rules[0].conditionDescription,
      recommendation: rules[0].recommendation,
      score: 0,
      percentage: 0,
      level: "rendah",
      matchedSymptoms: [],
      missingRequiredSymptoms,
    };
  }

  const matchedSymptoms: MatchedSymptom[] = rules
    .map((rule) => {
      const answer = answerMap.get(rule.symptomId);

      if (
        !answer ||
        answer.userWeight <= 0 ||
        !answerSatisfiesDuration(rule, answer)
      ) {
        return null;
      }

      const certaintyValue = clampCertaintyFactor(
        rule.expertWeight * answer.userWeight,
      );

      return {
        symptomId: rule.symptomId,
        symptomCode: rule.symptomCode,
        symptomName: rule.symptomName,
        expertWeight: rule.expertWeight,
        userWeight: answer.userWeight,
        certaintyValue,
      };
    })
    .filter(
      (symptom): symptom is MatchedSymptom => symptom !== null,
    );

  const score = combinePositiveCertaintyFactors(
    matchedSymptoms.map((symptom) => symptom.certaintyValue),
  );

  const roundedScore = Number(score.toFixed(4));

  return {
    conditionId: rules[0].conditionId,
    conditionName: rules[0].conditionName,
    conditionSlug: rules[0].conditionSlug,
    description: rules[0].conditionDescription,
    recommendation: rules[0].recommendation,
    score: roundedScore,
    percentage: Math.round(roundedScore * 100),
    level: getResultLevel(roundedScore),
    matchedSymptoms,
    missingRequiredSymptoms: [],
  };
}

export function calculateAllResults(
  rules: ExpertRule[],
  answers: UserAnswer[],
): InferenceResult[] {
  const groupedRules = new Map<string, ExpertRule[]>();

  for (const rule of rules) {
    const currentRules =
      groupedRules.get(rule.conditionId) ?? [];

    currentRules.push(rule);
    groupedRules.set(rule.conditionId, currentRules);
  }

  return Array.from(groupedRules.values())
    .map((conditionRules) =>
      calculateConditionResult(conditionRules, answers),
    )
    .filter(
      (result): result is InferenceResult =>
        result !== null && result.score > 0,
    )
    .sort((first, second) => second.score - first.score);
}