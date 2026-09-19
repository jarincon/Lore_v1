import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 para que el navegador siga con GET tras el POST.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
