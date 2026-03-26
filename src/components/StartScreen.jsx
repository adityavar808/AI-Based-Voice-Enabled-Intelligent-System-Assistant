import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AuthPanel from "./AuthPanel";

const MotionDiv = motion.div;

// --- EXTREME VFX COMPONENTS ---

function TelemetryLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const int = setInterval(() => {
      const msgs = ["INIT_NEURAL_NET...", "BYPASS_PROXY_FIREWALL", "CALIBRATING_OPTICS", "SYNC_CORE_FREQ: 432Hz", "ALLOCATING_VRAM"];
      const newLog = `> [${new Date().toISOString().split('T')[1].slice(0,-1)}] ${msgs[Math.floor(Math.random() * msgs.length)]} [OK]`;
      setLogs(prev => [newLog, ...prev].slice(0, 5));
    }, 800);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="font-mono text-[9px] text-cyan-500/60 leading-relaxed tracking-widest">
      {logs.map((log, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - (i * 0.2), x: 0 }}>
          {log}
        </motion.div>
      ))}
    </div>
  );
}

function ZenixReactor() {
  return (
    <div className="relative w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
      {/* Outer Containment Field */}
      <motion.svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-30 drop-shadow-[0_0_15px_#00e5ff]" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="4 2 1 2" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="20 10 5 10" />
      </motion.svg>

      {/* Counter-Rotating Mid Ring */}
      <motion.svg viewBox="0 0 100 100" className="absolute w-[80%] h-[80%] opacity-50" animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
        <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M 50 90 A 40 40 0 0 1 10 50" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#00e5ff" strokeWidth="0.2" strokeDasharray="2 4" />
      </motion.svg>

      {/* Hexagonal Inner Core */}
      <motion.div className="absolute w-[50%] h-[50%] border border-cyan-400/30 flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
        <div className="w-[90%] h-[90%] border-2 border-dashed border-cyan-400/50" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
      </motion.div>

      {/* Pulsing Quantum Brain (Center) */}
      <div className="relative z-10 w-32 h-32 rounded-full bg-cyan-950/80 border-2 border-cyan-300 flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(0,229,255,0.6)]">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md" />
        <span className="font-mono text-[8px] tracking-[0.4em] text-cyan-300">VOICE_CORE</span>
        <span className="font-mono text-3xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_#fff]">ZENIX</span>
      </div>
      
      {/* Floating Target Nodes */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} className="absolute w-full h-full pointer-events-none" animate={{ rotate: i * 90 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
          <div className="absolute top-0 left-1/2 w-4 h-4 border border-cyan-400 bg-black -translate-x-1/2 shadow-[0_0_10px_#00e5ff]" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
        </motion.div>
      ))}
    </div>
  );
}

function HudCard({ title, value, alert }) {
  return (
    <div className="relative p-4 bg-black/50 border border-cyan-500/20 backdrop-blur-sm group overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
      {/* Scanning effect on hover */}
      <div className="absolute -left-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:animate-[scan_1s_ease-in-out]" />
      
      <p className="font-mono text-[9px] text-cyan-500/70 tracking-[0.3em] uppercase mb-1">{title}</p>
      <p className={`font-mono text-lg font-bold tracking-widest ${alert ? 'text-red-400 drop-shadow-[0_0_8px_#ff003c]' : 'text-cyan-100 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'}`}>
        {value}
      </p>
    </div>
  );
}

// --- MAIN START SCREEN ---

export default function StartScreen({ setStart, authStatus, authUser, onLogin, onRegister, onLogout }) {
  const [power, setPower] = useState("0%");
  
  // Fake power up sequence
  useEffect(() => {
    let p = 0;
    const int = setInterval(() => {
      p += Math.random() * 5;
      if (p > 99.9) p = 99.9;
      setPower(p.toFixed(1) + "%");
    }, 100);
    return () => clearInterval(int);
  }, []);

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative flex min-h-screen w-full items-center justify-center bg-[#010308] overflow-hidden"
    >
      {/* GLOBAL HUD BACKGROUNDS */}
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,229,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.15)_1px,transparent_1px)] bg-[length:50px_50px]" style={{ perspective: '1000px', transform: 'rotateX(60deg) scale(2.5) translateY(-20%)' }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10" />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-50 mix-blend-overlay opacity-30" />

      {/* MAIN CONTAINER (3D Perspective Panel) */}
      <div 
        className="relative z-20 w-full max-w-[1600px] h-[95vh] flex flex-col lg:flex-row bg-[#020611]/80 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_100px_rgba(0,229,255,0.05)]"
        style={{ clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" }}
      >
        
        {/* LEFT COMPARTMENT: Authentication & Terminal */}
        <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col relative">
          <AuthPanel authStatus={authStatus} authUser={authUser} onLogin={onLogin} onRegister={onRegister} onLogout={onLogout} onStart={() => setStart(true)} />
        </div>

        {/* RIGHT COMPARTMENT: Visual Showcase & Zenix Core */}
        <div className="flex-1 relative flex flex-col justify-between p-8 overflow-hidden">
          
          {/* Top HUD Bar */}
          <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4">
             <div className="flex gap-4">
               <div className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 bg-cyan-900/30 px-3 py-1 border border-cyan-400/50">
                 SYS.VER // 9.0.4.ZENIX
               </div>
               <div className="font-mono text-[10px] tracking-[0.3em] text-amber-400 bg-amber-900/30 px-3 py-1 border border-amber-400/50 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                 MONITORING_ACTIVE
               </div>
             </div>
             <div className="text-right">
                <p className="font-mono text-[10px] tracking-widest text-cyan-500/50">GLOBAL_NET_SYNC</p>
                <p className="font-mono text-sm tracking-widest text-cyan-300">{power}</p>
             </div>
          </div>

          {/* Center Space: The Reactor */}
          <div className="flex-1 flex items-center justify-center relative">
            <ZenixReactor />
            
            {/* Absolute positioned HUD elements around the reactor */}
            <div className="absolute left-0 top-1/4 max-w-[200px] hidden xl:block">
              <p className="font-mono text-[10px] text-cyan-500/60 tracking-widest mb-2 border-b border-cyan-500/30 pb-1">LIVE_TELEMETRY</p>
              <TelemetryLog />
            </div>

            <div className="absolute right-0 top-1/3 hidden xl:flex flex-col gap-4">
               <HudCard title="CORE_TEMP" value="24.4°C" />
               <HudCard title="THREAT_VECTOR" value={authUser ? "SECURE" : "UNVERIFIED"} alert={!authUser} />
               <HudCard title="NEURAL_CAPACITY" value="EXABYTE_TIER" />
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="grid grid-cols-3 gap-4 border-t border-cyan-500/20 pt-4">
            <div className="col-span-2">
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-500/50 mb-2">AUDIO_WAVEFORM_STANDBY</p>
              {/* Fake Audio Visualizer */}
              <div className="flex items-end gap-1 h-8 opacity-50">
                {[...Array(30)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-1 bg-cyan-400" 
                    animate={{ height: ["20%", `${Math.random() * 100}%`, "20%"] }} 
                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }} 
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end text-right">
              <p className="font-mono text-[8px] tracking-[0.4em] text-cyan-500/40">AWAITING_OPERATIVE_COMMAND</p>
              <h1 className="font-mono text-2xl font-bold tracking-[0.4em] text-cyan-400/80 uppercase">
                ZENIX_READY
              </h1>
            </div>
          </div>

        </div>
      </div>
      
      {/* Required CSS for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </MotionDiv>
  );
}