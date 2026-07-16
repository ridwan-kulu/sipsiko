import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role
    `)
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    !["admin", "expert"].includes(profile.role)
  ) {
    redirect("/dashboard");
  }

  return {
    supabase,
    user,
    profile: profile as {
      id: string;
      full_name: string | null;
      role: "admin" | "expert";
    },
  };
}