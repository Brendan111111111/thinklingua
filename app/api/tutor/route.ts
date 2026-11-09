import { NextResponse } from "next/server";
import { systemPrompt, type ChatMessage, type TutorMode } from "@/lib/tutor";
import type { LangId } from "@/lib/content/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: LangId[] = ["th", "ja", "es", "fr"];

type Body = {
  lang?: string;
  level?: number;
  mode?: string;
  messages?: ChatMessage[];
  known?: string[];
};

function baseUrl(): string {
  const configured = process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://freebuff.com/api/v1/paid";
  return configured.replace(/\/+$/, "");
}

function apiKey(): string {
  return (process.env.OPENAI_API_KEY ?? process.env.FREEBUFF_API_KEY ?? "").trim();
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const lang = (LANGS as string[]).includes(body.lang ?? "") ? (body.lang as LangId) : "th";
  const mode: TutorMode = body.mode === "explain" ? "explain" : "chat";
  const level = Math.min(6, Math.max(1, Math.round(Number(body.level) || 1)));
  const history = (body.messages ?? [])
    .filter((message) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
    .slice(-14)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 1200) }));

  if (history.length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const key = apiKey();
  if (!key) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  const model = process.env.TUTOR_MODEL ?? "gpt-4o-mini";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 260,
        messages: [
          { role: "system", content: systemPrompt({ lang, level, mode, known: body.known ?? [] }) },
          ...history,
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("tutor upstream failed", upstream.status, detail.slice(0, 300));
    return NextResponse.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let output = "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            if (output) controller.enqueue(encoder.encode(output));
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            output += parsed.choices?.[0]?.delta?.content ?? "";
          } catch {
            /* keep-alive or partial frame */
          }
        }

        if (output) {
          controller.enqueue(encoder.encode(output));
          return;
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
