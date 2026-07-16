import { redirect } from "next/navigation";
import { requireStaff } from "./require-staff";

export async function requireAdmin() {
  const context = await requireStaff();

  if (context.profile.role !== "admin") {
    redirect("/admin");
  }

  return context;
}