import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const INITIAL_FORM = { email: "", password: "" };

export default function AuthPanel({
  authStatus,
  authUser,
  onLogin,
  onRegister,
  onLogout,
  onStart,
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUser) {
      setError("");
      setForm(INITIAL_FORM);
    }
  }, [authUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        await onLogin(form.email.trim(), form.password);
      } else {
        await onRegister(form.email.trim(), form.password);
      }
    } catch (submitError) {
      setError(submitError.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.45 }}
      onClick={(event) => event.stopPropagation()}
      className="relative z-20 mt-8 w-full max-w-[440px] rounded-[24px] border border-cyan-400/20 bg-slate-950/65 p-4 shadow-[0_0_50px_rgba(6,182,212,0.14)] backdrop-blur-2xl sm:mt-10 sm:rounded-[28px] sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/60">
            Secure Access
          </p>
          <h2 className="mt-2 text-xl font-semibold text-cyan-50">
            {authUser ? "Session linked" : "Sign in before launch"}
          </h2>
          <p className="mt-2 text-sm text-slate-300/75">
            {authUser
              ? "Your session is active. Initialize ZENIX with persistent chat history."
              : "Register a user or log in to keep your chat history across sessions."}
          </p>
        </div>

        {authUser && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onLogout();
            }}
            className="self-start rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
          >
            Logout
          </button>
        )}
      </div>

      {authUser ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/70">
              Active User
            </p>
            <p className="mt-2 break-all text-base text-emerald-100">
              {authUser.email}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onStart();
              }}
              className="flex-1 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15 sm:tracking-[0.22em]"
            >
              Initialize as {authUser.email.split("@")[0]}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onLogout();
              }}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm uppercase tracking-[0.18em] text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Switch account
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-black/20 p-1">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMode(tab);
                  setError("");
                }}
                className={`rounded-xl px-3 py-2 text-xs uppercase tracking-[0.18em] transition sm:text-sm ${
                  mode === tab
                    ? "bg-cyan-400/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                autoComplete="email"
                inputMode="email"
                placeholder="operator@zenix.ai"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
              />
            </div>

            <AnimatePresence>
              {error && (
                <MotionDiv
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 break-words whitespace-pre-line"
                >
                  {error}
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting || authStatus === "loading"}
                className="flex-1 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-wait disabled:opacity-60 sm:tracking-[0.22em]"
              >
                {isSubmitting
                  ? "Connecting..."
                  : mode === "login"
                    ? "Login"
                    : "Create account"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onStart();
                }}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm uppercase tracking-[0.14em] text-slate-300 transition hover:border-white/20 hover:text-white sm:tracking-[0.18em]"
              >
                Continue as guest
              </button>
            </div>
          </form>
        </>
      )}
    </MotionDiv>
  );
}
