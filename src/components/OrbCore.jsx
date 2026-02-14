import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function OrbCore({ isSpeaking = false, audioLevel = 0, audioRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioElementSourceRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const animationFrameRef = useRef(null);
  
  const intensity = Math.min(Math.max(audioLevel * 2, 0), 1); // Ensure 0-1 range

  // Initialize audio visualization from audioRef
  useEffect(() => {
    if (!audioRef?.current) return;

    let isInitialized = false;

    const initAudioVisualization = async () => {
      // Prevent multiple initializations
      if (isInitialized) {
        console.log('⚠️ Already initialized, skipping...');
        return;
      }

      try {
        console.log('🎧 Starting audio visualization init...');

        // Create audio context
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          console.log('✅ Audio context created, state:', audioContextRef.current.state);
        }

        // Resume if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('✅ Audio context resumed');
        }

        // Create analyzer
        if (!analyserRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 512;
          analyserRef.current.smoothingTimeConstant = 0.85;
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          console.log('✅ Analyser created, bin count:', analyserRef.current.frequencyBinCount);
        }
        
        // Create and connect audio source (ONLY ONCE!)
        if (!audioElementSourceRef.current) {
          console.log('🔗 Creating audio source...');
          audioElementSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          audioElementSourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          console.log('✅ Audio pipeline connected: audio → analyser → speakers');
          
          // Test: Get initial data
          setTimeout(() => {
            if (dataArrayRef.current) {
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);
              const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
              console.log('🧪 Test - Initial audio level:', avg.toFixed(2));
            }
          }, 500);
        }

        isInitialized = true;
        console.log('✅ Audio visualization fully initialized!');
      } catch (err) {
        console.error('❌ Audio visualization error:', err);
      }
    };

    // Initialize as soon as component mounts
    const initTimer = setTimeout(() => {
      console.log('⏰ Pre-initializing audio visualization...');
      initAudioVisualization();
    }, 100);

    // Also handle play event
    const handlePlay = async () => {
      console.log('▶️ Audio play event detected');
      if (!isInitialized) {
        await initAudioVisualization();
      }
      
      // Resume context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('Context resumed on play');
      }
    };

    const audioElement = audioRef.current;
    audioElement.addEventListener('play', handlePlay);

    return () => {
      clearTimeout(initTimer);
      audioElement?.removeEventListener('play', handlePlay);
    };
  }, [audioRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const size = Math.min(
          containerRef.current.offsetWidth, 
          containerRef.current.offsetHeight,
          800 // Max size
        );
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize particle system
  useEffect(() => {
    const particleCount = 150;
    const baseRadius = dimensions.width * 0.26;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / particleCount,
      radius: baseRadius + Math.random() * (dimensions.width * 0.04),
      speed: 0.0003 + Math.random() * 0.0007,
      size: 0.8 + Math.random() * 1.5,
      offset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,
    }));
    setParticles(newParticles);
  }, [dimensions]);

  // Animate particles with audio reactivity
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let frame = 0;
    let debugCounter = 0;

    const animate = () => {
      // Get real-time audio frequency data
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Debug: Log audio data every 60 frames (once per second at 60fps)
        if (debugCounter % 60 === 0) {
          const avgVolume = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
          const maxVolume = Math.max(...dataArrayRef.current);
          console.log('🎵 Audio data - Avg:', avgVolume.toFixed(2), 'Max:', maxVolume);
        }
        debugCounter++;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame += 1;

      const energyBoost = isSpeaking ? 1 + intensity * 0.4 : 1;
      const scaleFactor = canvas.width / 500;

      particles.forEach((particle, index) => {
        // Map each particle to a frequency band
        const audioIndex = Math.floor((index / particles.length) * (dataArrayRef.current?.length || 128));
        const audioValue = (dataArrayRef.current?.[audioIndex] || 0) / 255;
        
        const currentAngle = particle.angle + frame * particle.speed * energyBoost;
        const wobble = Math.sin(frame * particle.pulseSpeed + particle.offset) * (4 * scaleFactor);
        
        // Audio-reactive expansion (stronger response)
        const audioBoost = audioValue * 40 * scaleFactor;
        const currentRadius = particle.radius + wobble + audioBoost + (isSpeaking ? intensity * 12 * scaleFactor : 0);

        const x = centerX + Math.cos(currentAngle) * currentRadius;
        const y = centerY + Math.sin(currentAngle) * currentRadius;

        // Create gradient with blue neon colors
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 4 * scaleFactor);
        const colorAngle = (currentAngle + Math.PI) / (Math.PI * 2);
        
        // Cyan to Blue gradient
        const r = Math.floor(34 + (59 - 34) * colorAngle);
        const g = Math.floor(211 - (211 - 130) * colorAngle);
        const b = Math.floor(238 + (246 - 238) * colorAngle);
        
        // Audio-reactive brightness
        const baseOpacity = 0.85 + intensity * 0.15;
        const audioOpacity = Math.min(baseOpacity + audioValue * 0.4, 1);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${audioOpacity})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${(0.4 + intensity * 0.3) * (0.6 + audioValue * 0.4)})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Audio-reactive particle size
        const particleSize = particle.size * (2 + intensity + audioValue * 2.5) * scaleFactor;
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles, isSpeaking, intensity, dimensions]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full bg-black overflow-hidden">
      
      {/* Atmospheric Background Glows */}
      <div className="absolute inset-0 opacity-40">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2/5 h-2/5 bg-blue-500/30 rounded-full blur-[140px]"
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
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-cyan-500/30 rounded-full blur-[120px]"
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
        <motion.div 
          className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-blue-400/25 rounded-full blur-[100px]"
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

      {/* Main Core Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${dimensions.width * 0.58}px`,
          height: `${dimensions.height * 0.58}px`,
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(34, 211, 238, 0.35) 40%, rgba(37, 99, 235, 0.25) 70%, transparent 90%)",
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

      {/* Particle System Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute z-10"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      />

      {/* SVG Ring Structure */}
      <motion.svg
        viewBox="0 0 400 400"
        className="relative z-20"
        style={{ 
          width: `${dimensions.width * 0.82}px`, 
          height: `${dimensions.height * 0.82}px` 
        }}
        animate={{
          scale: isSpeaking ? 1.02 + (intensity || 0) * 0.03 : 1,
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <defs>
          {/* Advanced Glow Filter */}
          <filter id="advancedGlow" x="-50%" y="-50%" width="200%" height="200%">
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

          {/* Shimmer Gradient */}
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
          </linearGradient>

          {/* Core Depth Gradient */}
          <radialGradient id="depthGradient">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Core Fill */}
        <motion.circle
          cx="200"
          cy="200"
          initial={{ r: 118 }}
          animate={{
            r: isSpeaking ? 118 + (intensity || 0) * 8 : 118,
            opacity: isSpeaking ? [0.7, 1, 0.7] : 0.6,
          }}
          fill="url(#depthGradient)"
          transition={{ duration: 0.4, repeat: Infinity }}
        />

        {/* Outer Shimmer Ring */}
        <motion.circle
          cx="200"
          cy="200"
          initial={{ r: 147 }}
          fill="transparent"
          stroke="url(#shimmer)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#advancedGlow)"
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

        {/* Primary Blue Ring */}
        <motion.circle
          cx="200"
          cy="200"
          initial={{ r: 137 }}
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter="url(#advancedGlow)"
          animate={{
            strokeWidth: isSpeaking ? 3.2 + (intensity || 0) * 2.5 : 2.8,
            opacity: isSpeaking ? 0.92 + (intensity || 0) * 0.08 : 0.75,
            r: isSpeaking ? 137 + (intensity || 0) * 6 : 137,
          }}
          transition={{ 
            duration: 0.12,
            ease: "easeOut",
          }}
        />

        {/* Middle Sky Blue Ring */}
        <motion.circle
          cx="200"
          cy="200"
          initial={{ r: 129 }}
          fill="transparent"
          stroke="#0ea5e9"
          strokeWidth="1.2"
          opacity="0.65"
          filter="url(#advancedGlow)"
          animate={{
            r: 129,
            opacity: isSpeaking ? 0.75 + (intensity || 0) * 0.25 : 0.65,
            strokeWidth: isSpeaking ? 1.5 : 1.2,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Inner Cyan Ring */}
        <motion.circle
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

        {/* Energy Burst Lines */}
        {isSpeaking && Array.from({ length: 16 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 16;
          const startR = 142;
          const endR = 158 + (intensity || 0) * 12;
          return (
            <motion.line
              key={i}
              x1={200 + Math.cos(angle) * startR}
              y1={200 + Math.sin(angle) * startR}
              x2={200 + Math.cos(angle) * endR}
              y2={200 + Math.sin(angle) * endR}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#advancedGlow)"
              initial={{ opacity: 0, strokeWidth: 0 }}
              animate={{ 
                opacity: [0, 0.7 + (intensity || 0) * 0.3, 0],
                strokeWidth: [0, 2.5, 0],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Pulsing Center Dot */}
        <motion.circle
          cx="200"
          cy="200"
          initial={{ r: 4 }}
          fill="#3b82f6"
          filter="url(#advancedGlow)"
          animate={{
            r: isSpeaking ? 4 + (intensity || 0) * 3 : 4,
            opacity: isSpeaking ? [0.75, 1, 0.75] : 0.85,
          }}
          transition={{
            duration: 0.45,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>

      {/* Rotating Atmospheric Layer */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-5"
        style={{
          width: `${dimensions.width * 1.1}px`,
          height: `${dimensions.height * 1.1}px`,
          background: "radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.06) 45%, rgba(14, 165, 233, 0.04) 65%, transparent 85%)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export default OrbCore;