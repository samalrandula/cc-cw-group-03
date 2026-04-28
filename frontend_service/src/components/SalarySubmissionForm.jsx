import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { submitSalary, fetchCurrencies, fetchCountries, fetchJobRoles } from "../api/SalaryApi";

const experienceLevels = [
  { label: "Intern",  value: "INTERN" },
  { label: "Junior",  value: "JUNIOR" },
  { label: "Mid",     value: "MID"    },
  { label: "Senior",  value: "SENIOR" },
  { label: "Lead",    value: "LEAD"   },
];

/* ── Shared input style ── */
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.15s, background 0.15s",
  appearance: "none",
  WebkitAppearance: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(232,234,240,0.5)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 7,
};

const FieldInput = ({ label, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        {...props}
        style={{
          ...inputStyle,
          borderColor: focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
          background: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

const FieldSelect = ({ label, children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <select
          {...props}
          style={{
            ...inputStyle,
            paddingRight: 36,
            cursor: "pointer",
            borderColor: focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
            background: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {children}
        </select>
        {/* Chevron icon */}
        <svg
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(232,234,240,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );
};

/* ── Job Role Autocomplete ─────────────────────────────────────────────────
   - User types freely; nothing happens until 3+ characters are entered
   - After 3 chars a 300ms debounce fires fetchJobRoles(searchTerm)
   - Results populate a dropdown; user can also keep their own typed value
──────────────────────────────────────────────────────────────────────── */
const JobRoleAutocomplete = ({ label, value, onChange }) => {
  const [inputVal, setInputVal]     = useState(value || "");   // what's in the text box
  const [options, setOptions]       = useState([]);             // API results
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState(false);
  const dropdownRef                 = useRef(null);
  const debounceRef                 = useRef(null);

  // Keep inputVal in sync if parent resets the form
  useEffect(() => { setInputVal(value || ""); }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const text = e.target.value;
    setInputVal(text);
    // Always keep parent in sync with what was typed (free-text allowed)
    onChange({ target: { name: "role", value: text } });

    clearTimeout(debounceRef.current);

    if (text.length < 3) {
      setOptions([]);
      setOpen(false);
      return;
    }

    // Debounce: wait 300ms after the user stops typing
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchJobRoles(text);
        setOptions(results);
        setOpen(results.length > 0);
      } catch {
        setOptions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (role) => {
    setInputVal(role);
    onChange({ target: { name: "role", value: role } });
    setOpen(false);
    setOptions([]);
  };

  const showSpinner = loading && inputVal.length >= 3;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <label style={labelStyle}>{label}</label>

      {/* Input row */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={inputVal}
          placeholder="e.g. Software Developer"
          onChange={handleInput}
          onFocus={() => {
            setFocused(true);
            if (options.length > 0) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            paddingRight: 38,
            borderColor: focused || open ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
            background: focused || open ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
          }}
        />

        {/* Right icon: spinner while loading, clear-X when there's text, search icon otherwise */}
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
          {showSpinner ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: "roleSpinner 0.8s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : inputVal ? (
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleSelect(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(232,234,240,0.3)", fontSize: 16, lineHeight: 1, padding: 0 }}>
              ×
            </button>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(232,234,240,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
        </div>
      </div>

      {/* Hint shown before 3 chars */}
      {inputVal.length > 0 && inputVal.length < 3 && (
        <div style={{ fontSize: 11, color: "rgba(232,234,240,0.35)", marginTop: 5 }}>
          Keep typing — suggestions appear after 3 characters
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6,
          borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(13,17,23,0.97)", backdropFilter: "blur(12px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.55)", zIndex: 1000,
          maxHeight: 260, overflowY: "auto",
        }}>
          <div style={{ padding: "6px" }}>
            {options.map((role) => {
              const isSelected = value === role;
              // Highlight the matched portion
              const idx = role.toLowerCase().indexOf(inputVal.toLowerCase());
              const before = role.slice(0, idx);
              const match  = role.slice(idx, idx + inputVal.length);
              const after  = role.slice(idx + inputVal.length);
              return (
                <button key={role} type="button" onClick={() => handleSelect(role)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: isSelected ? "rgba(99,102,241,0.18)" : "transparent", color: isSelected ? "#a5b4fc" : "rgba(232,234,240,0.75)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textAlign: "left", cursor: "pointer", transition: "background 0.12s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "rgba(99,102,241,0.18)" : "transparent"; }}
                >
                  <span>
                    {before}
                    <strong style={{ color: "#a5b4fc", fontWeight: 600 }}>{match}</strong>
                    {after}
                  </span>
                  {isSelected && <span style={{ fontSize: 12, color: "#a5b4fc" }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes roleSpinner { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

function SalarySubmissionForm({ onClose }) {
  const [formData, setFormData] = useState({
    company: "", country: "", role: "", salary: "",
    yearsOfExperience: "", experienceLevel: "MID", currency: "LKR", anonymize: false,
  });
  const [message, setMessage]       = useState(null);
  const [currencies, setCurrencies] = useState(["LKR", "USD"]);
  const [countries, setCountries]   = useState(["Sri Lanka", "United States"]);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [c, cur] = await Promise.all([fetchCountries(), fetchCurrencies()]);
        setCountries(c);
        setCurrencies(cur);
      } catch (err) {
        console.error("Error loading countries/currencies", err);
      }
    };
    loadFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitSalary({
        ...formData,
        salary: Number(formData.salary),
        yearsOfExperience: Number(formData.yearsOfExperience),
      });
      setSuccess(true);
      setFormData({ company: "", country: "", role: "", salary: "", yearsOfExperience: "", experienceLevel: "MID", currency: "LKR", anonymize: false });
      setTimeout(() => { if (onClose) onClose(); }, 2800);
    } catch {
      setMessage({ type: "error", text: "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'DM Sans', sans-serif", position: "relative", minHeight: 420, overflow: "hidden" }}>

      {/* ── Success overlay ── */}
      {success && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20, borderRadius: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(ellipse at 50% 55%, rgba(52,211,153,0.13) 0%, #0d1117 68%)",
          animation: "ssOverlayIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <style>{`
            @keyframes ssOverlayIn   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
            @keyframes ssIconBounce  { 0%{transform:scale(0.25) rotate(-8deg);opacity:0} 55%{transform:scale(1.18) rotate(2deg)} 78%{transform:scale(0.94) rotate(-1deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
            @keyframes ssRingPulse   { 0%{transform:scale(0.5);opacity:0.65} 100%{transform:scale(2.2);opacity:0} }
            @keyframes ssTitleIn     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            @keyframes ssSubIn       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
            @keyframes ssCheckDraw   { from{stroke-dashoffset:44} to{stroke-dashoffset:0} }
            @keyframes ssPill1       { 0%{transform:translate(0,0) scale(0) rotate(0deg);opacity:1} 100%{transform:translate(-62px,-36px) scale(1) rotate(-12deg);opacity:0} }
            @keyframes ssPill2       { 0%{transform:translate(0,0) scale(0) rotate(0deg);opacity:1} 100%{transform:translate( 62px,-36px) scale(1) rotate( 10deg);opacity:0} }
            @keyframes ssPill3       { 0%{transform:translate(0,0) scale(0) rotate(0deg);opacity:1} 100%{transform:translate(-70px,  8px) scale(1) rotate(-6deg);opacity:0} }
            @keyframes ssPill4       { 0%{transform:translate(0,0) scale(0) rotate(0deg);opacity:1} 100%{transform:translate( 70px,  8px) scale(1) rotate( 8deg);opacity:0} }
            @keyframes ssPill5       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate( -8px,-62px) scale(1);opacity:0} }
            @keyframes ssPill6       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(  8px,-62px) scale(1);opacity:0} }
            @keyframes ssGrid        { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
            @keyframes ssStreakL     { 0%{transform:scaleX(0);transform-origin:right;opacity:0} 35%{opacity:0.8} 100%{transform:scaleX(1) translateX(-55px);opacity:0} }
            @keyframes ssStreakR     { 0%{transform:scaleX(0);transform-origin:left;opacity:0}  35%{opacity:0.8} 100%{transform:scaleX(1) translateX( 55px);opacity:0} }
            @keyframes ssBarGrow     { from{width:0;opacity:0} to{width:100%;opacity:1} }
            @keyframes ssBarFade     { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
          `}</style>

          {/* Dot-grid wash */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(52,211,153,0.2) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            animation: "ssGrid 2s ease-out forwards",
            pointerEvents: "none", borderRadius: 20,
          }} />

          {/* Speed streaks */}
          {[[-1,-14],[1,2],[-1,16],[1,-28]].map(([dir, top], i) => (
            <div key={i} style={{
              position: "absolute", top, left: "50%", width: 280, height: 3, opacity: 0,
              background: `linear-gradient(90deg, transparent, rgba(52,211,153,${0.3 + i*0.1}), transparent)`,
              filter: "blur(1.5px)", animation: dir < 0 ? "ssStreakL 1.2s ease-out" : "ssStreakR 1.2s ease-out",
            }} />
          ))}

          {/* Animated circle + particles ── */}
          <div style={{ position: "relative", zIndex: 2, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* Pulse rings */}
            {[0,1].map((i) => (
              <div key={i} style={{
                position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(52,211,153,0.4)",
                animation: `ssRingPulse 0.9s ease-out ${i * 0.3}s forwards`, opacity: 0,
              }} />
            ))}

            {/* Main circle */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%", position: "relative", zIndex: 1,
              background: "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(6,182,212,0.12))",
              border: "1.5px solid rgba(52,211,153,0.45)",
              boxShadow: "0 0 36px rgba(52,211,153,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "ssIconBounce 0.55s cubic-bezier(.36,.07,.19,.97) both",
            }}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <polyline
                  points="7,18 14,25 27,10"
                  stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="44" strokeDashoffset="44"
                  style={{ animation: "ssCheckDraw 0.45s ease-out 0.3s forwards" }}
                />
              </svg>
            </div>

            {/* Particles — mix of sparkles and tiny $ signs */}
            {[["✦","#34d399","ssPill1"],["✦","#67e8f9","ssPill2"],["$","#a5b4fc","ssPill3"],["$","#34d399","ssPill4"],["✧","#67e8f9","ssPill5"],["✦","#34d399","ssPill6"]].map(([char, color, anim], i) => (
              <div key={i} style={{
                position: "absolute", fontSize: char === "$" ? 11 : 9, fontWeight: 700,
                color, animation: `${anim} 0.75s ease-out 0.18s forwards`, opacity: 0,
              }}>{char}</div>
            ))}
          </div>

          {/* Text */}
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 21,
            color: "#f1f5f9", letterSpacing: "-0.03em", marginTop: 24,
            animation: "ssTitleIn 0.4s ease-out 0.28s both",
          }}>
            Salary submitted!
          </div>
          <div style={{
            fontSize: 13, color: "rgba(232,234,240,0.45)", marginTop: 6,
            fontFamily: "'DM Sans', sans-serif", textAlign: "center",
            animation: "ssSubIn 0.4s ease-out 0.38s both",
          }}>
            Thanks for helping the community
          </div>

          {/* Auto-close progress bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 20px 20px",
            overflow: "hidden", animation: "ssBarFade 2.8s ease-out forwards",
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #34d399, #06b6d4)",
              animation: "ssBarGrow 2.5s linear 0.2s both",
            }} />
          </div>
        </div>
      )}

      {/* Form header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 4 }}>
            Submit Salary
          </h2>
          <p style={{ fontSize: 13, color: "rgba(232,234,240,0.4)" }}>
            Help the community with real compensation data.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.09)",
            background: "rgba(255,255,255,0.04)", color: "rgba(232,234,240,0.5)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1,
          }}>×</button>
        )}
      </div>

      {/* Alert */}
      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 13,
          background: message.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${message.type === "success" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
          color: message.type === "success" ? "#34d399" : "#f87171",
        }}>
          {message.type === "success" ? "✓ " : "✕ "}{message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 18 }}>

          {/* Company */}
          <FieldInput label="Company" name="company" value={formData.company}
            onChange={handleChange} required placeholder="e.g. Nexora" />

          {/* Country */}
          <FieldSelect label="Country" name="country" value={formData.country}
            onChange={handleChange} required>
            <option value="" disabled>Select country…</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </FieldSelect>

          {/* Job Role — autocomplete: API called after 3 chars, free-text also accepted */}
          <JobRoleAutocomplete
            label="Job Role"
            value={formData.role}
            onChange={handleChange}
          />

          {/* Salary + Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
            <FieldInput label="Salary" name="salary" type="number" value={formData.salary}
              onChange={handleChange} required placeholder="0" min="0" />
            <FieldSelect label="Currency" name="currency" value={formData.currency} onChange={handleChange}>
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </FieldSelect>
          </div>

          {/* Years XP + Level */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldInput label="Years of Experience" name="yearsOfExperience" type="number"
              value={formData.yearsOfExperience} onChange={handleChange} required placeholder="0" min="0" max="50" />
            <FieldSelect label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
              {experienceLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </FieldSelect>
          </div>

          {/* Anonymize toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div
              onClick={() => setFormData({ ...formData, anonymize: !formData.anonymize })}
              style={{
                width: 40, height: 22, borderRadius: 99, position: "relative", flexShrink: 0,
                background: formData.anonymize ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.1)",
                border: formData.anonymize ? "none" : "1px solid rgba(255,255,255,0.12)",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: formData.anonymize ? 20 : 3,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#f1f5f9" }}>Submit anonymously</div>
              <div style={{ fontSize: 12, color: "rgba(232,234,240,0.4)", marginTop: 1 }}>Your identity will not be linked to this entry</div>
            </div>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
              background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff",
              boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              transition: "all 0.18s",
            }}
          >
            {loading ? "Submitting…" : "Submit Salary →"}
          </button>

        </div>
      </form>
    </div>
  );
}

export default SalarySubmissionForm;