import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { signup, login } from "../api/userApi";

/* ── shared field input ── */
const Field = ({ label, name, type = "text", value, onChange, placeholder, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(232,234,240,0.5)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>
        {label}
      </label>
      <input
        type={type} name={name} value={value} placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete={type === "password" ? "current-password" : "email"}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          background: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
          color: "#f1f5f9", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "all 0.15s", boxSizing: "border-box",
        }}
      />
      {error && <div style={{ fontSize: 12, color: "#f87171", marginTop: 5 }}>{error}</div>}
    </div>
  );
};

/* ── Alert banner ── */
const AlertBanner = ({ type, message }) => (
  <div style={{
    padding: "11px 14px", borderRadius: 10, marginBottom: 18, fontSize: 13,
    background: type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
    border: `1px solid ${type === "success" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
    color: type === "success" ? "#34d399" : "#f87171",
    display: "flex", alignItems: "flex-start", gap: 8,
  }}>
    <span style={{ flexShrink: 0 }}>{type === "success" ? "✓" : "✕"}</span>
    <span>{message}</span>
  </div>
);

/* ── Auth Success Overlay ── */
const AuthSuccessOverlay = ({ mode }) => {
  const isLogin = mode === "login";
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 20, zIndex: 20,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.18) 0%, #0d1117 70%)",
      animation: "authOverlayIn 0.3s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes authOverlayIn   { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        @keyframes authIconBounce  { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 55%{transform:scale(1.2) rotate(3deg)} 75%{transform:scale(0.93) rotate(-1deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes authRingPulse   { 0%{transform:scale(0.6);opacity:0.7} 100%{transform:scale(2.0);opacity:0} }
        @keyframes authTitleIn     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes authSubIn       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes authStreakLeft  { 0%{transform:translateX(0) scaleX(0);opacity:0;transform-origin:right} 40%{opacity:1} 100%{transform:translateX(-60px) scaleX(1);opacity:0} }
        @keyframes authStreakRight { 0%{transform:translateX(0) scaleX(0);opacity:0;transform-origin:left}  40%{opacity:1} 100%{transform:translateX(60px)  scaleX(1);opacity:0} }
        @keyframes authSparkle1    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-38px,-44px) scale(1);opacity:0} }
        @keyframes authSparkle2    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate( 38px,-44px) scale(1);opacity:0} }
        @keyframes authSparkle3    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-50px, -8px) scale(1);opacity:0} }
        @keyframes authSparkle4    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate( 50px, -8px) scale(1);opacity:0} }
        @keyframes authSparkle5    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate( -12px,-58px) scale(1);opacity:0} }
        @keyframes authSparkle6    { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(  12px,-58px) scale(1);opacity:0} }
        @keyframes authGridFade    { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes authCheckDraw   { from{stroke-dashoffset:40} to{stroke-dashoffset:0} }
      `}</style>

      {/* Subtle dot-grid background */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 20,
        backgroundImage: "radial-gradient(rgba(99,102,241,0.25) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        animation: "authGridFade 1.8s ease-out forwards",
        pointerEvents: "none",
      }} />

      {/* Horizontal speed streaks */}
      {[[-1, -10], [1, 6], [-1, 20], [1, -24]].map(([dir, top], i) => (
        <div key={i} style={{
          position: "absolute",
          top: `calc(50% + ${top}px)`,
          left: "50%",
          width: 48 + i * 8,
          height: 1.5,
          borderRadius: 99,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
          animation: `${dir < 0 ? "authStreakLeft" : "authStreakRight"} 0.65s ease-out ${0.1 + i * 0.08}s both`,
        }} />
      ))}

      {/* Icon area */}
      <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", width: 80, height: 80, borderRadius: "50%",
            border: "1.5px solid rgba(99,102,241,0.5)",
            animation: `authRingPulse 1.4s ease-out ${i * 0.28}s infinite`,
            opacity: 0,
          }} />
        ))}

        {/* Main circle */}
        <div style={{
          width: 76, height: 76, borderRadius: "50%", position: "relative", zIndex: 1,
          background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))",
          border: "1.5px solid rgba(99,102,241,0.45)",
          boxShadow: "0 0 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "authIconBounce 0.55s cubic-bezier(.36,.07,.19,.97) both",
        }}>
          {/* Animated SVG checkmark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <polyline
              points="7,17 13,23 25,10"
              stroke="#a5b4fc"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset="40"
              style={{ animation: "authCheckDraw 0.45s ease-out 0.3s forwards" }}
            />
          </svg>
        </div>

        {/* Sparkle particles */}
        {["✦","✦","✧","✦","✦","✧"].map((p, i) => (
          <div key={i} style={{
            position: "absolute", fontSize: i % 3 === 2 ? 7 : 10,
            color: i % 2 === 0 ? "#a5b4fc" : "#67e8f9",
            animation: `authSparkle${i + 1} 0.7s ease-out 0.2s forwards`,
            opacity: 0,
          }}>{p}</div>
        ))}
      </div>

      {/* Text */}
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20,
        color: "#f1f5f9", letterSpacing: "-0.03em", marginTop: 22,
        animation: "authTitleIn 0.4s ease-out 0.25s both",
      }}>
        {isLogin ? "Welcome back!" : "You're in!"}
      </div>
      <div style={{
        fontSize: 13, color: "rgba(232,234,240,0.45)", marginTop: 6,
        fontFamily: "'DM Sans', sans-serif",
        animation: "authSubIn 0.4s ease-out 0.35s both",
      }}>
        {isLogin ? "Signing you in…" : "Account created successfully"}
      </div>
    </div>
  );
};

