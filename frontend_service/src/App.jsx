import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import SalaryTable from "./components/SalaryTable";
import { LoginModal, SignupModal } from "./components/AuthModals";
import Lottie from "lottie-react";
import animation from "./assets/Digital Finance Animation.json";
import "./App.css";
import { fetchStats } from "./api/StatsApi";
import { fetchCountries } from "./api/SalaryApi";
/* ─── Session helpers ── */
const isAuthenticated = () => !!sessionStorage.getItem("zalary_token");
const getSessionEmail = () => sessionStorage.getItem("zalary_email") || "";
const logout = () => {
  sessionStorage.removeItem("zalary_token");
  sessionStorage.removeItem("zalary_userId");
  sessionStorage.removeItem("zalary_email");
};

/* ─── Icon helpers ── */
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconLogIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ─── Constants ── */
const LEVELS = ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"];

/* ─── Format Salary Helper ── */
const formatSalary = (val) =>
  val == null ? "—" : "$" + Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 });

/* ─── Stats Section ── */
function StatsSection() {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [countries, setCountries]         = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [location, setLocation]           = useState("");
  const [role, setRole]                   = useState("");
  const [roleInput, setRoleInput]         = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries()
      .then((data) => setCountries(data || []))
      .catch(() => setCountries([]))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStats({ location: location || undefined, role: role || undefined, experienceLevel: experienceLevel || undefined })
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [location, role, experienceLevel]);

  const isFiltering = !!(location || role || experienceLevel);

  const clearFilters = () => {
    setLocation(""); setRole(""); setRoleInput(""); setExperienceLevel("");
  };

  // ── Derived percentile bar positions ──
  const pctKeys = stats?.percentiles ? ["10","25","50","75","90"] : [];
  const pMin = stats?.minSalary ?? 0;
  const pMax = stats?.maxSalary ?? 1;
  const pRange = pMax - pMin || 1;
  const toPos = (v) => Math.max(0, Math.min(100, ((v - pMin) / pRange) * 100));

  const pctColors = {
    "10": { bar: "#34d399", label: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
    "25": { bar: "#a5b4fc", label: "#a5b4fc", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
    "50": { bar: "#f1f5f9", label: "#f1f5f9", bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)" },
    "75": { bar: "#fb923c", label: "#fb923c", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.25)"  },
    "90": { bar: "#f87171", label: "#f87171", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"   },
  };

  const xpColors = {
    INTERN: "#94a3b8", JUNIOR: "#34d399", MID: "#a5b4fc", SENIOR: "#fb923c", LEAD: "#f87171",
  };

  // skeleton block helper
  const Skel = ({ w, h }) => (
    <div style={{ height: h, width: w, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "skeletonPulse 1.4s ease-in-out infinite" }} />
  );

  return (
    <div className="fade-up-4" style={{ marginBottom: 48 }}>

      {/* ── Section header + filters ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#f1f5f9" }}>
            Salary Insights
          </div>
          <div style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", marginTop: 3 }}>
            {loading ? "Crunching numbers…" : stats
              ? `Based on ${stats.count?.toLocaleString() ?? "—"} submission${stats.count !== 1 ? "s" : ""}${isFiltering ? " matching your filters" : ""}`
              : "Filter to explore compensation benchmarks"}
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {/* Country */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loadingCountries}
            style={{
              padding: "7px 28px 7px 10px", borderRadius: 9,
              border: "1px solid " + (location ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
              background: location ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
              color: location ? "#a5b4fc" : "rgba(232,234,240,0.5)",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
              cursor: loadingCountries ? "wait" : "pointer", outline: "none", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='rgba(165,180,252,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}
          >
            <option value="">🌍 Country</option>
            {countries.map((c) => <option key={c} value={c} style={{ background: "#0d1117", color: "#f1f5f9" }}>{c}</option>)}
          </select>

          {/* Role */}
          <div style={{ position: "relative" }}>
            <input
              type="text" placeholder="💼 Role…" value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setRole(roleInput.trim()); if (e.key === "Escape") { setRoleInput(""); setRole(""); } }}
              onBlur={() => setRole(roleInput.trim())}
              style={{
                padding: "7px 28px 7px 10px", borderRadius: 9,
                border: "1px solid " + (role ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
                background: role ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", minWidth: 140,
              }}
            />
            {roleInput && <button onClick={() => { setRoleInput(""); setRole(""); }} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(232,234,240,0.4)", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0 }}>×</button>}
          </div>

          {/* Level pills */}
          <div style={{ display: "flex", gap: 5 }}>
            {LEVELS.map((lvl) => (
              <button key={lvl} onClick={() => setExperienceLevel(experienceLevel === lvl ? "" : lvl)}
                style={{
                  padding: "5px 10px", borderRadius: 99, fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer", transition: "all 0.15s",
                  border: "1px solid " + (experienceLevel === lvl ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"),
                  background: experienceLevel === lvl ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)",
                  color: experienceLevel === lvl ? "#a5b4fc" : "rgba(232,234,240,0.4)",
                }}>
                {lvl}
              </button>
            ))}
          </div>

          {/* Loading + Clear */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 9, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "filterSpin 0.7s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span style={{ fontSize: 11, color: "rgba(165,180,252,0.75)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Loading…</span>
            </div>
          )}
          {isFiltering && !loading && (
            <button onClick={clearFilters} style={{ padding: "6px 11px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500 }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "#f87171", padding: "12px 0" }}>Failed to load statistics.</div>
      )}

      {!error && (
        <>
          {/* ── Row 1: Key metrics ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
            {[
              { key: "avg",    label: "Average",  val: stats?.averageSalary, accent: "#a5b4fc", sub: "mean salary" },
              { key: "median", label: "Median",   val: stats?.medianSalary,  accent: "#f1f5f9", sub: "50th percentile" },
              { key: "min",    label: "Minimum",  val: stats?.minSalary,     accent: "#34d399", sub: "lowest recorded" },
              { key: "max",    label: "Maximum",  val: stats?.maxSalary,     accent: "#f87171", sub: "highest recorded" },
              { key: "count",  label: "Entries",  val: null,                 accent: "#67e8f9", sub: isFiltering ? "filtered" : "total" },
            ].map(({ key, label, val, accent, sub }) => (
              <div key={key} className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
                {/* Subtle left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "4px 0 0 4px", background: accent, opacity: 0.7 }} />
                <div style={{ paddingLeft: 10 }}>
                  {loading ? (
                    <><Skel w={60} h={10} /><div style={{ marginTop: 8 }} /><Skel w={110} h={24} /><div style={{ marginTop: 6 }} /><Skel w={70} h={9} /></>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,234,240,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {key === "count"
                          ? (stats?.count?.toLocaleString() ?? "—")
                          : formatSalary(val)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(232,234,240,0.35)", marginTop: 5 }}>{sub}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: Salary distribution bar + percentiles ── */}
          {!loading && stats && (
            <div style={{ marginBottom: 12, padding: "20px 22px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(232,234,240,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>
                Salary Distribution
              </div>

              {/* Distribution track */}
              <div style={{ position: "relative", height: 36, marginBottom: 28 }}>
                {/* Base track */}
                <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)" }} />

                {/* Filled range (P10 → P90) */}
                {stats.percentiles?.["10"] != null && stats.percentiles?.["90"] != null && (
                  <div style={{
                    position: "absolute", top: 14, height: 8, borderRadius: 99,
                    left: `${toPos(stats.percentiles["10"])}%`,
                    right: `${100 - toPos(stats.percentiles["90"])}%`,
                    background: "linear-gradient(90deg, rgba(52,211,153,0.4), rgba(99,102,241,0.5), rgba(239,68,68,0.4))",
                  }} />
                )}

                {/* Median marker */}
                {stats.medianSalary != null && (
                  <div style={{
                    position: "absolute", top: 8, width: 2, height: 20, borderRadius: 99,
                    left: `calc(${toPos(stats.medianSalary)}% - 1px)`,
                    background: "#f1f5f9", boxShadow: "0 0 6px rgba(255,255,255,0.4)",
                  }} />
                )}

                {/* Average marker */}
                {stats.averageSalary != null && (
                  <div style={{
                    position: "absolute", top: 10, width: 2, height: 16, borderRadius: 99,
                    left: `calc(${toPos(stats.averageSalary)}% - 1px)`,
                    background: "#a5b4fc", boxShadow: "0 0 6px rgba(165,180,252,0.5)",
                  }} />
                )}

                {/* Percentile dots */}
                {pctKeys.map((k) => {
                  const v = stats.percentiles?.[k];
                  if (v == null) return null;
                  const c = pctColors[k];
                  return (
                    <div key={k} style={{
                      position: "absolute", top: 11,
                      left: `calc(${toPos(v)}% - 6px)`,
                      width: 12, height: 12, borderRadius: "50%",
                      background: c.bg, border: `2px solid ${c.bar}`,
                      boxShadow: `0 0 8px ${c.bar}60`,
                    }} />
                  );
                })}

                {/* Min / Max labels */}
                <div style={{ position: "absolute", bottom: -18, left: 0, fontSize: 10, color: "rgba(232,234,240,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{formatSalary(pMin)}</div>
                <div style={{ position: "absolute", bottom: -18, right: 0, fontSize: 10, color: "rgba(232,234,240,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{formatSalary(pMax)}</div>
              </div>

              {/* Legend row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  { label: "Median", color: "#f1f5f9", type: "line" },
                  { label: "Average", color: "#a5b4fc", type: "line" },
                  ...pctKeys.map((k) => ({ label: `P${k}`, color: pctColors[k].bar, type: "dot" })),
                ].map(({ label, color, type }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {type === "line"
                      ? <div style={{ width: 14, height: 2, borderRadius: 99, background: color, boxShadow: `0 0 4px ${color}80` }} />
                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}80` }} />
                    }
                    <span style={{ fontSize: 11, color: "rgba(232,234,240,0.5)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skeleton for distribution bar */}
          {loading && (
            <div style={{ marginBottom: 12, padding: "20px 22px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <Skel w={140} h={10} />
              <div style={{ marginTop: 16 }}><Skel w="100%" h={8} /></div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {[80,60,50,60,50,55,65].map((w,i) => <Skel key={i} w={w} h={22} />)}
              </div>
            </div>
          )}

          {/* ── Row 3: Percentile cards ── */}
          {!loading && stats?.percentiles && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 12 }}>
              {pctKeys.map((k) => {
                const v = stats.percentiles[k];
                const c = pctColors[k];
                return (
                  <div key={k} style={{ padding: "14px 14px", borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.label, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, opacity: 0.8 }}>P{k}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: c.label, letterSpacing: "-0.02em" }}>{formatSalary(v)}</div>
                    <div style={{ fontSize: 10, color: "rgba(232,234,240,0.3)", marginTop: 4 }}>{k}th pct</div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 12 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                  <Skel w={28} h={9} /><div style={{ margin: "8px auto" }}><Skel w={70} h={16} /></div><Skel w={40} h={8} />
                </div>
              ))}
            </div>
          )}

          {/* ── Row 4: Experience breakdown ── */}
          {!loading && stats?.experienceBreakdown && Object.keys(stats.experienceBreakdown).length > 0 && (
            <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(232,234,240,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                By Experience Level
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LEVELS.filter(lvl => stats.experienceBreakdown[lvl]).map((lvl) => {
                  const d = stats.experienceBreakdown[lvl];
                  const color = xpColors[lvl];
                  const barPct = stats.maxSalary ? Math.max(4, (d.average / stats.maxSalary) * 100) : 4;
                  return (
                    <div key={lvl} style={{ display: "grid", gridTemplateColumns: "72px 1fr 110px 70px", alignItems: "center", gap: 12 }}>
                      {/* Level badge */}
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "3px 0", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", background: `${color}18`, color, border: `1px solid ${color}40` }}>
                        {lvl}
                      </div>
                      {/* Bar */}
                      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barPct}%`, borderRadius: 99, background: color, opacity: 0.7, transition: "width 0.6s ease" }} />
                      </div>
                      {/* Average */}
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#f1f5f9", textAlign: "right" }}>{formatSalary(d.average)}</div>
                      {/* Count */}
                      <div style={{ fontSize: 11, color: "rgba(232,234,240,0.35)", textAlign: "right" }}>{d.count?.toLocaleString()} {d.count === 1 ? "entry" : "entries"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)" }}>
              <Skel w={140} h={10} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr 110px 70px", alignItems: "center", gap: 12 }}>
                    <Skel w={72} h={22} /><Skel w="100%" h={8} /><Skel w={90} h={14} /><Skel w={50} h={11} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── App ── */
function App() {
  // Restore session if token is still in sessionStorage
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [userEmail, setUserEmail]   = useState(getSessionEmail);

  // Modal visibility
  const [showLogin,  setShowLogin]  = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Derive initials for avatar
  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : "U";

  const handleAuthSuccess = ({ userId, email }) => {
    setIsLoggedIn(true);
    setUserEmail(email || "");
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserEmail("");
  };

  // Switch between modals without closing
  const openLogin  = () => { setShowSignup(false); setShowLogin(true);  };
  const openSignup = () => { setShowLogin(false);  setShowSignup(true); };

  return (
    <>
      <style>{`@keyframes skeletonPulse{0%,100%{opacity:.4}50%{opacity:.9}} @keyframes filterSpin{to{transform:rotate(360deg)}}`}</style>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div className="logo-mark">Z</div>
          <span className="logo-text">Zalary</span>
          <div style={{ marginLeft: 16 }}>
            <span className="live-badge">
              <span className="live-dot" />
              Live
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{avatarLetter}</div>
                <span className="user-name">{userEmail || "You"}</span>
              </div>
              <button className="btn-danger" onClick={handleLogout}>
                <IconLogOut /> Sign out
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={openLogin}>
                <IconLogIn /> Log in
              </button>
              <button className="btn-primary" onClick={openSignup}>
                <IconUsers /> Sign up free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Page body ── */}
      <div style={{ paddingTop: 96, paddingBottom: 80 }}>
        <Container maxWidth="xl">

          {/* ── Hero ── */}
          <div style={{ maxWidth: 720, marginBottom: 60 }}>
            <div className="hero-eyebrow fade-up-1" style={{ marginBottom: 16 }}>
              Compensation transparency
            </div>
            <h1 className="hero-title fade-up-2" style={{ marginBottom: 20 }}>
              Know your worth. Share yours.
            </h1>
            <p className="hero-sub fade-up-3">
              Zalary is the anonymous, community-driven salary platform helping tech professionals
              benchmark compensation with real, verified data.
            </p>

{/*             {!isLoggedIn && (
              <div className="fade-up-4" style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <button className="btn-primary" onClick={openSignup}
                  style={{ padding: "12px 28px", fontSize: 15 }}>
                  Share your salary
                </button>
                <button className="btn-ghost" onClick={openLogin}
                  style={{ padding: "12px 24px", fontSize: 15 }}>
                  Browse data
                </button>
              </div>
            )} */}
          </div>

          {/* ── Stats row ── */}
          <StatsSection />

          {/* ── Divider ── */}
          <div className="section-divider" style={{ marginBottom: 40 }} />

          {/* ── Section label ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#f1f5f9" }}>
                Salary Explorer
              </div>
              <div style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", marginTop: 2 }}>
                {isLoggedIn ? `Signed in as ${userEmail}` : "Log in to submit or view detailed breakdowns"}
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="glass-card">
            <SalaryTable isLoggedIn={isLoggedIn} />
          </div>

        </Container>
      </div>

      {/* ── Auth Modals ── */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToSignup={openSignup}
      />
      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}

export default App;