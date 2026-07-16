import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("conditions")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak diketahui.",
      },
      {
        status: 500,
      },
    );
  }
}