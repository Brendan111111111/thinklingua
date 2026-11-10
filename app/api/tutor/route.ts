import { NextResponse } from "next/server";
import { systemPrompt, type ChatMessage, type TutorMode } from "@/lib/tutor";
import type { LangId } from "@/lib/content/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: LangId[] = ["th", "ja", "es", "fr", "ru"];

type Body = {
  lang?: string;
  level?: number;
  mode?: string;
  messages?: ChatMessage[];
  known?: string[];
};

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const FREEBUFF_BASE_URL = "https://freebuff.com/api/v1/paid";
const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";
const DEFAULT_MODEL = "gpt-4o-mini";

type TutorProvider = "gemini" | "openai";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

/**
 * An explicit base URL wins. Otherwise Gemini is selected only when it is the
 * sole configured provider, preserving the existing Freebuff/OpenAI behavior.
 */
function activeProvider(): TutorProvider {
  const configured = env("AI_BASE_URL") || env("OPENAI_BASE_URL");
  if (configured) {
    return configured.includes("generativelanguage.googleapis.com") ? "gemini" : "openai";
  }
  const hasGemini = Boolean(env("GEMINI_API_KEY"));
  const hasOpenAI = Boolean(env("OPENAI_API_KEY") || env("FREEBUFF_API_KEY"));
  return hasGemini && !hasOpenAI ? "gemini" : "openai";
}

function baseUrl(provider: TutorProvider): string {
  const configured = env("AI_BASE_URL") || env("OPENAI_BASE_URL");
  if (configured) return configured.replace(/\/+$/, "");
  return provider === "gemini" ? GEMINI_BASE_URL : FREEBUFF_BASE_URL;
}

function apiKey(provider: TutorProvider): string {
  if (provider === "gemini") {
    return env("GEMINI_API_KEY") || env("OPENAI_API_KEY") || env("FREEBUFF_API_KEY");
  }
  return env("OPENAI_API_KEY") || env("FREEBUFF_API_KEY") || env("GEMINI_API_KEY");
}

function modelFor(provider: TutorProvider): string {
  const override = env("TUTOR_MODEL");
  if (override) return override;
  if (provider === "gemini") return env("GEMINI_MODEL") || GEMINI_DEFAULT_MODEL;
  return DEFAULT_MODEL;
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

  const provider = activeProvider();
  const key = apiKey(provider);
  if (!key) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  const model = modelFor(provider);

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl(provider)}/chat/completions`, {
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