/* ── Modal shell ── */
const ModalShell = ({ open, onClose, children }) => (
  <Dialog
    open={open} onClose={onClose} maxWidth="xs" fullWidth
    PaperProps={{
      style: {
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(0,0,0,0.75)",
        overflow: "visible",
      }
    }}
    BackdropProps={{ style: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" } }}
  >
    <DialogContent style={{ padding: 0 }}>
      {children}
    </DialogContent>
  </Dialog>
);

/* ── Close button ── */
const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.04)", color: "rgba(232,234,240,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1, zIndex: 10 }}>
    ×
  </button>
);

/* ── Logo mark (mini) ── */
const MiniLogo = () => (
  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 8px 24px rgba(99,102,241,0.3)", marginBottom: 16 }}>Z</div>
);

/* ─────────────────────────────────────────────────────────
   LOGIN MODAL
───────────────────────────────────────────────────────── */
export function LoginModal({ open, onClose, onSuccess, onSwitchToSignup }) {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [alert, setAlert]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) { setForm({ email: "", password: "" }); setErrors({}); setAlert(null); setSuccess(false); }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())              e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)                  e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setAlert(null);
    try {
      const data = await login({ email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => { onSuccess({ userId: data.userId, email: form.email }); onClose(); }, 1800);
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Check your credentials.";
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={success ? undefined : onClose}>
      <div style={{ padding: "32px 32px 28px", position: "relative" }}>
        {success && <AuthSuccessOverlay mode="login" />}
        <CloseBtn onClose={success ? undefined : onClose} />
        <MiniLogo />
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 4 }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", marginBottom: 24 }}>
          Sign in to your Zalary account
        </p>

        {alert && <AlertBanner type={alert.type} message={alert.message} />}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" error={errors.password} />

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff", boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
            transition: "all 0.18s", marginTop: 4,
          }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(232,234,240,0.4)" }}>
          Don't have an account?{" "}
          <button onClick={onSwitchToSignup} style={{ background: "none", border: "none", color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, padding: 0 }}>
            Sign up free
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────
   SIGNUP MODAL
───────────────────────────────────────────────────────── */
export function SignupModal({ open, onClose, onSuccess, onSwitchToLogin }) {
  const [form, setForm]       = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [alert, setAlert]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("form"); // "form" | "logging_in" | "done"

  useEffect(() => {
    if (open) { setForm({ email: "", password: "", confirm: "" }); setErrors({}); setAlert(null); setStep("form"); }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())               e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)                   e.password = "Password is required";
    else if (form.password.length < 8)    e.password = "Must be at least 8 characters";
    if (form.confirm !== form.password)   e.confirm  = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setAlert(null);

    try {
      // 1 — register
      await signup({ email: form.email, password: form.password });
      setAlert({ type: "success", message: "Account created! Signing you in…" });
      setStep("logging_in");

      // 2 — auto-login immediately after signup
      const loginData = await login({ email: form.email, password: form.password });
      setStep("done");
      setTimeout(() => { onSuccess({ userId: loginData.userId, email: form.email }); onClose(); }, 1800);

    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      setAlert({ type: "error", message: msg });
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || step === "logging_in" || step === "done";

  return (
    <ModalShell open={open} onClose={step === "done" ? undefined : onClose}>
      <div style={{ padding: "32px 32px 28px", position: "relative" }}>
        {step === "done" && <AuthSuccessOverlay mode="signup" />}
        <CloseBtn onClose={step === "done" ? undefined : onClose} />
        <MiniLogo />
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 4 }}>
          Create account
        </h2>
        <p style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", marginBottom: 24 }}>
          Join thousands sharing salary data anonymously
        </p>

        {alert && <AlertBanner type={alert.type} message={alert.message} />}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" error={errors.password} />
          <Field label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="••••••••" error={errors.confirm} />

          {/* Password strength bar */}
          {form.password && (
            <div style={{ marginBottom: 16, marginTop: -8 }}>
              <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99, transition: "width 0.3s, background 0.3s",
                  width: form.password.length < 8 ? "33%" : form.password.length < 12 ? "66%" : "100%",
                  background: form.password.length < 8 ? "#f87171" : form.password.length < 12 ? "#fb923c" : "#34d399",
                }} />
              </div>
              <div style={{ fontSize: 11, color: form.password.length < 8 ? "#f87171" : form.password.length < 12 ? "#fb923c" : "#34d399", marginTop: 4 }}>
                {form.password.length < 8 ? "Weak" : form.password.length < 12 ? "Good" : "Strong"}
              </div>
            </div>
          )}

          <button type="submit" disabled={busy} style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            background: busy ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff", boxShadow: busy ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
            transition: "all 0.18s", marginTop: 4,
          }}>
            {step === "form" ? "Create account →"
              : step === "logging_in" ? "Signing you in…"
              : "✓ Done!"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(232,234,240,0.4)" }}>
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} style={{ background: "none", border: "none", color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, padding: 0 }}>
            Sign in
          </button>
        </div>
      </div>
    </ModalShell>
  );
}