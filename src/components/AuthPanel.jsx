import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getDisplayName(user) {
  if (!user?.email) return "Operator";
  return user.name || user.email.split("@")[0];
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Basic", tone: "text-amber-300", track: "30%" };
  }

  if (score <= 3) {
    return { label: "Strong", tone: "text-sky-300", track: "65%" };
  }

  return { label: "Excellent", tone: "text-emerald-300", track: "100%" };
}

function buildValidationMessage(mode, form) {
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const password = form.password;

  if (mode === "register" && !name) {
    return "Display name is required for account setup.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (mode === "register" && password !== form.confirmPassword) {
    return "Confirm password must match the password field.";
  }

  return "";
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300/70">
      {children}
    </span>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  helper,
  action,
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
          {label}
        </span>
        {helper ? <span className="text-[11px] text-slate-400">{helper}</span> : null}
      </div>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-2.5 pr-20 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/[0.05]"
        />

        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-200"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </label>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const displayName = getDisplayName(authUser);
  const passwordStrength = getPasswordStrength(form.password);

  useEffect(() => {
    if (authUser) {
      setError("");
      setForm(INITIAL_FORM);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [authUser]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const validationError = buildValidationMessage(mode, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const email = form.email.trim().toLowerCase();

      if (mode === "login") {
        await onLogin(email, form.password);
      } else {
        await onRegister(form.name.trim(), email, form.password);
      }
    } catch (submitError) {
      setError(submitError.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0a1017]/94 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:p-6 xl:min-h-0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%)]" />

      <div className="relative flex h-full min-h-0 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tag>Secure Access</Tag>
          <Tag>
            {authStatus === "loading"
              ? "Syncing"
              : authUser
                ? "Verified"
                : "Guest Available"}
          </Tag>
        </div>

        <div className="mt-4">
          <h2 className="text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-tight tracking-[-0.04em] text-white">
            {authUser ? `Welcome back, ${displayName}` : "Sign in to continue"}
          </h2>
          <p className="mt-2.5 max-w-lg text-sm leading-6 text-slate-300/72">
            {authUser
              ? "Your account is linked. Launch ZENIX with persistent memory and stored history."
              : "Use a registered account for persistent memory, or continue as guest for a temporary local session."}
          </p>
        </div>

        {authUser ? (
          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Active profile
              </p>
              <p className="mt-3 text-xl font-semibold text-white">{displayName}</p>
              <p className="mt-2 break-all text-sm text-slate-300/72">
                {authUser.email}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onStart}
                className="whitespace-nowrap rounded-[16px] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(8,47,73,0.95),rgba(9,84,112,0.95))] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition hover:brightness-110"
              >
                Launch Workspace
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="whitespace-nowrap rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
              >
                Switch Account
              </button>
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              {[
                ["Memory", "Persistent"],
                ["Voice", "Standby"],
                ["Session", "Authenticated"],
              ].map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] text-slate-200"
                >
                  <span className="uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </span>{" "}
                  <span className="text-white">{value}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-[16px] border border-white/10 bg-black/20 p-1">
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setMode(tab);
                    setError("");
                  }}
                  className={`rounded-[12px] px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition ${
                    mode === tab
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form
              className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 pb-1"
              onSubmit={handleSubmit}
            >
              <AnimatePresence initial={false}>
                {mode === "register" ? (
                  <MotionDiv
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    className="overflow-hidden"
                  >
                    <InputField
                      label="Display Name"
                      value={form.name}
                      onChange={updateField("name")}
                      autoComplete="name"
                      placeholder="Krishna Verma"
                    />
                  </MotionDiv>
                ) : null}
              </AnimatePresence>

              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={updateField("email")}
                autoComplete="email"
                placeholder="operator@zenix.ai"
              />

              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Minimum 6 characters"
                helper={form.password ? passwordStrength.label : "Secure access"}
                action={{
                  label: showPassword ? "Hide" : "Show",
                  onClick: () => setShowPassword((prev) => !prev),
                }}
              />

              <AnimatePresence initial={false}>
                {mode === "register" ? (
                  <MotionDiv
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    className="overflow-hidden"
                  >
                    <InputField
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={updateField("confirmPassword")}
                      autoComplete="new-password"
                      placeholder="Repeat the same password"
                      action={{
                        label: showConfirmPassword ? "Hide" : "Show",
                        onClick: () =>
                          setShowConfirmPassword((prev) => !prev),
                      }}
                    />
                  </MotionDiv>
                ) : null}
              </AnimatePresence>

              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-2.5">
                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-slate-400">
                  <span>Password Strength</span>
                  <span className={passwordStrength.tone}>
                    {form.password ? passwordStrength.label : "Waiting"}
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#38bdf8,#10b981)] transition-all duration-300"
                    style={{ width: form.password ? passwordStrength.track : "8%" }}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="shrink-0 rounded-[16px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                  >
                    {error}
                  </MotionDiv>
                ) : null}
              </AnimatePresence>

              <div className="mt-auto grid shrink-0 gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={isSubmitting || authStatus === "loading"}
                  className="whitespace-nowrap rounded-[16px] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(8,47,73,0.95),rgba(9,84,112,0.95))] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting
                    ? mode === "login"
                      ? "Signing In..."
                      : "Creating Account..."
                    : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={onStart}
                  className="whitespace-nowrap rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
                >
                  Continue as Guest
                </button>
              </div>

            </form>
          </>
        )}
      </div>
    </MotionDiv>
  );
}
