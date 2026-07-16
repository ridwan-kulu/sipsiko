import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ExpertRule } from "./types";

type ConditionRelation = {
  id: string;
  name: string;
  slug: string;
  description: string;
  recommendation: string;
  is_active: boolean;
};

type SymptomRelation = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type RuleRow = {
  condition_id: string;
  symptom_id: string;
  expert_weight: number | string;
  is_required: boolean;
  minimum_duration_days: number | null;
  conditions:
    | ConditionRelation
    | ConditionRelation[];
  symptoms:
    | SymptomRelation
    | SymptomRelation[];
};

function getSingleRelation<T>(
  relation: T | T[],
): T {
  if (Array.isArray(relation)) {
    const first = relation[0];

    if (!first) {
      throw new Error(
        "Data relasi tidak tersedia.",
      );
    }

    return first;
  }

  return relation;
}

export async function getActiveExpertRules(): Promise<
  ExpertRule[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("rules")
    .select(`
      condition_id,
      symptom_id,
      expert_weight,
      is_required,
      minimum_duration_days,
      conditions!inner (
        id,
        name,
        slug,
        description,
        recommendation,
        is_active
      ),
      symptoms!inner (
        id,
        code,
        name,
        is_active
      )
    `)
    .eq("conditions.is_active", true)
    .eq("symptoms.is_active", true);

  if (error) {
    throw new Error(
      `Basis pengetahuan gagal dimuat: ${error.message}`,
    );
  }

  const rows =
    (data ?? []) as unknown as RuleRow[];

  return rows.map((row) => {
    const condition = getSingleRelation(
      row.conditions,
    );

    const symptom = getSingleRelation(
      row.symptoms,
    );

    return {
      conditionId: row.condition_id,
      conditionName: condition.name,
      conditionSlug: condition.slug,
      conditionDescription:
        condition.description,
      recommendation:
        condition.recommendation,

      symptomId: row.symptom_id,
      symptomCode: symptom.code,
      symptomName: symptom.name,

      expertWeight: Number(
        row.expert_weight,
      ),

      isRequired: row.is_required,

      minimumDurationDays:
        row.minimum_duration_days,
    };
  });
}