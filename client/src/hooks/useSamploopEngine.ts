import { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { computePlaybackRate, normalizeWaveformValues, percentToUnit, smoothWaveformValues, type TrackState } from "@/lib/samploop-engine";

type TrackAudioGraph = {
  sourceUrl: string;
  player: Tone.Player;
  distortion: Tone.Distortion;
  chorus: Tone.Chorus;
  delay: Tone.FeedbackDelay;
  reverb: Tone.Reverb;
  compressor: Tone.Compressor;
  volume: Tone.Volume;
  analyser: Tone.Analyser;
};

type UseSamploopEngineOptions = {
  tracks: TrackState[];
  onTrackPlaybackChange: (trackId: number, playing: boolean) => void;
};

function volumePercentToDb(volume: number) {
  if (volume <= 0) return -48;
  return Tone.gainToDb(percentToUnit(volume));
}

async function buildTrackAudioGraph(track: TrackState, onTrackPlaybackChange: (trackId: number, playing: boolean) => void) {
  const player = new Tone.Player({
    autostart: false,
    loop: track.loop,
    url: track.audioUrl,
    onstop: () => {
      onTrackPlaybackChange(track.id, false);
    },
  });

  const distortion = new Tone.Distortion(track.effects.distortion);
  const chorus = new Tone.Chorus({
    frequency: 1.6,
    delayTime: 3.5,
    depth: Math.max(0.1, track.effects.chorus),
    wet: track.effects.chorus,
  }).start();
  const delay = new Tone.FeedbackDelay({
    delayTime: "8n",
    feedback: track.effects.delayFeedback,
    wet: track.effects.delay,
  });
  const reverb = new Tone.Reverb({
    decay: 3.4,
    preDelay: 0.02,
    wet: track.effects.reverb,
  });
  const compressor = new Tone.Compressor({
    threshold: -36 + track.effects.compressor * 24,
    ratio: 2 + track.effects.compressor * 8,
  });
  const volume = new Tone.Volume(volumePercentToDb(track.volume));
  const analyser = new Tone.Analyser("waveform", 128);

  player.chain(distortion, chorus, delay, reverb, compressor, volume);
  volume.fan(analyser, Tone.getDestination());

  await Tone.loaded();
  await reverb.ready;

  player.playbackRate = computePlaybackRate(track.bpm, track.sourceBpm);

  return {
    sourceUrl: track.audioUrl ?? "",
    player,
    distortion,
    chorus,
    delay,
    reverb,
    compressor,
    volume,
    analyser,
  } satisfies TrackAudioGraph;
}

function disposeTrackAudioGraph(graph: TrackAudioGraph | undefined) {
  if (!graph) return;
  graph.player.dispose();
  graph.distortion.dispose();
  graph.chorus.dispose();
  graph.delay.dispose();
  graph.reverb.dispose();
  graph.compressor.dispose();
  graph.volume.dispose();
  graph.analyser.dispose();
}

export function useSamploopEngine({ tracks, onTrackPlaybackChange }: UseSamploopEngineOptions) {
  const graphsRef = useRef(new Map<number, TrackAudioGraph>());
  const waveformsRef = useRef<Record<number, number[]>>({});
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [waveforms, setWaveforms] = useState<Record<number, number[]>>({});

  const playableTrackIds = useMemo(() => tracks.filter((track) => track.audioUrl).map((track) => track.id), [tracks]);

  const ensureAudioReady = async () => {
    await Tone.start();
    setIsAudioReady(true);
  };

  useEffect(() => {
    let cancelled = false;

    const syncGraphs = async () => {
      for (const track of tracks) {
        const current = graphsRef.current.get(track.id);

        if (!track.audioUrl) {
          if (current) {
            current.player.stop();
            disposeTrackAudioGraph(current);
            graphsRef.current.delete(track.id);
          }
          continue;
        }

        if (!current || current.sourceUrl !== track.audioUrl) {
          if (current) {
            current.player.stop();
            disposeTrackAudioGraph(current);
            graphsRef.current.delete(track.id);
          }

          const graph = await buildTrackAudioGraph(track, onTrackPlaybackChange);
          if (cancelled) {
            disposeTrackAudioGraph(graph);
            return;
          }
          graphsRef.current.set(track.id, graph);
        }

        const graph = graphsRef.current.get(track.id);
        if (!graph) continue;

        graph.player.loop = track.loop;
        graph.player.playbackRate = computePlaybackRate(track.bpm, track.sourceBpm);
        graph.volume.volume.value = volumePercentToDb(track.volume);
        graph.distortion.distortion = track.effects.distortion;
        graph.chorus.depth = Math.max(0.1, track.effects.chorus);
        graph.chorus.wet.value = track.effects.chorus;
        graph.delay.wet.value = track.effects.delay;
        graph.delay.feedback.value = track.effects.delayFeedback;
        graph.reverb.wet.value = track.effects.reverb;
        graph.compressor.threshold.value = -36 + track.effects.compressor * 24;
        graph.compressor.ratio.value = 2 + track.effects.compressor * 8;

        const started = graph.player.state === "started";
        if (track.playing && isAudioReady && !started) {
          graph.player.start();
        }
        if (!track.playing && started) {
          graph.player.stop();
        }
      }

      for (const [trackId, graph] of Array.from(graphsRef.current.entries())) {
        const stillExists = tracks.some((track) => track.id === trackId && track.audioUrl);
        if (!stillExists) {
          graph.player.stop();
          disposeTrackAudioGraph(graph);
          graphsRef.current.delete(trackId);
        }
      }
    };

    void syncGraphs();

    return () => {
      cancelled = true;
    };
  }, [isAudioReady, onTrackPlaybackChange, tracks]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const nextWaveforms: Record<number, number[]> = {};
      for (const [trackId, graph] of Array.from(graphsRef.current.entries())) {
        const values = graph.analyser.getValue() as Float32Array | number[];
        const normalized = normalizeWaveformValues(values);
        nextWaveforms[trackId] = smoothWaveformValues(waveformsRef.current[trackId], normalized);
      }
      waveformsRef.current = nextWaveforms;
      setWaveforms(nextWaveforms);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const graph of Array.from(graphsRef.current.values())) {
        graph.player.stop();
        disposeTrackAudioGraph(graph);
      }
      graphsRef.current.clear();
      waveformsRef.current = {};
    };
  }, []);

  return {
    isAudioReady,
    playableTrackIds,
    waveforms,
    ensureAudioReady,
  };
}
