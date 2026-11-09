/**
 * Pitch (F0) analysis for tone feedback.
 *
 * Pure DSP with no DOM dependencies, so it can be exercised in Node:
 *   extractPitch(samples, sampleRate) → frame-by-frame F0 via YIN
 *   contourFromTrack(track)           → 24-point semitone contour
 *   melodyScore(user, reference)      → 0–100 DTW comparison
 *
 * Both contours are normalised to semitones around their own median, so a low
 * voice and a high voice are compared on shape, not on absolute pitch.
 */

export type PitchTrack = {
  times: number[];
  /** Hz per frame; 0 means unvoiced. */
  hz: number[];
  rms: number[];
  sampleRate: number;
};

export const CONTOUR_POINTS = 24;
const MIN_HZ = 70;
const MAX_HZ = 500;
const FRAME_SECONDS = 0.04;
const HOP_SECONDS = 0.02;
const YIN_THRESHOLD = 0.15;
const SILENCE_RMS = 0.008;

export function extractPitch(samples: Float32Array, sampleRate: number): PitchTrack {
  const times: number[] = [];
  const hz: number[] = [];
  const rms: number[] = [];
  if (!samples.length || sampleRate <= 0) return { times, hz, rms, sampleRate };

  const frame = Math.max(256, Math.round(sampleRate * FRAME_SECONDS));
  const hop = Math.max(128, Math.round(sampleRate * HOP_SECONDS));
  const windowSize = Math.min(frame, 1200);
  const minLag = Math.max(2, Math.floor(sampleRate / MAX_HZ));
  const maxLag = Math.min(windowSize - 1, Math.floor(sampleRate / MIN_HZ));
  if (maxLag <= minLag) return { times, hz, rms, sampleRate };

  const diff = new Float64Array(maxLag + 1);
  const cmnd = new Float64Array(maxLag + 1);

  for (let start = 0; start + windowSize <= samples.length; start += hop) {
    let energy = 0;
    for (let i = 0; i < windowSize; i += 1) {
      const sample = samples[start + i];
      energy += sample * sample;
    }
    const level = Math.sqrt(energy / windowSize);
    times.push(start / sampleRate);
    rms.push(level);
    if (level < SILENCE_RMS) {
      hz.push(0);
      continue;
    }

    for (let tau = minLag; tau <= maxLag; tau += 1) {
      let sum = 0;
      const limit = Math.min(windowSize - tau, 900);
      for (let i = 0; i < limit; i += 1) {
        const delta = samples[start + i] - samples[start + i + tau];
        sum += delta * delta;
      }
      diff[tau] = sum;
    }

    let running = 0;
    cmnd[0] = 1;
    for (let tau = 1; tau <= maxLag; tau += 1) {
      running += diff[tau];
      cmnd[tau] = running > 0 ? (diff[tau] * tau) / running : 1;
    }

    let best = -1;
    for (let tau = minLag; tau <= maxLag; tau += 1) {
      if (cmnd[tau] < YIN_THRESHOLD) {
        while (tau + 1 <= maxLag && cmnd[tau + 1] < cmnd[tau]) tau += 1;
        best = tau;
        break;
      }
    }
    if (best < 0) {
      let minimum = Infinity;
      for (let tau = minLag; tau <= maxLag; tau += 1) {
        if (cmnd[tau] < minimum) {
          minimum = cmnd[tau];
          best = tau;
        }
      }
      if (best < 0 || minimum > 0.5) {
        hz.push(0);
        continue;
      }
    }

    const left = cmnd[Math.max(minLag, best - 1)];
    const centre = cmnd[best];
    const right = cmnd[Math.min(maxLag, best + 1)];
    const denominator = left - 2 * centre + right;
    const shift = denominator !== 0 ? (0.5 * (left - right)) / denominator : 0;
    const refined = best + Math.max(-0.5, Math.min(0.5, shift));
    const frequency = sampleRate / refined;
    hz.push(frequency >= MIN_HZ && frequency <= MAX_HZ ? frequency : 0);
  }

  return { times, hz, rms, sampleRate };
}

