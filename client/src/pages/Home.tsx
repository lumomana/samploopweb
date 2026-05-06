/*
Style reminder — Samploop / page principale
Philosophie visuelle : console analogique contemporaine, sombre, tactile, asymétrique.
Règles : privilégier les longs canaux horizontaux, les accents colorés par piste, les chiffres lisibles,
les matières de studio et une sensation d’outil réel plutôt que de dashboard générique.
*/

import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSamploopEngine } from "@/hooks/useSamploopEngine";
import {
  assignSampleToTrackState,
  clampBpm,
  createEmptyTrack,
  createFallbackAudioDataUrl,
  defaultEffects,
  getAvailableLibraryItems,
  getReadableTextColor,
  idleWaveform,
  parseWaveformPreview,
  releaseTrackSample,
  sanitizeHexColor,
  trackColors,
  withAlpha,
  type SamploopLibraryItem,
  type TrackEffectsState,
  type TrackState,
} from "@/lib/samploop-engine";
import { effectDefinitions } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  CircleGauge,
  Globe2,
  Library,
  Minus,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Trash2,
  Upload,
  Volume2,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

type EffectField = keyof TrackEffectsState;

const fallbackLibrarySeed: SamploopLibraryItem[] = [
  { id: "a1", name: "Amber Kick Loop", color: "#f59e0b", category: "Drums", bpm: 120, duration: "0:08", isLoop: true },
  { id: "b0", name: "Birds",           color: "#4ade80", category: "Nature", bpm: 0,   duration: "0:12", isLoop: true },
  { id: "a2", name: "Blue Grain Pad",  color: "#60a5fa", category: "Texture", bpm: 84, duration: "0:11", isLoop: true },
  { id: "a3", name: "Coral Vox Chop",  color: "#fb7185", category: "Voice",   bpm: 96, duration: "0:06", isLoop: true },
  { id: "a4", name: "Crystal Click Hat", color: "#67e8f9", category: "Perc", bpm: 132, duration: "0:05", isLoop: true },
  { id: "a5", name: "Forest Drone C",  color: "#4ade80", category: "Drone",  bpm: 70,  duration: "0:14", isLoop: true },
  { id: "a6", name: "Golden Pulse Bass", color: "#facc15", category: "Bass", bpm: 102, duration: "0:07", isLoop: true },
  { id: "a7", name: "Lilac Tape Snare", color: "#c084fc", category: "Drums", bpm: 118, duration: "0:04", isLoop: true },
  { id: "a8", name: "Mint Bell Loop",  color: "#2dd4bf", category: "Melody", bpm: 90,  duration: "0:09", isLoop: true },
  { id: "a9", name: "Rust Texture Sweep", color: "#fb923c", category: "FX", bpm: 110, duration: "0:05", isLoop: true },
  { id: "b1", name: "Velvet Clap Grid", color: "#a78bfa", category: "Perc",  bpm: 124, duration: "0:04", isLoop: true },
  { id: "b2", name: "Warm Organ Stab", color: "#86efac", category: "Keys",   bpm: 88,  duration: "0:06", isLoop: true },
  { id: "b3", name: "Wave Ribbon Lead", color: "#38bdf8", category: "Lead",  bpm: 128, duration: "0:08", isLoop: true },
]
  .map((sample) => ({
    ...sample,
    audioUrl: createFallbackAudioDataUrl(sample.id, sample.bpm, sample.category),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const allowedMimeTypes = new Set(["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm"]);

function formatDuration(durationMs: number | null | undefined) {
  if (!durationMs || Number.isNaN(durationMs)) return "0:00";
  const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function estimateWaveformPreview(file: File) {
  const preview = Array.from({ length: 24 }, (_, index) => {
    const raw = Math.abs(Math.sin((index + 1) * (file.size % 17 || 7)));
    return Number(raw.toFixed(2));
  });
  return JSON.stringify(preview);
}

function colorFromName(name: string) {
  const palette = ["#f59e0b", "#60a5fa", "#fb7185", "#67e8f9", "#4ade80", "#facc15", "#c084fc", "#2dd4bf"];
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[total % palette.length] ?? "#f59e0b";
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(index, index + chunkSize)));
  }

  return btoa(binary);
}

function TrackWave({
  color,
  playing,
  bars,
}: {
  color: string;
  playing: boolean;
  bars: number[];
}) {
  return (
    <div className="track-wave" style={{ gridTemplateColumns: `repeat(${Math.max(12, bars.length)}, minmax(0, 1fr))` }}>
      {bars.map((value, index) => (
        <span
          key={`${color}-${index}`}
          className={playing ? "is-playing" : ""}
          style={{
            height: `${Math.round(Math.max(0.08, Math.min(1, value)) * 100)}%`,
            background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 45%, black))`,
            opacity: playing ? 0.98 : 0.52,
            animationDelay: `${index * 55}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { locale, locales, localeMeta, setLocale, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trpcUtils = trpc.useUtils();
  // Session ID local — identifiant unique par navigateur, stocké en localStorage
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    const stored = localStorage.getItem("samploop_session_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("samploop_session_id", id);
    return id;
  });
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<number>(1);
  const [effectsTrackId, setEffectsTrackId] = useState<number | null>(null);
  const [tracks, setTracks] = useState<TrackState[]>(() => trackColors.map((color, index) => createEmptyTrack(index + 1, color)));

  const libraryQuery = trpc.library.list.useQuery({ sessionId }, {
    staleTime: 20_000,
  });

  const importMutation = trpc.library.importBase64.useMutation({
    onSuccess: async () => {
      await trpcUtils.library.list.invalidate();
      toast.success(t("importSuccess"));
    },
    onError: (error) => {
      toast.error(error.message || t("importFailed"));
    },
  });

  const onTrackPlaybackChange = useCallback((trackId: number, playing: boolean) => {
    setTracks((current) =>
      current.map((track) =>
        track.id === trackId
          ? {
              ...track,
              playing,
            }
          : track,
      ),
    );
  }, []);

  const { ensureAudioReady, isAudioReady, playableTrackIds, waveforms } = useSamploopEngine({
    tracks,
    onTrackPlaybackChange,
  });

  const libraryItems = useMemo<SamploopLibraryItem[]>(() => {
    const backendItems = libraryQuery.data?.samples?.map((sample) => ({
      id: String(sample.id),
      name: sample.name,
      color: sample.dominantColor || colorFromName(sample.name),
      category: sample.category === "Imported" ? t("importedCategory") : sample.category,
      bpm: sample.bpm ?? 100,
      duration: formatDuration(sample.durationMs),
      audioUrl: sample.fileUrl,
      isLoop: sample.isLoop === 1,
      waveformPreview: sample.waveformPreview,
    }));

    return backendItems && backendItems.length > 0 ? backendItems : fallbackLibrarySeed;
  }, [libraryQuery.data?.samples, t]);

  const visibleLibraryItems = useMemo(
    () => getAvailableLibraryItems(libraryItems, tracks, query),
    [libraryItems, query, tracks],
  );

  const usage = libraryQuery.data?.usage;
  const seededShare = usage ? Math.max(0, Math.min(1, usage.seededShare || 0)) : 0.33;
  const userShare = usage ? Math.max(0, Math.min(1, usage.userShare || 0)) : 0.67;

  const activeTrack = tracks.find((track) => track.id === selectedTrack) ?? tracks[0];
  const effectsTrack = tracks.find((track) => track.id === effectsTrackId) ?? activeTrack;
  const effectsCopy = useMemo<Array<{ key: EffectField; label: string; description: string }>>(
    () =>
      effectDefinitions.map((effect) => ({
        key: effect.key as EffectField,
        label: t(effect.labelKey),
        description: t(effect.descriptionKey),
      })),
    [t],
  );

  const activeBpmAverage = Math.round(
    tracks.filter((track) => track.sampleId).reduce((sum, track) => sum + track.bpm, 0) /
      Math.max(1, tracks.filter((track) => track.sampleId).length),
  );
  const getDisplayTrackName = useCallback(
    (track: TrackState) => (track.sampleId ? track.name : `${t("emptySlot")} ${track.id}`),
    [t],
  );

  const updateTrack = useCallback((trackId: number, updater: (track: TrackState) => TrackState) => {
    setTracks((current) => current.map((track) => (track.id === trackId ? updater(track) : track)));
  }, []);

  const assignSampleToTrack = useCallback(
    (trackId: number, sample: SamploopLibraryItem) => {
      setTracks((current) =>
        current.map((track) => (track.id === trackId ? assignSampleToTrackState(track, sample) : track)),
      );
      setSelectedTrack(trackId);
      toast.success(t("sampleLoadedOnTrack", { sampleName: sample.name, trackId }));
    },
    [t],
  );

  const clearTrack = useCallback((trackId: number) => {
    setTracks((current) =>
      current.map((track) =>
        track.id === trackId ? releaseTrackSample(track, trackColors[trackId - 1] ?? track.color) : track,
      ),
    );
    toast.success(t("trackCleared", { trackId }));
  }, []);

  const toggleTrackPlayback = useCallback(
    async (track: TrackState) => {
      if (!track.sampleId) {
        toast.info(t("loadSampleFirst"));
        return;
      }

      if (!track.audioUrl) {
        toast.info(t("missingAudioSource"));
        return;
      }

      try {
        await ensureAudioReady();
        updateTrack(track.id, (current) => ({ ...current, playing: !current.playing }));
      } catch (error) {
        console.error(error);
        toast.error(t("audioEngineStartFailed"));
      }
    },
    [ensureAudioReady, t, updateTrack],
  );

  const handleImportClick = () => {
    inputRef.current?.click();
  };

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!allowedMimeTypes.has(file.type)) {
      toast.error(t("unsupportedFormat"));
      return;
    }

    if (file.size > 24 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);

      audio.addEventListener(
        "loadedmetadata",
        async () => {
          const durationMs = Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 1000;

          await importMutation.mutateAsync({
            sessionId,
            name: file.name.replace(/\.[^.]+$/, ""),
            category: "Imported",
            mimeType: file.type,
            base64Data,
            durationMs,
            bpm: null,
            isLoop: true,
            dominantColor: colorFromName(file.name),
            waveformPreview: estimateWaveformPreview(file),
            originalFileName: file.name,
          });

          URL.revokeObjectURL(audioUrl);
        },
        { once: true },
      );

      audio.addEventListener(
        "error",
        async () => {
          await importMutation.mutateAsync({
            sessionId,
            name: file.name.replace(/\.[^.]+$/, ""),
            category: "Imported",
            mimeType: file.type,
            base64Data,
            durationMs: 1000,
            bpm: null,
            isLoop: true,
            dominantColor: colorFromName(file.name),
            waveformPreview: estimateWaveformPreview(file),
            originalFileName: file.name,
          });

          URL.revokeObjectURL(audioUrl);
        },
        { once: true },
      );

      audio.load();
    } catch (error) {
      console.error(error);
      toast.error(t("importPreparationFailed"));
    }
  };

  const updateEffect = useCallback((trackId: number, effect: EffectField, value: number) => {
    updateTrack(trackId, (track) => ({
      ...track,
      effects: {
        ...track.effects,
        [effect]: Number(value.toFixed(2)),
      },
    }));
  }, [updateTrack]);

  const updateTrackBpm = useCallback((trackId: number, nextBpm: number) => {
    updateTrack(trackId, (track) => ({
      ...track,
      bpm: clampBpm(nextBpm),
    }));
  }, [updateTrack]);

  const updateTrackColor = useCallback((trackId: number, nextColor: string) => {
    updateTrack(trackId, (track) => ({
      ...track,
      color: sanitizeHexColor(nextColor, track.color),
    }));
  }, [updateTrack]);

  return (
    <>
      <div className="samploop-shell">
        <aside className="library-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t("sampleBank")}</p>
              <h1>Samploop</h1>
            </div>
            <div className="panel-header-actions">
              <label className="language-switcher" aria-label={t("languageAria")}>
                <span className="language-switcher-icon" aria-hidden="true">
                  <Globe2 size={16} />
                </span>
                <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}>
                  {locales.map((option) => (
                    <option key={option} value={option}>
                      {localeMeta[option].nativeLabel}
                    </option>
                  ))}
                </select>
              </label>
              <button className="ghost-icon" aria-label={t("viewLibrary")}>
                <Library size={18} />
              </button>
            </div>
          </div>

          <div className="storage-card">
            <div className="storage-copy">
              <p>{t("soundLibrary")}</p>
              <strong>{t("librarySummary")}</strong>
            </div>
            <div className="storage-meters" aria-label={t("storageDistribution")}>
              <div>
                <span>{t("seededContent")}</span>
                <strong>{Math.round(seededShare * 100)}%</strong>
              </div>
              <div>
                <span>{t("userSpace")}</span>
                <strong>{Math.round(userShare * 100)}%</strong>
              </div>
            </div>
            <div className="storage-bar">
              <span className="seeded" style={{ width: `${Math.max(12, seededShare * 100)}%` }} />
              <span className="user-room" style={{ width: `${Math.max(18, userShare * 100)}%` }} />
            </div>
          </div>

          <label className="search-box" htmlFor="sample-search">
            <Search size={16} />
            <input
              id="sample-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchSample")}
            />
          </label>

          <div className="library-toolbar">
            <input ref={inputRef} type="file" accept=".wav,.mp3,.ogg,.webm,audio/*" hidden onChange={handleFileSelection} />
            <button className="action-pill primary-pill" type="button" onClick={handleImportClick} disabled={importMutation.isPending}>
              <Upload size={15} />
              {importMutation.isPending ? t("importing") : t("importSound")}
            </button>
            <button className="action-pill" type="button">
              A–Z
            </button>
          </div>

          <div className="library-list" role="list" aria-label={t("alphabeticalLibrary")}>
            {visibleLibraryItems.map((sample) => (
              <button
                key={sample.id}
                className="sample-row"
                type="button"
                onClick={() => assignSampleToTrack(activeTrack.id, sample)}
              >
                <span className="sample-swatch" style={{ backgroundColor: sample.color }} />
                <span className="sample-main">
                  <strong>{sample.name}</strong>
                  <span>
                    {sample.category} · {sample.duration}
                    {!sample.audioUrl ? ` · ${t("audioPackPending")}` : ` · ${t("readyToPlay")}`}
                  </span>
                </span>
                <span className="sample-bpm">{sample.bpm}</span>
              </button>
            ))}
            {visibleLibraryItems.length === 0 ? (
              <div className="sample-row" aria-live="polite">
                <span className="sample-main">
                  <strong>{t("noSampleAvailable")}</strong>
                  <span>{t("noSampleHint")}</span>
                </span>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="console-panel">
          <header className="console-header">
            <div>
              <p className="eyebrow">{t("webLoopStation")}</p>
              <h2>{t("heroTitle")}</h2>
            </div>
            <div className="console-meta">
              <div>
                <span>{t("activeTracks")}</span>
                <strong>{tracks.filter((track) => track.playing).length}/9</strong>
              </div>
              <div>
                <span>{t("globalIndicativeBpm")}</span>
                <strong>{activeBpmAverage}</strong>
              </div>
              <div>
                <span>{t("audioEngine")}</span>
                <strong>{isAudioReady ? t("audioEngineArmed") : t("audioEngineStandby")}</strong>
              </div>
            </div>
          </header>

          <section className="tracks-stage" aria-label={t("trackStage")}>
            {tracks.map((track) => {
              const bars = track.playing
                ? waveforms[track.id] ?? parseWaveformPreview(track.waveformPreview)
                : track.sampleId
                  ? parseWaveformPreview(track.waveformPreview)
                  : idleWaveform;
              const isPlayable = Boolean(track.sampleId && track.audioUrl && playableTrackIds.includes(track.id));

              return (
                <article
                  key={track.id}
                  className={`track-row ${selectedTrack === track.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="track-index">
                    <span>{String(track.id).padStart(2, "0")}</span>
                  </div>

                  <div className="track-visual-block">
                    <div className="track-label-row">
                      <div className="track-label-main">
                        <div
                          className="track-name-card"
                          style={{
                            background: `linear-gradient(135deg, ${withAlpha(track.color, "F2")}, ${withAlpha(track.color, "99")})`,
                            borderColor: withAlpha(track.color, "AA"),
                            boxShadow: `0 16px 28px ${withAlpha(track.color, "22")}`,
                          }}
                        >
                          <p className="track-name" style={{ color: getReadableTextColor(track.color) }}>{getDisplayTrackName(track)}</p>
                          <span className="track-subline" style={{ color: withAlpha(getReadableTextColor(track.color), "CC") }}>
                            {track.sampleId
                              ? isPlayable
                                ? t("sampleReady")
                                : t("sampleSourcePending")
                              : t("emptySlot")}
                          </span>
                        </div>

                        <label
                          className="track-color-picker"
                          style={{ boxShadow: `0 0 0 1px ${withAlpha(track.color, "55")}, 0 10px 22px ${withAlpha(track.color, "22")}` }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span className="sr-only">{t("chooseTrackColor", { trackId: track.id })}</span>
                          <input
                            type="color"
                            value={sanitizeHexColor(track.color, "#FB7185")}
                            onChange={(event) => updateTrackColor(track.id, event.target.value)}
                            aria-label={t("chooseTrackColor", { trackId: track.id })}
                          />
                        </label>
                      </div>
                      <span className="track-chip" style={{ borderColor: track.color, color: track.color }}>
                        {track.loop ? t("loop") : t("oneShot")}
                      </span>
                    </div>
                    <TrackWave color={track.color} playing={track.playing} bars={bars} />
                  </div>

                  <div className="track-controls">
                    <button
                      className={`square-control ${track.playing ? "active-control" : ""}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void toggleTrackPlayback(track);
                      }}
                      aria-label={track.playing ? t("stop") : t("play")}
                    >
                      {track.playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <button
                      className={`square-control ${track.loop ? "loop-control" : ""}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        updateTrack(track.id, (current) => ({ ...current, loop: !current.loop }));
                      }}
                      aria-label={t("toggleLoop")}
                    >
                      <Repeat size={16} />
                    </button>

                    <label className="volume-stack" onClick={(event) => event.stopPropagation()}>
                      <Volume2 size={16} />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={track.volume}
                        onChange={(event) => {
                          updateTrack(track.id, (current) => ({
                            ...current,
                            volume: Number(event.target.value),
                          }));
                        }}
                        aria-label={t("trackVolume", { trackId: track.id })}
                      />
                    </label>

                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        className="square-control"
                        type="button"
                        aria-label={t("decreaseTrackBpm", { trackId: track.id })}
                        onClick={() => updateTrackBpm(track.id, track.bpm - 5)}
                      >
                        <Minus size={14} />
                      </button>
                      <button className="bpm-dial" type="button" onClick={() => updateTrackBpm(track.id, track.bpm + 5)}>
                        <CircleGauge size={14} />
                        <span>{track.bpm}</span>
                        <small>BPM</small>
                      </button>
                      <button
                        className="square-control"
                        type="button"
                        aria-label={t("increaseTrackBpm", { trackId: track.id })}
                        onClick={() => updateTrackBpm(track.id, track.bpm + 5)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      className="square-control"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTrack(track.id);
                        setEffectsTrackId(track.id);
                      }}
                      aria-label={t("openEffects")}
                    >
                      <Waves size={16} />
                    </button>

                    <button
                      className="square-control danger-control"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearTrack(track.id);
                      }}
                      aria-label={t("removeTrackSample")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </main>

        <aside className="effects-drawer">
          <div className="effects-header">
            <div>
              <p className="eyebrow">{t("trackFocus")}</p>
              <h3>{t("trackLabel", { trackId: activeTrack.id })}</h3>
            </div>
            <button className="ghost-icon" type="button" aria-label={t("openEffects")} onClick={() => setEffectsTrackId(activeTrack.id)}>
              <Waves size={18} />
            </button>
          </div>

          <div className="effects-hero">
            <div>
              <p className="effects-track-name">{getDisplayTrackName(activeTrack)}</p>
              <span className="effects-track-meta">
                {activeTrack.sampleId ? t("effectsChainReady") : t("effectsChainEmpty")}
              </span>
            </div>
            <Waves size={20} />
          </div>

          <div className="effects-grid">
            {effectsCopy.map((effect) => (
              <section key={effect.key} className="effect-card">
                <div>
                  <h4>{effect.label}</h4>
                  <p>{effect.description}</p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((activeTrack.effects[effect.key] ?? defaultEffects[effect.key]) * 100)}
                  onChange={(event) => updateEffect(activeTrack.id, effect.key, Number(event.target.value) / 100)}
                  aria-label={t("effectsAmount", { effect: effect.label })}
                />
              </section>
            ))}
          </div>
        </aside>
      </div>

      <Dialog open={effectsTrackId !== null} onOpenChange={(open) => !open && setEffectsTrackId(null)}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#1E1729] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{t("effectsModalTitle", { trackId: effectsTrack.id })}</DialogTitle>
            <DialogDescription className="text-white/65">
              {t("effectsModalDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {effectsCopy.map((effect) => (
              <section key={effect.key} className="effect-card rounded-3xl border border-white/10 bg-white/5 p-4">
                <div>
                  <h4>{effect.label}</h4>
                  <p>{effect.description}</p>
                </div>
                <div className="mt-3 grid gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((effectsTrack.effects[effect.key] ?? defaultEffects[effect.key]) * 100)}
                    onChange={(event) => updateEffect(effectsTrack.id, effect.key, Number(event.target.value) / 100)}
                    aria-label={t("effectsAmount", { effect: effect.label })}
                  />
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/55">
                    <span>{t("dry")}</span>
                    <strong className="text-white/80">{Math.round((effectsTrack.effects[effect.key] ?? 0) * 100)}%</strong>
                    <span>{t("wet")}</span>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
