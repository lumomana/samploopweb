export type SamploopLibraryItem = {
  id: string;
  name: string;
  color: string;
  category: string;
  bpm: number;
  duration: string;
  audioUrl?: string;
  isLoop?: boolean;
  waveformPreview?: string | null;
};

export type TrackEffectsState = {
  reverb: number;
  delay: number;
  delayFeedback: number;
  distortion: number;
  chorus: number;
  compressor: number;
};

export type TrackState = {
  id: number;
  name: string;
  color: string;
  playing: boolean;
  loop: boolean;
  volume: number;
  bpm: number;
  sampleId?: string;
  audioUrl?: string;
  sourceBpm?: number;
  waveformPreview?: string | null;
  effects: TrackEffectsState;
};

export const trackColors = [
  "#fb7185",
  "#facc15",
  "#67e8f9",
  "#c084fc",
  "#2dd4bf",
  "#f97316",
  "#60a5fa",
  "#4ade80",
  "#f59e0b",
] as const;

export const defaultEffects: TrackEffectsState = {
  reverb: 0.18,
  delay: 0.12,
  delayFeedback: 0.24,
  distortion: 0,
  chorus: 0.08,
  compressor: 0.28,
};

export const idleWaveform = [0.2, 0.34, 0.46, 0.58, 0.38, 0.22, 0.3, 0.52, 0.66, 0.44, 0.26, 0.18];

const fallbackAudioCache = new Map<string, string>();

function hashSeed(seed: string) {
  return Array.from(seed).reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 1), 0);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(index, index + chunkSize)));
  }

  return btoa(binary);
}