function medianSmooth(values: number[], radius = 1): number[] {
  return values.map((_, index) => {
    const window = values.slice(Math.max(0, index - radius), Math.min(values.length, index + radius + 1)).sort((a, b) => a - b);
    return window[Math.floor(window.length / 2)];
  });
}

function resample(values: number[], points: number): number[] {
  if (values.length === points) return [...values];
  if (values.length === 1) return new Array(points).fill(values[0]);
  const output: number[] = [];
  for (let i = 0; i < points; i += 1) {
    const position = (i / (points - 1)) * (values.length - 1);
    const left = Math.floor(position);
    const right = Math.min(values.length - 1, left + 1);
    const fraction = position - left;
    output.push(values[left] * (1 - fraction) + values[right] * fraction);
  }
  return output;
}

/** Semitone contour around the speaker's own median pitch. Null if too little voice. */
export function contourFromTrack(track: PitchTrack): number[] | null {
  const voiced = track.hz.filter((value) => value > 0);
  if (voiced.length < 6) return null;

  const sorted = [...voiced].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (!median) return null;

  const semitones = medianSmooth(
    voiced.map((value) => 12 * Math.log2(value / median)),
    1,
  );

  return resample(semitones, CONTOUR_POINTS).map((value) => Math.max(-12, Math.min(12, value)));
}

export type ContourAlignment = {
  /** Mean absolute semitone gap along the warping path. */
  distance: number;
  /** Monotonic [referenceIndex, userIndex] pairs, earliest first. */
  pairs: Array<[number, number]>;
};

/**
 * Dynamic time warping over two pitch contours. Timing differences (a learner
 * speaking slower than the model) should not count as wrong notes, but a
 * different shape should. The path is returned so callers can score slices of
 * the line without re-aligning them.
 */
export function alignContours(a: number[], b: number[]): ContourAlignment | null {
  const n = a.length;
  const m = b.length;
  if (!n || !m) return null;

  const band = Math.max(4, Math.ceil(Math.max(n, m) * 0.35));
  const INF = 1e9;
  const cost: Float64Array[] = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(INF));
  cost[0]![0] = 0;

  for (let i = 1; i <= n; i += 1) {
    const from = Math.max(1, i - band);
    const to = Math.min(m, i + band);
    for (let j = from; j <= to; j += 1) {
      const best = Math.min(cost[i - 1]![j]!, cost[i]![j - 1]!, cost[i - 1]![j - 1]!);
      if (best >= INF) continue;
      cost[i]![j] = Math.abs(a[i - 1]! - b[j - 1]!) + best;
    }
  }

  if (cost[n]![m]! >= INF) return null;

  const pairs: Array<[number, number]> = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    pairs.push([i - 1, j - 1]);
    const diagonal = cost[i - 1]![j - 1]!;
    const up = cost[i - 1]![j]!;
    const left = cost[i]![j - 1]!;
    if (diagonal <= up && diagonal <= left) {
      i -= 1;
      j -= 1;
    } else if (up <= left) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  while (i > 0) {
    pairs.push([i - 1, 0]);
    i -= 1;
  }
  while (j > 0) {
    pairs.push([0, j - 1]);
    j -= 1;
  }
  pairs.reverse();

  return { distance: cost[n]![m]! / Math.max(n, m), pairs };
}

export function contourDistance(a: number[], b: number[]): number {
  const alignment = alignContours(a, b);
  return alignment ? alignment.distance : Infinity;
}

export type MelodyAnalysis = {
  melody: number | null;
  user: number[] | null;
  reference: number[] | null;
};

/** 0–100 pitch-contour match. One semitone average difference ≈ 87. */
export function melodyScore(user: number[] | null, reference: number[] | null): number | null {
  if (!user || !reference || user.length < 6 || reference.length < 6) return null;
  const distance = contourDistance(user, reference);
  if (!Number.isFinite(distance)) return null;
  return Math.round(Math.max(0, Math.min(100, 100 - distance * 13)));
}
