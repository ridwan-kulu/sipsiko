import { createClient } from "@/lib/supabase/server";
import { Questionnaire } from "@/components/screening/questionnaire";
import type { SymptomQuestion } from "@/features/screening/types";

export const metadata = {
  title: "Pertanyaan Skrining",
};

export default async function QuestionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("symptoms")
    .select(`
      id,
      code,
      name,
      question,
      explanation,
      is_crisis,
      display_order
    `)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Gagal mengambil pertanyaan: ${error.message}`,
    );
  }

  const questions = (data ?? []) as SymptomQuestion[];

  if (questions.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Pertanyaan belum tersedia
          </h1>

          <p className="mt-3 text-slate-600">
            Pastikan data gejala sudah dimasukkan ke Supabase.
          </p>
        </div>
      </main>
    );
  }

  return <Questionnaire questions={questions} />;
}