function createWavDataUrl(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

export function createFallbackAudioDataUrl(seed: string, bpm: number, category: string) {
  const cacheKey = `${seed}-${bpm}-${category}`;
  const cached = fallbackAudioCache.get(cacheKey);
  if (cached) return cached;

  const sampleRate = 22050;
  const durationSeconds = 1.6;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const categoryHash = hashSeed(category || seed);
  const root = 110 + (categoryHash % 220);
  const accent = root * (1.5 + (categoryHash % 5) * 0.1);
  const beatInterval = Math.max(0.12, 60 / Math.max(60, bpm || 100));
  const samples = new Float32Array(totalSamples);

  for (let index = 0; index < totalSamples; index += 1) {
    const time = index / sampleRate;
    const localBeat = time % beatInterval;
    const envelope = Math.exp(-localBeat * (8 + (categoryHash % 7)));
    const sub = Math.sin(2 * Math.PI * root * time) * 0.36;
    const harmonic = Math.sin(2 * Math.PI * accent * time) * 0.18;
    const air = Math.sin(2 * Math.PI * (accent * 2.02) * time) * 0.06;
    const tremolo = 0.75 + 0.25 * Math.sin(2 * Math.PI * (1 + (categoryHash % 4)) * time);
    samples[index] = (sub + harmonic + air) * envelope * tremolo;
  }

  const dataUrl = createWavDataUrl(samples, sampleRate);
  fallbackAudioCache.set(cacheKey, dataUrl);
  return dataUrl;
}

export function createEmptyTrack(id: number, color: string): TrackState {
  return {
    id,
    name: `Empty Slot ${id}`,
    color,
    playing: false,
    loop: true,
    volume: 72,
    bpm: 100,
    effects: { ...defaultEffects },
  };
}

export function assignSampleToTrackState(track: TrackState, sample: SamploopLibraryItem): TrackState {
  return {
    ...track,
    name: sample.name,
    bpm: sample.bpm || track.bpm,
    sourceBpm: sample.bpm || undefined,
    sampleId: sample.id,
    audioUrl: sample.audioUrl,
    waveformPreview: sample.waveformPreview ?? null,
    loop: sample.isLoop ?? true,
    color: sample.color,
  };
}

export function releaseTrackSample(track: TrackState, fallbackColor: string): TrackState {
  return {
    ...createEmptyTrack(track.id, fallbackColor),
    volume: track.volume,
    bpm: 100,
    effects: { ...track.effects },
  };
}

export function getAssignedSampleIds(tracks: TrackState[]) {
  return new Set(tracks.map((track) => track.sampleId).filter(Boolean) as string[]);
}

export function getAvailableLibraryItems(allSamples: SamploopLibraryItem[], tracks: TrackState[], query: string) {
  const assigned = getAssignedSampleIds(tracks);
  const normalizedQuery = query.trim().toLowerCase();

  return allSamples
    .filter((sample) => !assigned.has(sample.id))
    .filter((sample) => `${sample.name} ${sample.category}`.toLowerCase().includes(normalizedQuery))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function clampBpm(bpm: number) {
  return Math.max(40, Math.min(240, Math.round(bpm)));
}

export function computePlaybackRate(trackBpm: number, sourceBpm?: number) {
  if (!sourceBpm || sourceBpm <= 0) return 1;
  return Math.max(0.5, Math.min(2.5, trackBpm / sourceBpm));
}

export function parseWaveformPreview(preview?: string | null) {
  if (!preview) return idleWaveform;

  try {
    const parsed = JSON.parse(preview) as number[];
    if (!Array.isArray(parsed) || parsed.length === 0) return idleWaveform;

    return parsed.map((value) => Math.max(0.08, Math.min(1, Number(value) || 0.08)));
  } catch {
    return idleWaveform;
  }
}

export function normalizeWaveformValues(values: ArrayLike<number>) {
  const source = Array.from(values)
    .map((value) => Number(value) || 0)
    .filter((value) => Number.isFinite(value));

  if (source.length === 0) return idleWaveform;

  const targetCount = Math.min(24, source.length);
  const bucketSize = source.length / targetCount;

  return Array.from({ length: targetCount }, (_, index) => {
    const start = Math.floor(index * bucketSize);
    const end = Math.max(start + 1, Math.floor((index + 1) * bucketSize));
    const bucket = source.slice(start, end);

    if (bucket.length === 0) return 0.08;
    if (bucket.length === 1) {
      return Math.max(0.08, Math.min(1, Math.abs(bucket[0] ?? 0)));
    }

    const magnitudes = bucket.map((value) => Math.abs(value));
    const average = magnitudes.reduce((sum, value) => sum + value, 0) / magnitudes.length;
    const rms = Math.sqrt(magnitudes.reduce((sum, value) => sum + value ** 2, 0) / magnitudes.length);
    const peak = Math.max(...magnitudes);
    const shaped = Math.max(average * 1.55, rms * 1.3, peak * 0.92);

    return Math.max(0.08, Math.min(1, Number(Math.pow(shaped, 0.9).toFixed(3))));
  });
}

export function smoothWaveformValues(previous: number[] | undefined, next: number[]) {
  if (!previous || previous.length === 0) return next;

  return next.map((value, index) => {
    const prior = previous[index] ?? value;
    const eased = value >= prior ? value : prior * 0.78 + value * 0.22;
    return Math.max(0.08, Math.min(1, Number(eased.toFixed(3))));
  });
}

export function createWaveBarStyle({
  value,
  color,
  playing,
  index,
}: {
  value: number;
  color: string;
  playing: boolean;
  index: number;
}) {
  const normalized = Math.max(0.08, Math.min(1, value));

  return {
    height: `${Math.round(normalized * 100)}%`,
    background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 45%, black))`,
    opacity: playing ? 0.98 : 0.52,
    animationDelay: `${index * 55}ms`,
  };
}

export function percentToUnit(value: number) {
  return Math.max(0, Math.min(1, value / 100));
}

export function sanitizeHexColor(value: string, fallback: string) {
  const normalized = value.trim();
  const shortHexMatch = /^#([0-9a-fA-F]{3})$/.exec(normalized);
  if (shortHexMatch) {
    const expanded = shortHexMatch[1]
      .split("")
      .map((character) => `${character}${character}`)
      .join("")
      .toUpperCase();
    return `#${expanded}`;
  }

  const longHexMatch = /^#([0-9a-fA-F]{6})$/.exec(normalized);
  if (longHexMatch) {
    return `#${longHexMatch[1].toUpperCase()}`;
  }

  return fallback;
}

export function getReadableTextColor(hexColor: string) {
  const safeHex = sanitizeHexColor(hexColor, "#111111").slice(1);
  const red = Number.parseInt(safeHex.slice(0, 2), 16);
  const green = Number.parseInt(safeHex.slice(2, 4), 16);
  const blue = Number.parseInt(safeHex.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? "#111111" : "#FFF7ED";
}

export function withAlpha(hexColor: string, alphaHex: string) {
  const safeHex = sanitizeHexColor(hexColor, "#111111");
  const safeAlpha = /^[0-9a-fA-F]{2}$/.test(alphaHex) ? alphaHex.toUpperCase() : "FF";
  return `${safeHex}${safeAlpha}`;
}
