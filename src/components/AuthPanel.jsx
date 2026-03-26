import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;

const INITIAL_FORM = { name: "", email: "", password: "", confirmPassword: "" };

function getDisplayName(user) {
  if (!user?.email) return "GUEST_ENTITY";
  return user.name || user.email.split("@")[0].toUpperCase();
}

// Simulated background data stream
function HexStream() {
  const [stream, setStream] = useState("");
  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const int = setInterval(() => {
      let str = "";
      for (let i = 0; i < 64; i++) str += chars[Math.floor(Math.random() * chars.length)] + " ";
      setStream(str);
    }, 100);
    return () => clearInterval(int);
  }, []);
  return (
    <div 
      className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none text-[8px] leading-tight font-mono text-cyan-500 break-all select-none mix-blend-screen" 
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {stream}
    </div>
  );
}

function TargetingInput({ label, type = "text", value, onChange, placeholder, action }) {
  return (
    <div className="group relative block w-full mb-6">
      <div className="flex justify-between items-end mb-1">
        <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-400/70 uppercase">
          {label} <span className="animate-pulse text-cyan-300">_</span>
        </span>
      </div>
      
      <div className="relative flex items-center bg-black/40 backdrop-blur-md">
        {/* Holographic Brackets */}
        <div className="absolute left-0 top-0 bottom-0 w-2 border-l-2 border-y-2 border-cyan-500/40 group-focus-within:border-cyan-300 transition-colors shadow-[0_0_10px_rgba(0,229,255,0.2)]" />
        <div className="absolute right-0 top-0 bottom-0 w-2 border-r-2 border-y-2 border-cyan-500/40 group-focus-within:border-cyan-300 transition-colors shadow-[0_0_10px_rgba(0,229,255,0.2)]" />
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 font-mono text-sm text-cyan-100 placeholder:text-cyan-800/60 outline-none tracking-widest relative z-10"
        />

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 hover:text-white hover:drop-shadow-[0_0_8px_#00e5ff] transition-all z-20"
          >
            [{action.label}]
          </button>
        )}
      </div>
      {/* Scanning laser line on focus */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-300 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_#00e5ff]" />
    </div>
  );
}

function CyberButton({ onClick, disabled, children, primary, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full group overflow-hidden ${primary ? 'bg-cyan-950/40' : 'bg-black/40'} border border-cyan-500/30 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
      style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
    >
      <div className="relative flex items-center justify-center py-3 px-6 bg-black/60 backdrop-blur-sm" style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}>
        <div className={`absolute inset-0 bg-gradient-to-r ${primary ? 'from-cyan-500/20 to-transparent' : 'from-slate-500/10 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        {/* Animated grid background inside button */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.4)_1px,transparent_1px)] bg-[length:4px_4px]" />
        
        <span className={`relative z-10 font-mono text-xs uppercase tracking-[0.4em] font-bold ${primary ? 'text-cyan-300 drop-shadow-[0_0_8px_#00e5ff] group-hover:text-white' : 'text-cyan-600 group-hover:text-cyan-300'}`}>
          {children}
        </span>
      </div>
    </button>
  );
}

export default function AuthPanel({ authStatus, authUser, onLogin, onRegister, onLogout, onStart }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") await onLogin(form.email, form.password);
      else await onRegister(form.name, form.email, form.password);
    } catch (err) { setError("ERR: ACCESS_DENIED // OVERRIDE_FAILED"); }
  };

  return (
    <div className="relative h-full w-full min-h-[600px] p-8 flex flex-col justify-center border-r border-cyan-500/20 bg-[#020611]">
      <HexStream />
      
      <div className="relative z-10">
        
        {/* --- UPGRADED ZENIX HEADER LOCKUP --- */}
        <div className="mb-10 border-b border-cyan-500/20 pb-6 relative group">
          {/* Scanning Line Effect on Hover */}
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-300 group-hover:w-full transition-all duration-700 shadow-[0_0_10px_#00e5ff]" />

          {/* Top Micro-Data Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[8px] tracking-[0.5em] text-cyan-500/50 uppercase">
              SYS.INIT // CORE_OVERRIDE
            </span>
            <div className="flex gap-1 opacity-70">
              <span className="h-1 w-4 bg-cyan-400"></span>
              <span className="h-1 w-1 bg-cyan-400"></span>
              <span className="h-1 w-1 bg-cyan-400"></span>
            </div>
          </div>

          {/* Main Title Lockup */}
          <div className="flex items-end gap-4">
            <h1 className="text-5xl xl:text-6xl font-mono font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              ZENIX
            </h1>
            
            <div className="pb-1 xl:pb-2 flex flex-col">
              <h2 className="text-[10px] xl:text-xs font-mono font-bold tracking-[0.4em] text-cyan-400 uppercase">
                Uplink_Portal
              </h2>
              <p className="text-[8px] xl:text-[9px] font-mono tracking-widest text-cyan-500/70 mt-1 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
                SECURE.NODE.ACTV
              </p>
            </div>
          </div>
        </div>
        {/* --- END HEADER LOCKUP --- */}

        {authUser ? (
          <div className="space-y-6">
            <div className="border border-cyan-400/30 bg-cyan-900/10 p-6 relative overflow-hidden backdrop-blur-md">
              
              {/* Corner Accents for the User Box */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

              <div className="absolute top-0 right-0 p-2 opacity-30">
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                    className="animate-[spin_10s_linear_infinite]"
                  />
                </svg>
              </div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-500/70 mb-1">
                IDENTIFIED_ENTITY:
              </p>
              <p className="font-mono text-2xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                {getDisplayName(authUser)}
              </p>
              <p className="font-mono text-[10px] tracking-widest text-cyan-400/60 mt-1">
                {authUser.email}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <CyberButton onClick={onStart} primary>
                INITIATE_ZENIX_CORE
              </CyberButton>
              <CyberButton onClick={onLogout}>
                SEVER_CONNECTION
              </CyberButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <AnimatePresence>
              {mode === "register" && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <TargetingInput
                    label="DESIGNATION"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ENTER ALIAS"
                  />
                </MotionDiv>
              )}
            </AnimatePresence>

            <TargetingInput
              label="COM_LINK (EMAIL)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="OPERATIVE@NETWORK"
            />
            <TargetingInput
              label="DECRYPTION_KEY"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />

            {error && (
              <div className="font-mono text-[10px] text-red-500 tracking-widest bg-red-950/30 p-2 border-l-2 border-red-500 mb-4 animate-pulse">
                {error}
              </div>
            )}

            <div className="pt-4 space-y-4">
              <CyberButton primary type="submit">
                {mode === "login" ? "AUTHENTICATE" : "REGISTER_DATA"}
              </CyberButton>
              <CyberButton
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login"
                  ? "SWITCH_TO_REGISTRATION"
                  : "SWITCH_TO_LOGIN"}
              </CyberButton>
              <div className="w-full h-[1px] bg-cyan-500/20 my-2" />
              <CyberButton type="button" onClick={onStart}>
                BYPASS_SECURITY (GUEST)
              </CyberButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}