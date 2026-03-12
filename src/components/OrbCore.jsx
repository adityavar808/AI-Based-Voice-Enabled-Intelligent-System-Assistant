import { motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const MotionDiv = motion.div;
const MotionSvg = motion.svg;
const MotionCircle = motion.circle;
const MotionLine = motion.line;
const MotionText = motion.text;

const MAX_ORB_SIZE = 800;
const BASE_ORB_SIZE = 500;
const PARTICLE_COUNT = 120;
const SILENCE_TIMEOUT_MS = 4000;
const ASSISTANT_SESSION_MS = 8000;
const ASSISTANT_COOLDOWN_MS = 5000;
const NOISE_CALIBRATION_FRAMES = 90;

function getSharedAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext || null;

  if (!AudioContextClass) return null;

  if (
    !window.__zenixSharedAudioContext ||
    window.__zenixSharedAudioContext.state === "closed"
  ) {
    window.__zenixSharedAudioContext = new AudioContextClass();
  }

  return window.__zenixSharedAudioContext;
}

function getSharedMediaElementSourceMap() {
  if (typeof window === "undefined") return null;

  if (!window.__zenixMediaElementSources) {
    window.__zenixMediaElementSources = new WeakMap();
  }

  return window.__zenixMediaElementSources;
}

function averageLevel(data) {
  if (!data?.length) return 0;

  return data.reduce((total, value) => total + value, 0) / data.length;
}

function buildParticles(size) {
  const baseRadius = size * 0.26;

  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    id: index,
    angle: (Math.PI * 2 * index) / PARTICLE_COUNT,
    radius: baseRadius + Math.random() * (size * 0.04),
    speed: 0.0003 + Math.random() * 0.0007,
    size: 0.8 + Math.random() * 1.5,
    offset: Math.random() * Math.PI * 2,
    pulseSpeed: 0.015 + Math.random() * 0.025,
  }));
}

