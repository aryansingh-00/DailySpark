import React, { useState, useRef, useEffect } from "react";
import {
  Music,
  Volume2,
  Play,
  Square,
  Sparkles,
  X,
  CloudRain,
  Waves,
  Brain,
  Disc,
} from "lucide-react";
import { toast } from "sonner";

type SoundType = "off" | "rain" | "ocean" | "binaural" | "cosmic";

export function ZenSoundscapes() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundType>("off");
  const [volume, setVolume] = useState(50); // 0 to 100

  // Audio nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<any[]>([]);
  const intervalsRef = useRef<any[]>([]);

  // Trigger haptic vibration
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Toggle open state
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    triggerHaptic();
  };

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const mainGain = ctx.createGain();
      mainGain.connect(ctx.destination);
      mainGain.gain.value = volume / 100;

      audioCtxRef.current = ctx;
      mainGainRef.current = mainGain;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Clean up all running audio nodes and intervals
  const stopAllAudio = () => {
    sourceNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
    });
    sourceNodesRef.current = [];

    intervalsRef.current.forEach((interval) => {
      clearInterval(interval);
    });
    intervalsRef.current = [];
  };

  // Set up volume changes
  useEffect(() => {
    if (mainGainRef.current) {
      mainGainRef.current.gain.linearRampToValueAtTime(
        volume / 100,
        audioCtxRef.current ? audioCtxRef.current.currentTime + 0.1 : 0,
      );
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Audio Synthesizers
  const startRain = (ctx: AudioContext, destination: AudioNode) => {
    // 1. Generate White Noise for base rain sound
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter white noise to make it rumble like rain (lowpass filter)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 850;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.55;

    whiteNoise.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(destination);

    whiteNoise.start();
    sourceNodesRef.current.push(whiteNoise);

    // 2. Add random water droplet sounds (highly realistic!)
    const triggerDroplet = () => {
      if (activeSound !== "rain" && audioCtxRef.current?.state !== "running") return;
      try {
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();

        osc.type = "sine";
        // Random pitch for droplets
        osc.frequency.setValueAtTime(400 + Math.random() * 800, ctx.currentTime);

        // Exponential decay envelope
        dropGain.gain.setValueAtTime(0.06 * Math.random(), ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

        osc.connect(dropGain);
        dropGain.connect(destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {}
    };

    const dropletInterval = setInterval(triggerDroplet, 180);
    intervalsRef.current.push(dropletInterval);
  };

  const startOcean = (ctx: AudioContext, destination: AudioNode) => {
    // 1. Generate White Noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Bandpass filter to create wave hiss
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 400;
    bandpass.Q.value = 1.0;

    // LFO to modulate filter frequency (simulates waves getting closer/further)
    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 0.12; // 8 seconds per wave
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 250; // modulate by 250Hz

    // Modulate volume too (LFO connected to gain)
    const waveGain = ctx.createGain();
    const volumeLfo = ctx.createOscillator();
    volumeLfo.frequency.value = 0.12;
    const volumeLfoGain = ctx.createGain();
    volumeLfoGain.gain.value = 0.35; // swing volume between 0.15 and 0.85

    // Wire up LFOs
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(bandpass.frequency); // modulate bandpass center

    volumeLfo.connect(volumeLfoGain);

    // Wave gain node setting
    waveGain.gain.value = 0.45;

    whiteNoise.connect(bandpass);
    bandpass.connect(waveGain);
    waveGain.connect(destination);

    // Start oscillators
    whiteNoise.start();
    filterLfo.start();
    volumeLfo.start();

    // Dynamically modulate the wave volume via interval (since Web Audio API direct LFO to gain param can be browser-specific)
    let waveTime = 0;
    const waveInterval = setInterval(() => {
      waveTime += 0.1;
      const targetGain = 0.2 + Math.abs(Math.sin(waveTime * 0.12 * Math.PI)) * 0.6;
      waveGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.1);
    }, 100);

    intervalsRef.current.push(waveInterval);
    sourceNodesRef.current.push(whiteNoise, filterLfo, volumeLfo);
  };

  const startBinaural = (ctx: AudioContext, destination: AudioNode) => {
    // Binaural beats require stereo routing:
    // Left channel: 200Hz, Right channel: 206Hz (Theta 6Hz frequency for deep meditation)
    const merger = ctx.createChannelMerger(2);

    const oscLeft = ctx.createOscillator();
    oscLeft.frequency.value = 200;

    const oscRight = ctx.createOscillator();
    oscRight.frequency.value = 206;

    const gainLeft = ctx.createGain();
    gainLeft.gain.value = 0.3;

    const gainRight = ctx.createGain();
    gainRight.gain.value = 0.3;

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);

    // Route left to channel 0, right to channel 1
    gainLeft.connect(merger, 0, 0);
    gainRight.connect(merger, 0, 1);

    merger.connect(destination);

    oscLeft.start();
    oscRight.start();

    sourceNodesRef.current.push(oscLeft, oscRight);
  };

  const startCosmic = (ctx: AudioContext, destination: AudioNode) => {
    // Generates a floating, cosmic, synth pad chord progression dynamically
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.6;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.45;

    delay.connect(feedback);
    feedback.connect(delay); // delay loop

    const synthGain = ctx.createGain();
    synthGain.gain.value = 0.25;

    synthGain.connect(destination);
    synthGain.connect(delay);
    delay.connect(destination);

    // Minor9 / Major7 soft notes
    const chords = [
      [130.81, 164.81, 196.0, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [146.83, 174.61, 220.0, 261.63], // Dm7 (D3, F3, A3, C4)
      [110.0, 130.81, 164.81, 196.0], // Am7 (A2, C3, E3, G3)
      [130.81, 174.61, 220.0, 261.63], // Fmaj7 (C3, F3, A3, C4)
    ];

    let chordIdx = 0;

    const playCosmicChord = () => {
      const activeNotes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      activeNotes.forEach((freq) => {
        try {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          // Smooth triangle waves
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Soft slow attack (2s) and long release (4s)
          oscGain.gain.setValueAtTime(0, ctx.currentTime);
          oscGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.0);
          oscGain.gain.setValueAtTime(0.08, ctx.currentTime + 3.5);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 7.5);

          // Add a lowpass filter to make the notes very warm and soft
          const synthFilter = ctx.createBiquadFilter();
          synthFilter.type = "lowpass";
          synthFilter.frequency.value = 600;

          osc.connect(synthFilter);
          synthFilter.connect(oscGain);
          oscGain.connect(synthGain);

          osc.start();
          osc.stop(ctx.currentTime + 8.0);
        } catch (e) {}
      });
    };

    // Initial trigger
    playCosmicChord();

    // Trigger new chord every 7 seconds
    const chordInterval = setInterval(playCosmicChord, 7000);
    intervalsRef.current.push(chordInterval);
  };

  const handleSoundChange = (type: SoundType) => {
    triggerHaptic();
    initAudio();

    if (!audioCtxRef.current || !mainGainRef.current) return;

    if (type === "off") {
      setActiveSound("off");
      stopAllAudio();
      toast.info("Ambient sound stopped.");
      return;
    }

    // Stop current active sound first
    stopAllAudio();
    setActiveSound(type);

    try {
      if (type === "rain") {
        startRain(audioCtxRef.current, mainGainRef.current);
        toast.success("Gentle Rain started 🌧️");
      } else if (type === "ocean") {
        startOcean(audioCtxRef.current, mainGainRef.current);
        toast.success("Ocean Waves started 🌊");
      } else if (type === "binaural") {
        startBinaural(audioCtxRef.current, mainGainRef.current);
        toast.success("Theta Binaural Beats started 🧠 (Best with headphones)");
      } else if (type === "cosmic") {
        startCosmic(audioCtxRef.current, mainGainRef.current);
        toast.success("Cosmic Meditation pad started ✨");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to start audio synthesizer.");
    }
  };

  const soundOptions = [
    { id: "off", name: "Quiet", icon: Square, desc: "Turn off all soundscapes" },
    { id: "rain", name: "Rain Shower", icon: CloudRain, desc: "Gentle rain and soft drops" },
    { id: "ocean", name: "Ocean Waves", icon: Waves, desc: "Relaxing deep wave cycles" },
    { id: "binaural", name: "Theta Focus", icon: Brain, desc: "Binaural meditation beats" },
    { id: "cosmic", name: "Zen Synth", icon: Sparkles, desc: "Soothing ambient chords" },
  ] as const;

  return (
    <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end">
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="mb-3 w-72 overflow-hidden rounded-3xl bg-card/95 p-4 shadow-glow border border-border backdrop-blur-md animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Music className="h-4 w-4 text-primary animate-pulse" /> Zen Soundscapes
            </span>
            <button
              onClick={toggleOpen}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Sound options list */}
          <div className="mt-3 space-y-2">
            {soundOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeSound === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSoundChange(opt.id as SoundType)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left text-xs transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow scale-[1.01]"
                      : "bg-muted/40 hover:bg-muted text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive && opt.id !== "off" ? "animate-pulse" : ""}`}
                    />
                  </span>
                  <div>
                    <span className="block font-bold">{opt.name}</span>
                    <span
                      className={`block text-[10px] ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      } mt-0.5`}
                    >
                      {opt.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          {activeSound !== "off" && (
            <div className="mt-4 border-t border-border/60 pt-3 flex items-center gap-3 animate-fade-in">
              <Volume2 className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-muted accent-primary cursor-pointer outline-none"
              />
              <span className="text-[10px] font-bold text-muted-foreground w-6 text-right">
                {volume}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        aria-label="Zen Soundscapes"
        aria-expanded={isOpen}
        className={`group flex h-14 w-14 items-center justify-center rounded-full shadow-glow border transition-all duration-300 active:scale-95 ${
          activeSound !== "off"
            ? "bg-brand-gradient text-white border-transparent scale-105"
            : "bg-card text-foreground border-border hover:bg-muted"
        }`}
      >
        {activeSound !== "off" ? (
          <div className="relative">
            <span className="absolute -inset-2.5 rounded-full bg-white/25 blur-sm animate-ping" />
            <Music className="h-6 w-6 relative animate-bounce" />
          </div>
        ) : (
          <Music className="h-6 w-6 transition-transform group-hover:rotate-12" />
        )}
      </button>
    </div>
  );
}
