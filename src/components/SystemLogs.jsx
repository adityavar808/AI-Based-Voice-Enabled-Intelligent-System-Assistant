import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const MotionDiv = motion.div;

// --- FAKE API SEQUENCE DATA ---
const BOOT_SEQUENCE = [
  { id: "SYS_CORE", task: "MOUNT_KERNEL", target: "local://root/sys_v9", delay: 800 },
  { id: "NET_LINK", task: "WSS_HANDSHAKE", target: "wss://socket.zenix.ai/v1", delay: 1500 },
  { id: "AUTH_CHK", task: "VERIFY_TOKEN", target: "GET /api/v2/auth/verify", delay: 1200 },
  { id: "MEM_CTRL", task: "ALLOCATE_VRAM", target: "x86_mem_controller", delay: 900 },
  { id: "NEURAL_N", task: "PULL_ACOUSTIC_MODEL", target: "s3://models/zenix-voice-v4.bin", delay: 2800, isHeavy: true },
  { id: "UI_PAINT", task: "RENDER_HUD_SURFACE", target: "react_fiber_node", delay: 600 },
];

// --- MICRO-COMPONENTS ---
function CyberSpinner() {
  return (
    <div className="relative w-4 h-4 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-cyan-500/30 border-t-cyan-400 rounded-full" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-1 border border-dashed border-cyan-500/60 rounded-full" />
    </div>
  );
}

function generateHex() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
}

function getTimestamp() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
}