function OrbCore({ isSpeaking = false, audioLevel = 0, audioRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioElementSourceRef = useRef(null);
  const audioDataArrayRef = useRef(null);

  const micAnalyserRef = useRef(null);
  const micSourceRef = useRef(null);
  const micStreamRef = useRef(null);
  const micDataArrayRef = useRef(null);

  const animationFrameRef = useRef(null);
  const monitorFrameRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const deactivateTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const assistantCooldownUntilRef = useRef(0);
  const particleSizeRef = useRef(BASE_ORB_SIZE);

  const isMicActiveRef = useRef(false);
  const isUserSpeakingRef = useRef(false);

  const [particles, setParticles] = useState(() => buildParticles(BASE_ORB_SIZE));
  const [dimensions, setDimensions] = useState({
    width: BASE_ORB_SIZE,
    height: BASE_ORB_SIZE,
  });
  const [isMicActive, setIsMicActive] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const svgIdPrefix = useId().replace(/[:]/g, "");
  const glowFilterId = `advancedGlow-${svgIdPrefix}`;
  const shimmerId = `shimmer-${svgIdPrefix}`;
  const depthGradientId = `depthGradient-${svgIdPrefix}`;

  const intensity = Math.min(Math.max(audioLevel * 2, 0), 1);

  const clearSilenceTimeout = useCallback(() => {
    if (!silenceTimeoutRef.current) return;

    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = null;
  }, []);

  const clearDeactivateTimeout = useCallback(() => {
    if (!deactivateTimeoutRef.current) return;

    clearTimeout(deactivateTimeoutRef.current);
    deactivateTimeoutRef.current = null;
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.stop();
    } catch (error) {
      try {
        recognition.abort();
      } catch {
        console.error("Speech recognition shutdown failed:", error);
      }
    }

    recognitionRef.current = null;
  }, []);

  const deactivateAssistant = useCallback(() => {
    clearSilenceTimeout();
    clearDeactivateTimeout();
    stopRecognition();

    if (isMicActiveRef.current) {
      assistantCooldownUntilRef.current = Date.now() + ASSISTANT_COOLDOWN_MS;
      isMicActiveRef.current = false;
      setIsMicActive(false);
    }
  }, [clearDeactivateTimeout, clearSilenceTimeout, stopRecognition]);

  const scheduleAssistantSleep = useCallback(() => {
    clearDeactivateTimeout();

    deactivateTimeoutRef.current = setTimeout(() => {
      deactivateAssistant();
    }, ASSISTANT_SESSION_MS);
  }, [clearDeactivateTimeout, deactivateAssistant]);

  const scheduleSilenceSleep = useCallback(() => {
    if (!isMicActiveRef.current || silenceTimeoutRef.current) return;

    silenceTimeoutRef.current = setTimeout(() => {
      deactivateAssistant();
    }, SILENCE_TIMEOUT_MS);
  }, [deactivateAssistant]);

  const startCommandRecognition = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    stopRecognition();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1];
      const transcript = latestResult?.[0]?.transcript?.trim();

      if (transcript) {
        console.log("Command:", transcript);
      }

      if (latestResult?.isFinal) {
        scheduleAssistantSleep();
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }

      if (event.error === "no-speech") {
        scheduleSilenceSleep();
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Speech recognition could not start:", error);
    }
  }, [scheduleAssistantSleep, scheduleSilenceSleep, stopRecognition]);

  const activateAssistant = useCallback(() => {
    if (isMicActiveRef.current) {
      scheduleAssistantSleep();
      return;
    }

    if (Date.now() < assistantCooldownUntilRef.current) return;

    isMicActiveRef.current = true;
    setIsMicActive(true);
    clearSilenceTimeout();
    scheduleAssistantSleep();
    startCommandRecognition();
  }, [clearSilenceTimeout, scheduleAssistantSleep, startCommandRecognition]);

  useEffect(() => {
    const context = getSharedAudioContext();

    if (!context) return undefined;

    audioContextRef.current = context;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (monitorFrameRef.current) {
        cancelAnimationFrame(monitorFrameRef.current);
      }

      clearSilenceTimeout();
      clearDeactivateTimeout();
      stopRecognition();

      audioElementSourceRef.current?.disconnect();
      audioAnalyserRef.current?.disconnect();
      micSourceRef.current?.disconnect();
      micAnalyserRef.current?.disconnect();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());

      audioElementSourceRef.current = null;
      audioAnalyserRef.current = null;
      audioDataArrayRef.current = null;
      micSourceRef.current = null;
      micAnalyserRef.current = null;
      micDataArrayRef.current = null;
      micStreamRef.current = null;
      audioContextRef.current = null;
    };
  }, [clearDeactivateTimeout, clearSilenceTimeout, stopRecognition]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return undefined;

    const updateDimensions = () => {
      const nextSize = Math.min(
        Math.max(Math.min(container.offsetWidth, container.offsetHeight), 220),
        MAX_ORB_SIZE,
      );

      if (particleSizeRef.current !== nextSize) {
        particleSizeRef.current = nextSize;
        setParticles(buildParticles(nextSize));
      }

      setDimensions({ width: nextSize, height: nextSize });
    };

    updateDimensions();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(container);

      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const audioElement = audioRef?.current;
    const context = audioContextRef.current;

    if (!audioElement || !context) return undefined;

    let disposed = false;

    const ensurePlaybackAnalyser = async () => {
      if (disposed) return;

      try {
        if (context.state === "suspended") {
          await context.resume();
        }

        if (!audioAnalyserRef.current) {
          const analyser = context.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.92;

          audioAnalyserRef.current = analyser;
          audioDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }

        if (!audioElementSourceRef.current) {
          const sourceMap = getSharedMediaElementSourceMap();

          if (!sourceMap) return;

          let source = sourceMap.get(audioElement);

          if (!source) {
            source = context.createMediaElementSource(audioElement);
            sourceMap.set(audioElement, source);
          }

          try {
            source.disconnect();
          } catch (error) {
            void error;
          }

          try {
            audioAnalyserRef.current.disconnect();
          } catch (error) {
            void error;
          }

          source.connect(audioAnalyserRef.current);
          audioAnalyserRef.current.connect(context.destination);
          audioElementSourceRef.current = source;
        }
      } catch (error) {
        console.error("Audio visualizer setup failed:", error);
      }
    };

    void ensurePlaybackAnalyser();
    audioElement.addEventListener("play", ensurePlaybackAnalyser);

    return () => {
      disposed = true;
      audioElement.removeEventListener("play", ensurePlaybackAnalyser);
    };
  }, [audioRef]);

  useEffect(() => {
    const context = audioContextRef.current;

    if (!context || typeof navigator === "undefined") return undefined;
    if (!navigator.mediaDevices?.getUserMedia) return undefined;

    let cancelled = false;
    let noiseSamples = [];
    let smoothedEnergy = 0;
    let lastEnergy = 0;
    let spikeCount = 0;
    let voiceFrames = 0;
    let noiseFloor = 0;

    const setSpeakingState = (nextSpeaking) => {
      if (isUserSpeakingRef.current === nextSpeaking) return;

      isUserSpeakingRef.current = nextSpeaking;
      setIsUserSpeaking(nextSpeaking);
    };

    const monitor = () => {
      if (cancelled || !micAnalyserRef.current || !micDataArrayRef.current) {
        return;
      }

      micAnalyserRef.current.getByteFrequencyData(micDataArrayRef.current);

      const rawEnergy = averageLevel(micDataArrayRef.current);
      smoothedEnergy = smoothedEnergy * 0.84 + rawEnergy * 0.16;

      const dynamicThreshold = noiseFloor + 10;
      const speaking = smoothedEnergy > dynamicThreshold;
      const energyDiff = smoothedEnergy - lastEnergy;

      setSpeakingState(speaking);

      if (speaking) {
        clearSilenceTimeout();
      } else {
        scheduleSilenceSleep();
      }

      spikeCount = energyDiff > 8 ? spikeCount + 1 : Math.max(spikeCount - 1, 0);
      voiceFrames = speaking ? voiceFrames + 1 : Math.max(voiceFrames - 1, 0);

      if (
        !isMicActiveRef.current &&
        Date.now() >= assistantCooldownUntilRef.current &&
        spikeCount > 2 &&
        voiceFrames > 5
      ) {
        spikeCount = 0;
        voiceFrames = 0;
        activateAssistant();
      }

      lastEnergy = smoothedEnergy;
      monitorFrameRef.current = requestAnimationFrame(monitor);
    };

    const calibrateNoiseFloor = () => {
      if (cancelled || !micAnalyserRef.current || !micDataArrayRef.current) {
        return;
      }

      micAnalyserRef.current.getByteFrequencyData(micDataArrayRef.current);
      noiseSamples.push(averageLevel(micDataArrayRef.current));

      if (noiseSamples.length < NOISE_CALIBRATION_FRAMES) {
        monitorFrameRef.current = requestAnimationFrame(calibrateNoiseFloor);
        return;
      }

      noiseFloor = averageLevel(noiseSamples);
      monitor();
    };

    const startMonitoring = async () => {
      try {
        if (context.state === "suspended") {
          await context.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.88;

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);

        micStreamRef.current = stream;
        micSourceRef.current = source;
        micAnalyserRef.current = analyser;
        micDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        calibrateNoiseFloor();
      } catch (error) {
        console.error("Microphone monitoring failed:", error);
      }
    };

    void startMonitoring();

    return () => {
      cancelled = true;

      if (monitorFrameRef.current) {
        cancelAnimationFrame(monitorFrameRef.current);
        monitorFrameRef.current = null;
      }

      setSpeakingState(false);
      noiseSamples = [];
    };
  }, [activateAssistant, clearSilenceTimeout, scheduleSilenceSleep]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const context = canvas.getContext("2d");

    if (!context) return undefined;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let frame = 0;

    const render = () => {
      const playbackData = audioDataArrayRef.current;
      const micData = micDataArrayRef.current;

      if (audioAnalyserRef.current && playbackData) {
        audioAnalyserRef.current.getByteFrequencyData(playbackData);
      }

      if (micAnalyserRef.current && micData) {
        micAnalyserRef.current.getByteFrequencyData(micData);
      }

      const playbackAverage = averageLevel(playbackData);
      const playbackSpeaking = isSpeaking || playbackAverage > 18;
      const energyBoost =
        playbackSpeaking || isUserSpeakingRef.current ? 1.3 : 1;
      const scaleFactor = canvas.width / BASE_ORB_SIZE;

      context.clearRect(0, 0, canvas.width, canvas.height);
      frame += 1;

      particles.forEach((particle, index) => {
        const playbackIndex = Math.floor(
          (index / particles.length) * (playbackData?.length || 128),
        );
        const micIndex = Math.floor(
          (index / particles.length) * (micData?.length || 128),
        );

        const playbackValue = (playbackData?.[playbackIndex] || 0) / 255;
        const micValue = (micData?.[micIndex] || 0) / 255;
        const audioValue = Math.max(playbackValue, micValue * 1.15);

        const currentAngle =
          particle.angle + frame * particle.speed * energyBoost;
        const wobble =
          Math.sin(frame * particle.pulseSpeed + particle.offset) *
          (4 * scaleFactor);

        const audioBoost = audioValue * 40 * scaleFactor;
        const currentRadius =
          particle.radius +
          wobble +
          audioBoost +
          (playbackSpeaking ? intensity * 12 * scaleFactor : 0) +
          (isUserSpeakingRef.current ? micValue * 18 * scaleFactor : 0);

        const x = centerX + Math.cos(currentAngle) * currentRadius;
        const y = centerY + Math.sin(currentAngle) * currentRadius;

        const gradient = context.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          particle.size * 4 * scaleFactor,
        );
        const colorAngle = (currentAngle + Math.PI) / (Math.PI * 2);

        const red = Math.floor(34 + (59 - 34) * colorAngle);
        const green = Math.floor(211 - (211 - 130) * colorAngle);
        const blue = Math.floor(238 + (246 - 238) * colorAngle);

        const baseOpacity = 0.78 + intensity * 0.18;
        const particleOpacity = Math.min(baseOpacity + audioValue * 0.4, 1);

        gradient.addColorStop(
          0,
          `rgba(${red}, ${green}, ${blue}, ${particleOpacity})`,
        );
        gradient.addColorStop(
          0.4,
          `rgba(${red}, ${green}, ${blue}, ${(0.38 + intensity * 0.3) * (0.65 + audioValue * 0.35)})`,
        );
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(
          x,
          y,
          particle.size * (2 + intensity + audioValue * 2.5) * scaleFactor,
          0,
          Math.PI * 2,
        );
        context.fill();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [dimensions.width, intensity, isSpeaking, particles]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 opacity-40">
        <MotionDiv
          className="absolute left-1/4 top-1/4 h-2/5 w-2/5 rounded-full bg-blue-500/30 blur-[140px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <MotionDiv
          className="absolute bottom-1/3 right-1/3 h-1/3 w-1/3 rounded-full bg-cyan-500/30 blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <MotionDiv
          className="absolute right-1/4 top-1/2 h-1/4 w-1/4 rounded-full bg-blue-400/25 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <MotionDiv
        className="absolute rounded-full"
        style={{
          width: `${dimensions.width * 0.58}px`,
          height: `${dimensions.height * 0.58}px`,
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(34, 211, 238, 0.35) 40%, rgba(37, 99, 235, 0.25) 70%, transparent 90%)",
          filter: "blur(50px)",
        }}
        animate={{
          scale: isSpeaking ? [1, 1.12, 1] : 1,
          opacity: isSpeaking ? [0.65, 0.95, 0.65] : 0.55,
        }}
        transition={{
          duration: isSpeaking ? 0.6 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute z-10"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      />

      <MotionSvg
        viewBox="0 0 400 400"
        className="relative z-20"
        style={{
          width: `${dimensions.width * 0.82}px`,
          height: `${dimensions.height * 0.82}px`,
        }}
        animate={{
          scale: isSpeaking ? 1.02 + intensity * 0.03 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <defs>
          <filter
            id={glowFilterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feGaussianBlur stdDeviation="12" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={shimmerId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
          </linearGradient>

          <radialGradient id={depthGradientId}>
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 118 }}
          animate={{
            r: isSpeaking ? 118 + intensity * 8 : 118,
            opacity: isSpeaking ? [0.7, 1, 0.7] : 0.6,
          }}
          fill={`url(#${depthGradientId})`}
          transition={{ duration: 0.4, repeat: Infinity }}
        />

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 147 }}
          fill="transparent"
          stroke={`url(#${shimmerId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
          filter={`url(#${glowFilterId})`}
          animate={{
            r: 147,
            strokeDashoffset: isSpeaking ? [0, -628] : 0,
            opacity: isSpeaking ? [0.35, 0.55, 0.35] : 0.35,
          }}
          transition={{
            strokeDashoffset: { duration: 4, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.5, repeat: Infinity },
          }}
          strokeDasharray="3 6"
        />

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 137 }}
          fill="transparent"
          stroke={
            isMicActive ? (isUserSpeaking ? "#ef4444" : "#f87171") : "#3b82f6"
          }
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#${glowFilterId})`}
          animate={{
            strokeWidth: isUserSpeaking ? 4 : 3,
            opacity: isUserSpeaking ? 1 : 0.8,
            r: 137,
          }}
          transition={{ duration: 0.2 }}
        />

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 129 }}
          fill="transparent"
          stroke="#0ea5e9"
          strokeWidth="1.2"
          opacity="0.65"
          filter={`url(#${glowFilterId})`}
          animate={{
            r: 129,
            opacity: isSpeaking ? 0.75 + intensity * 0.25 : 0.65,
            strokeWidth: isSpeaking ? 1.5 : 1.2,
          }}
          transition={{ duration: 0.2 }}
        />

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 116 }}
          fill="transparent"
          stroke="#22d3ee"
          strokeWidth="0.8"
          opacity="0.45"
          animate={{
            r: 116,
            opacity: isSpeaking ? 0.6 : 0.45,
          }}
        />

        {isSpeaking &&
          Array.from({ length: 16 }).map((_, index) => {
            const angle = (Math.PI * 2 * index) / 16;
            const startRadius = 142;
            const endRadius = 158 + intensity * 12;

            return (
              <MotionLine
                key={index}
                x1={200 + Math.cos(angle) * startRadius}
                y1={200 + Math.sin(angle) * startRadius}
                x2={200 + Math.cos(angle) * endRadius}
                y2={200 + Math.sin(angle) * endRadius}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                filter={`url(#${glowFilterId})`}
                initial={{ opacity: 0, strokeWidth: 0 }}
                animate={{
                  opacity: [0, 0.7 + intensity * 0.3, 0],
                  strokeWidth: [0, 2.5, 0],
                }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  delay: index * 0.06,
                  ease: "easeInOut",
                }}
              />
            );
          })}

        <MotionCircle
          cx="200"
          cy="200"
          initial={{ r: 4 }}
          fill="#3b82f6"
          filter={`url(#${glowFilterId})`}
          animate={{
            r: isUserSpeaking ? 6 : 4,
            opacity: isUserSpeaking ? [0.8, 1, 0.8] : 0.85,
          }}
          transition={{
            duration: 0.45,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <MotionText
          x="200"
          y="212"
          textAnchor="middle"
          fontSize="32"
          fontWeight="600"
          letterSpacing="8"
          fill="#e0f2fe"
          style={{
            fontFamily: "Orbitron, sans-serif",
          }}
          filter={`url(#${glowFilterId})`}
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: isSpeaking ? [0.8, 1, 0.8] : 0.85,
            scale: isSpeaking ? 1 + intensity * 0.05 : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ZENIX
        </MotionText>
      </MotionSvg>

      <MotionDiv
        className="pointer-events-none absolute rounded-full z-[5]"
        style={{
          width: `${dimensions.width * 1.1}px`,
          height: `${dimensions.height * 1.1}px`,
          background:
            "radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.06) 45%, rgba(14, 165, 233, 0.04) 65%, transparent 85%)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: isUserSpeaking ? 8 : 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export default OrbCore;
