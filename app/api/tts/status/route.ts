import { NextResponse } from "next/server";
import { activeProvider, providerLabel } from "@/lib/tts";

export const runtime = "nodejs";

export async function GET() {
  const provider = activeProvider();
  return NextResponse.json(
    {
      engine: provider ?? "browser",
      native: Boolean(provider),
      label: providerLabel(provider),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
