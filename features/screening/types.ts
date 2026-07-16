export type SymptomQuestion = {
  id: string;
  code: string;
  name: string;
  question: string;
  explanation: string | null;
  is_crisis: boolean;
  display_order: number;
};

export type ScreeningAnswer = {
  symptomId: string;
  userWeight: number;
  durationDays?: number | null;
};