export default function SystemLogs({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const logsEndRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Main Boot Sequence Logic
  useEffect(() => {
    let currentStep = 0;
    
    const runNextStep = () => {
      if (currentStep >= BOOT_SEQUENCE.length) {
        setProgress(100);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1000);
        return;
      }

      const step = BOOT_SEQUENCE[currentStep];
      setActiveStep(currentStep);

      // Simulate heavy download if marked
      let byteInterval;
      if (step.isHeavy) {
        byteInterval = setInterval(() => {
          setDownloadedBytes(prev => prev + Math.floor(Math.random() * 50) + 10);
        }, 50);
      }

      // Complete the step after its specific delay
      setTimeout(() => {
        if (byteInterval) clearInterval(byteInterval);
        
        // Add fake latency and status to completed step
        const latency = Math.floor(Math.random() * 120) + 15;
        const statusCode = step.target.includes("GET") || step.target.includes("wss") ? "200 OK" : "DONE";
        
        setCompletedSteps(prev => [...prev, { ...step, latency, statusCode }]);
        setProgress(Math.floor(((currentStep + 1) / BOOT_SEQUENCE.length) * 100));
        
        currentStep++;
        runNextStep();
      }, step.delay);
    };

    runNextStep();
  }, [onComplete]);

  // Rapid-fire Fake Terminal Background Logs
  useEffect(() => {
    if (progress === 100) return;
    
    const logInterval = setInterval(() => {
      const isError = Math.random() > 0.95;
      const types = ["DEBUG", "INFO", "TRACE", "NET"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newLog = `[${getTimestamp()}] [${type}] 0x${generateHex()} -> ${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      setTerminalLogs(prev => [...prev.slice(-15), { text: newLog, isError }]);
    }, 150);

    return () => clearInterval(logInterval);
  }, [progress]);

  return (
    <div className="w-full max-w-2xl font-mono">
      
      {/* --- TOP HEADER & OVERALL PROGRESS --- */}
      <div className="mb-4 flex items-end justify-between border-b border-cyan-500/30 pb-2">
        <div>
          <h3 className="text-xl font-bold tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.4)] uppercase">
            System_Boot_Sequence
          </h3>
          <p className="text-[9px] tracking-[0.4em] text-cyan-500/60 mt-1">
            UPLINK: ACTIVE // NODE: ZENIX-ALPHA
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-widest text-cyan-500/50">GLOBAL_SYNC</p>
          <p className="text-xl font-bold tracking-widest text-white">{progress}%</p>
        </div>
      </div>

      {/* Cybernetic Progress Bar */}
      <div className="relative mb-8 h-2 w-full bg-cyan-950/40 overflow-hidden border border-cyan-500/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
        {/* The Fill */}
        <motion.div 
          className="absolute top-0 left-0 h-full bg-cyan-400"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "circOut", duration: 0.5 }}
        />
        {/* Scanning Glint */}
        <motion.div 
          animate={{ x: ["-100%", "300%"] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
          className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/50 to-transparent" 
        />
        {/* Vertical Grid Lines over bar */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(0,0,0,0.5)_10%,rgba(0,0,0,0.5)_11%)] pointer-events-none" />
      </div>

      {/* --- MAIN TERMINAL WINDOW --- */}
      <div className="relative bg-[#020611]/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.1)] p-1 overflow-hidden">
        
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        <div className="bg-black/60 p-5 h-[320px] flex flex-col relative overflow-hidden">
          
          {/* Background Scrolling Rapid Logs */}
          <div ref={logsEndRef} className="absolute inset-0 p-5 opacity-20 text-[8px] leading-relaxed text-cyan-500 overflow-hidden pointer-events-none z-0 tracking-widest">
            {terminalLogs.map((log, i) => (
              <div key={i} className={log.isError ? "text-red-500" : ""}>{log.text}</div>
            ))}
          </div>

          {/* Foreground Structured API Sequence */}
          <div className="relative z-10 flex-1 flex flex-col gap-3">
            <AnimatePresence>
              
              {/* COMPLETED STEPS */}
              {completedSteps.map((step) => (
                <motion.div 
                  key={step.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="flex flex-col border-l-2 border-emerald-500/50 pl-3 py-1 bg-emerald-950/10"
                >
                  <div className="flex justify-between items-start text-[10px] tracking-widest">
                    <span className="text-cyan-500/70">[{step.id}] {step.task}</span>
                    <span className="text-emerald-400/80">{step.latency}ms</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xs text-white uppercase">{step.target}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 border border-emerald-500/20">
                      {step.statusCode}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* CURRENT ACTIVE STEP */}
              {activeStep < BOOT_SEQUENCE.length && (
                <motion.div 
                  key="active-step"
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex flex-col border-l-2 border-emerald-500/50 pl-3 py-1 bg-emerald-950/10"
                >
                  <div className="flex justify-between items-start text-[10px] tracking-widest">
                    <span className="text-cyan-500/70">[{BOOT_SEQUENCE[activeStep].id}] EXECUTING...</span>
                    <span className="text-emerald-400/80">EXECUTING</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xs text-white uppercase">{BOOT_SEQUENCE[activeStep].target}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 border border-emerald-500/20">
                      EXECUTING
                    </span>
                  </div>
                  
                  {/* If it's a heavy download, show network transfer data */}
                  {BOOT_SEQUENCE[activeStep].isHeavy && (
                    <div className="mt-2 flex items-center gap-4 text-[9px] text-emerald-300">
                      <span>RCV: {(downloadedBytes / 1024).toFixed(2)} MB</span>
                      <div className="flex-1 h-1 bg-emerald-950/50">
                        <div className="h-full bg-emerald-400 w-full origin-left animate-[pulse_0.2s_ease-in-out_infinite]" style={{ scaleX: (downloadedBytes % 100) / 100 }} />
                      </div>
                      <span className="animate-pulse">DOWNLOADING</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SUCCESS MESSAGE */}
              {progress === 100 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-auto border border-cyan-400 bg-cyan-500/10 p-3 text-center"
                >
                  <p className="text-sm font-bold tracking-[0.4em] text-cyan-300 drop-shadow-[0_0_8px_#00e5ff] uppercase">
                    SYSTEM_ONLINE
                  </p>
                  <p className="text-[9px] tracking-widest text-cyan-500 mt-1">
                    HANDSHAKE COMPLETE. READY FOR NEURAL INPUT.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- FOOTER DECORATION --- */}
      <div className="mt-4 flex items-center justify-between text-[9px] tracking-[0.3em] text-cyan-500/40">
        <div className="flex gap-2 items-center">
          <span className="h-2 w-2 bg-cyan-500/50" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
          ENCRYPTION: AES-256-GCM
        </div>
        <div className="flex gap-2 items-center">
          PACKET_LOSS: 0.00%
          <span className="h-2 w-2 bg-cyan-500/50" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
        </div>
      </div>

      {/* Required Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}