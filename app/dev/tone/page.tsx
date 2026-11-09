import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToneHarness } from "@/components/dev/ToneHarness";

export const metadata: Metadata = {
  title: "Tone harness — ThinkLingua",
  robots: { index: false, follow: false },
};

/**
 * Development-only harness for the Thai tone pipeline. It exists so the WAV ->
 * decode -> F0 -> syllable feedback path can be exercised without a microphone.
 * Production builds render a 404 here.
 */
export default function ToneHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-ink px-5 py-12 text-cream">
      <ToneHarness />
    </main>
  );
}
