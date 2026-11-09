import { NextResponse } from "next/server";
import { activeProvider, providerLabel, synthesize } from "@/lib/tts";

export const runtime = "nodejs";

type Body = { text?: string; lang?: string; rate?: number };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const text = (body.text ?? "").trim().slice(0, 400);
  const lang = (body.lang ?? "").trim().slice(0, 12);
  const rate = Math.min(1.5, Math.max(0.55, Number(body.rate) || 1));

  if (!text || !lang) {
    return NextResponse.json({ error: "missing_input" }, { status: 400 });
  }

  if (!activeProvider()) {
    return NextResponse.json({ error: "no_provider", label: providerLabel(null) }, { status: 501 });
  }

  try {
    const { bytes, provider } = await synthesize(text, lang, rate);
    const audio = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new Response(new Blob([audio], { type: "audio/mpeg" }), {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "public, max-age=86400, s-maxage=604800",
        "x-voice-provider": provider,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "tts_failed", detail: error instanceof Error ? error.message : "unknown" },
      { status: 502 },
    );
  }
}
