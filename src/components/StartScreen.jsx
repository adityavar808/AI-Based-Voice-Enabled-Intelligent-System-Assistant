import { motion } from "framer-motion";
import AuthPanel from "./AuthPanel";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;

function getDisplayName(authUser) {
  if (!authUser?.email) return "Guest Operator";
  return authUser.name || authUser.email.split("@")[0];
}

function StatusPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300/70">
      {children}
    </span>
  );
}

function CoreShowcase({ authStatus, authUser }) {
  const displayName = getDisplayName(authUser);

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0b121a]/92 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_25%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusPill>Zenix Core</StatusPill>
          <StatusPill>
            {authStatus === "loading"
              ? "Syncing"
              : authUser
                ? "Session Linked"
                : "Ready"}
          </StatusPill>
        </div>

        <div className="mt-5 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">
            Workspace
          </p>
          <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.9rem)] font-semibold leading-tight tracking-[-0.04em] text-white">
            Simple, secure access to your voice assistant.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300/72">
            Clean pre-launch surface with account access, memory state, and a
            focused operator handoff into ZENIX.
          </p>
        </div>

        <div className="mt-6 grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] sm:min-h-[260px] lg:min-h-0">
            {[0, 1, 2].map((ring) => (
              <MotionDiv
                key={ring}
                animate={{ rotate: ring === 1 ? -360 : 360 }}
                transition={{
                  duration: 20 + ring * 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 rounded-full border border-cyan-100/12"
                style={{
                  width: `${42 + ring * 18}%`,
                  height: `${42 + ring * 18}%`,
                  transform: "translate(-50%, -50%)",
                  borderStyle: ring === 1 ? "dashed" : "solid",
                }}
              />
            ))}

            <MotionDiv
              animate={{
                boxShadow: [
                  "0 0 0 14px rgba(34,211,238,0.04), 0 0 80px rgba(34,211,238,0.12)",
                  "0 0 0 22px rgba(34,211,238,0.06), 0 0 110px rgba(14,165,233,0.18)",
                  "0 0 0 14px rgba(34,211,238,0.04), 0 0 80px rgba(34,211,238,0.12)",
                ],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border border-cyan-100/16 bg-[radial-gradient(circle_at_30%_28%,rgba(225,247,255,0.95),rgba(117,196,226,0.48)_18%,rgba(15,33,46,0.95)_56%,rgba(5,10,16,1)_100%)] text-center text-white shadow-[0_18px_50px_rgba(0,0,0,0.42)] sm:h-[210px] sm:w-[210px]"
            >
              <div className="absolute inset-[14px] rounded-full border border-white/10" />
              <div className="px-5">
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-100/56">
                  Neural Core
                </p>
                <p className="mt-3 text-[2rem] font-semibold tracking-[0.18em] sm:text-[2.4rem]">
                  ZENIX
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">
                  {authUser ? `Linked to ${displayName}` : "Awaiting operator"}
                </p>
              </div>
            </MotionDiv>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Mode", authUser ? "Persistent" : "Guest / Login"],
              ["Memory", authUser ? "Connected" : "Local Only"],
              ["Voice", "Standby"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-4"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}

const StartScreen = ({
  setStart,
  authStatus,
  authUser,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const statusLine =
    authStatus === "loading"
      ? "Synchronizing session"
      : authUser
        ? `Authenticated as ${authUser.name || authUser.email}`
        : "Guest mode stores chat only in this browser session";

  return (
    <MotionDiv
      key="start-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      role="region"
      aria-label="ZENIX initialization screen"
      className="relative flex h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-4 md:overflow-hidden md:px-6 md:py-5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#112434_0%,#09131b_42%,#04070a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

      <div className="relative z-20 mx-auto flex w-full max-w-[1380px] flex-col gap-4 md:h-full md:max-h-full">
        <div className="flex shrink-0 flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
          <div>
            <MotionH1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.35 }}
              className="text-[clamp(2.2rem,5vw,4rem)] font-semibold tracking-[0.24em] text-white"
              style={{ fontFamily: '"Orbitron", "Aptos", "Segoe UI", sans-serif' }}
            >
              ZENIX
            </MotionH1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-cyan-100/58 sm:text-[11px]">
              Voice Enabled Intelligent System Assistant
            </p>
          </div>

          <div className="text-left md:max-w-[320px] md:text-right">
            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
              Access State
            </p>
            <p className="mt-2 text-sm text-slate-200">{statusLine}</p>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(390px,460px)]">
          <CoreShowcase authStatus={authStatus} authUser={authUser} />

          <AuthPanel
            authStatus={authStatus}
            authUser={authUser}
            onLogin={onLogin}
            onRegister={onRegister}
            onLogout={onLogout}
            onStart={() => setStart(true)}
          />
        </div>
      </div>
    </MotionDiv>
  );
};

export default StartScreen;
