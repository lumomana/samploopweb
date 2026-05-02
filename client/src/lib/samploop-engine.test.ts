import { describe, expect, it } from "vitest";
import {
  assignSampleToTrackState,
  computePlaybackRate,
  createFallbackAudioDataUrl,
  createEmptyTrack,
  getAvailableLibraryItems,
  getReadableTextColor,
  normalizeWaveformValues,
  parseWaveformPreview,
  smoothWaveformValues,
  releaseTrackSample,
  sanitizeHexColor,
  withAlpha,
} from "./samploop-engine";

describe("samploop-engine", () => {
  it("crée une piste vide cohérente", () => {
    const track = createEmptyTrack(3, "#60a5fa");

    expect(track.id).toBe(3);
    expect(track.name).toBe("Empty Slot 3");
    expect(track.color).toBe("#60a5fa");
    expect(track.sampleId).toBeUndefined();
    expect(track.playing).toBe(false);
    expect(track.loop).toBe(true);
  });

  it("assigne un sample à une piste en reprenant les métadonnées audio utiles", () => {
    const track = createEmptyTrack(1, "#fb7185");
    const assigned = assignSampleToTrackState(track, {
      id: "sample-1",
      name: "Azure Bass Loop",
      color: "#67e8f9",
      category: "Bass",
      bpm: 92,
      duration: "0:08",
      audioUrl: "https://cdn.example.com/bass.wav",
      isLoop: false,
      waveformPreview: "[0.1,0.2,0.3]",
    });

    expect(assigned.sampleId).toBe("sample-1");
    expect(assigned.name).toBe("Azure Bass Loop");
    expect(assigned.audioUrl).toBe("https://cdn.example.com/bass.wav");
    expect(assigned.loop).toBe(false);
    expect(assigned.bpm).toBe(92);
    expect(assigned.sourceBpm).toBe(92);
    expect(assigned.waveformPreview).toBe("[0.1,0.2,0.3]");
  });

  it("retire proprement un sample d’une piste tout en conservant son volume et ses effets", () => {
    const track = {
      ...createEmptyTrack(2, "#facc15"),
      sampleId: "sample-2",
      name: "Coral Texture",
      audioUrl: "https://cdn.example.com/texture.wav",
      volume: 88,
      effects: {
        reverb: 0.55,
        delay: 0.3,
        delayFeedback: 0.4,
        distortion: 0.1,
        chorus: 0.25,
        compressor: 0.7,
      },
    };

    const released = releaseTrackSample(track, "#facc15");

    expect(released.sampleId).toBeUndefined();
    expect(released.audioUrl).toBeUndefined();
    expect(released.name).toBe("Empty Slot 2");
    expect(released.color).toBe("#facc15");
    expect(released.volume).toBe(88);
    expect(released.effects).toEqual(track.effects);
  });

  it("n’affiche dans la bibliothèque que les samples non déjà assignés et correspondant à la recherche", () => {
    const samples = [
      { id: "a", name: "Amber Kick", color: "#f59e0b", category: "Drums", bpm: 120, duration: "0:08" },
      { id: "b", name: "Blue Pad", color: "#60a5fa", category: "Texture", bpm: 84, duration: "0:11" },
      { id: "c", name: "Coral Vox", color: "#fb7185", category: "Voice", bpm: 96, duration: "0:06" },
    ];
    const tracks = [
      { ...createEmptyTrack(1, "#111111"), sampleId: "b" },
      createEmptyTrack(2, "#222222"),
    ];

    const available = getAvailableLibraryItems(samples, tracks, "co");

    expect(available).toHaveLength(1);
    expect(available[0]?.id).toBe("c");
  });

  it("calcule un playbackRate borné à partir du BPM source", () => {
    expect(computePlaybackRate(120, 60)).toBe(2);
    expect(computePlaybackRate(30, 180)).toBe(0.5);
    expect(computePlaybackRate(400, 100)).toBe(2.5);
    expect(computePlaybackRate(120)).toBe(1);
  });

  it("normalise les aperçus de waveform et protège les entrées invalides", () => {
    expect(parseWaveformPreview("[0.05,0.2,3]")).toEqual([0.08, 0.2, 1]);
    expect(parseWaveformPreview("not-json").length).toBeGreaterThan(0);
    expect(normalizeWaveformValues([0, -0.4, 2])).toEqual([0.08, 0.4, 1]);
  });

  it("regroupe les longues waveforms temps réel en barres plus expressives au lieu d’une ligne aplatie", () => {
    const analyzerValues = Array.from({ length: 128 }, (_, index) => Math.sin(index / 4) * 0.35);
    const normalized = normalizeWaveformValues(analyzerValues);

    expect(normalized).toHaveLength(24);
    expect(Math.max(...normalized)).toBeGreaterThan(0.2);
    expect(new Set(normalized.map((value) => value.toFixed(3))).size).toBeGreaterThan(10);
  });

  it("lisse les chutes brutales pour conserver une modulation visuellement stable d’une trame à l’autre", () => {
    expect(smoothWaveformValues([0.6, 0.2], [0.1, 0.4])).toEqual([0.49, 0.4]);
    expect(smoothWaveformValues(undefined, [0.1, 0.4])).toEqual([0.1, 0.4]);
  });

  it("génère un audio fallback stable et jouable pour les samples de démonstration", () => {
    const first = createFallbackAudioDataUrl("sample-a", 120, "Drums");
    const second = createFallbackAudioDataUrl("sample-a", 120, "Drums");

    expect(first.startsWith("data:audio/wav;base64,")).toBe(true);
    expect(second).toBe(first);
  });

  it("normalise les couleurs hexadécimales et protège les entrées invalides", () => {
    expect(sanitizeHexColor("#abc", "#112233")).toBe("#AABBCC");
    expect(sanitizeHexColor("#9e7f2b", "#112233")).toBe("#9E7F2B");
    expect(sanitizeHexColor("invalid", "#112233")).toBe("#112233");
    expect(withAlpha("#9e7f2b", "cc")).toBe("#9E7F2BCC");
  });

  it("choisit une couleur de texte lisible selon la luminosité de fond", () => {
    expect(getReadableTextColor("#FACC15")).toBe("#111111");
    expect(getReadableTextColor("#1F2937")).toBe("#FFF7ED");
  });
});
