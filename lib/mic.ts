"use client";

/**
 * Microphone access, with the failure modes named.
 *
 * Browsers refuse the microphone in three situations that look identical from
 * inside a drill: the page is embedded in a frame that does not allow it, the
 * user dismissed the permission prompt, or the page is not a secure context.
 * Each one needs different instructions, so each one gets its own result.
 */

export type MicProblem = "embedded" | "denied" | "no-device" | "busy" | "insecure" | "unsupported" | "unknown";

export type MicCheck = {
  ok: boolean;
  problem?: MicProblem;
  message?: string;
  /** True when the page is running inside another page (a preview panel). */
  embedded: boolean;
};

export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function frameAllowsMicrophone(): boolean | null {
  if (typeof document === "undefined") return null;
  const policy = (
    document as Document & {
      permissionsPolicy?: { allowsFeature?: (feature: string) => boolean };
      featurePolicy?: { allowsFeature?: (feature: string) => boolean };
    }
  ).permissionsPolicy ?? (document as Document & { featurePolicy?: { allowsFeature?: (feature: string) => boolean } }).featurePolicy;
  try {
    return policy?.allowsFeature?.("microphone") ?? null;
  } catch {
    return null;
  }
}

export async function microphonePermission(): Promise<PermissionState | "unknown"> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function micProblemCopy(problem: MicProblem): string {
  switch (problem) {
    case "embedded":
      return "This page is embedded in a preview panel, and the panel is not allowed to use the microphone. Open the app in its own tab and the drill will work.";
    case "denied":
      return "The browser blocked the microphone. Click the lock or camera icon next to the address, allow the microphone, then press Speak again.";
    case "no-device":
      return "No microphone was found. Plug one in (or check the input device in your system settings) and try again.";
    case "busy":
      return "The microphone is being used by another app. Close it and try again.";
    case "insecure":
      return "Microphone access needs a secure page. Use localhost during development, or serve the app over https.";
    case "unsupported":
      return "This browser cannot capture audio. Chrome, Edge or Safari can; Firefox support varies.";
    default:
      return "The microphone could not be opened. Check your browser's site settings and try again.";
  }
}

/** Ask the browser for the microphone and release it again. */
export async function requestMicrophone(): Promise<MicCheck> {
  const embedded = isEmbedded();

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { ok: false, problem: "unsupported", message: micProblemCopy("unsupported"), embedded };
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    const problem: MicProblem = window.isSecureContext === false ? "insecure" : "unsupported";
    return { ok: false, problem, message: micProblemCopy(problem), embedded };
  }

  if (embedded && frameAllowsMicrophone() === false) {
    return { ok: false, problem: "embedded", message: micProblemCopy("embedded"), embedded };
  }

  // If the user already said no, do not re-prompt: the browser will reject it
  // instantly and the drill should explain how to undo it instead.
  if ((await microphonePermission()) === "denied") {
    return { ok: false, problem: "denied", message: micProblemCopy("denied"), embedded };
  }

  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new DOMException("timeout", "TimeoutError")), 8000);
  });

  try {
    const stream = await Promise.race([
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      }),
      timeout,
    ]);
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true, embedded };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "TimeoutError") {
      return {
        ok: false,
        problem: "unknown",
        message:
          "The browser never answered the microphone request. Look for a microphone icon or a permission prompt in the address bar, choose Allow, then press Speak again. If no prompt appeared, the site may be blocked in your browser settings.",
        embedded,
      };
    }
    const problem: MicProblem =
      name === "NotAllowedError" || name === "SecurityError"
        ? "denied"
        : name === "NotFoundError" || name === "OverconstrainedError"
          ? "no-device"
          : name === "NotReadableError" || name === "AbortError"
            ? "busy"
            : "unknown";
    return { ok: false, problem, message: micProblemCopy(problem), embedded };
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

export type Recording = {
  stop: () => Promise<string | null>;
  cancel: () => void;
};

/**
 * Capture one sample for browsers without speech recognition, so the learner
 * can still compare their attempt with the native voice.
 */
export async function startRecording(): Promise<Recording | null> {
  if (typeof navigator === "undefined" || typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();

  const release = () => stream.getTracks().forEach((track) => track.stop());

  return {
    stop: () =>
      new Promise<string | null>((resolve) => {
        if (recorder.state === "inactive") {
          release();
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          release();
          const blob = new Blob(chunks, { type: chunks[0]?.type || "audio/webm" });
          resolve(blob.size > 0 ? URL.createObjectURL(blob) : null);
        };
        recorder.stop();
      }),
    cancel: () => {
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        /* already stopped */
      }
      release();
    },
  };
}
