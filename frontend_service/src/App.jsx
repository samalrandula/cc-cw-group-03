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

/* ─── Stats Section ── */
function StatsSection() {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Filter state
  const [countries, setCountries]         = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [location, setLocation]           = useState("");
  const [role, setRole]                   = useState("");
  const [roleInput, setRoleInput]         = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Load countries once
  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries()
      .then((data) => setCountries(data || []))
      .catch(() => setCountries([]))
      .finally(() => setLoadingCountries(false));
  }, []);

  // Fetch stats whenever filters change
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
    setLocation("");
    setRole("");
    setRoleInput("");
    setExperienceLevel("");
  };

  const formatSalary = (val) =>
    val == null ? "—" : "$" + Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const statCards = stats
    ? [
        { label: "Average Salary",  value: formatSalary(stats.averageSalary), sub: "mean across entries" },
        { label: "Median Salary",   value: formatSalary(stats.medianSalary),  sub: "middle of the range" },
        { label: "Total Entries",   value: stats.count != null ? stats.count.toLocaleString() : "—", sub: isFiltering ? "matching your filters" : "all submissions" },
      ]
    : [];

  return (
    <div className="fade-up-4" style={{ marginBottom: 48, maxWidth: 900 }}>

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 }}>

        {/* Country — single-select dropdown */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loadingCountries}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid " + (location ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
            background: location ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
            color: location ? "#a5b4fc" : "rgba(232,234,240,0.5)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            cursor: loadingCountries ? "wait" : "pointer",
            outline: "none",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(165,180,252,0.6)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: 30,
            minWidth: 160,
          }}
        >
          <option value="">🌍 Country</option>
          {countries.map((c) => (
            <option key={c} value={c} style={{ background: "#0d1117", color: "#f1f5f9" }}>{c}</option>
          ))}
        </select>

        {/* Role — type input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="💼 Role…"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { setRole(roleInput.trim()); }
              if (e.key === "Escape") { setRoleInput(""); setRole(""); }
            }}
            onBlur={() => setRole(roleInput.trim())}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid " + (role ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
              background: role ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
              color: "#f1f5f9",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              outline: "none",
              minWidth: 160,
            }}
          />
          {roleInput && (
            <button
              onClick={() => { setRoleInput(""); setRole(""); }}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(232,234,240,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
            >×</button>
          )}
        </div>

        {/* Experience Level — single-select pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setExperienceLevel(experienceLevel === lvl ? "" : lvl)}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                border: "1px solid " + (experienceLevel === lvl ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
                background: experienceLevel === lvl ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)",
                color: experienceLevel === lvl ? "#a5b4fc" : "rgba(232,234,240,0.45)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "filterSpin 0.7s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span style={{ fontSize: 12, color: "rgba(165,180,252,0.75)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Loading…</span>
          </div>
        )}

        {/* Clear */}
        {isFiltering && !loading && (
          <button
            onClick={clearFilters}
            style={{ padding: "7px 13px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Stat cards */}
      {error ? (
        <div style={{ fontSize: 13, color: "#f87171", padding: "12px 0" }}>Failed to load statistics.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 800 }}>
          {(loading ? [{}, {}, {}] : statCards).map((s, i) => (
            <div className="stat-card" key={i}>
              {loading ? (
                <>
                  <div style={{ height: 11, width: 100, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 10, animation: "skeletonPulse 1.4s ease-in-out infinite" }} />
                  <div style={{ height: 28, width: 140, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 8, animation: "skeletonPulse 1.4s ease-in-out infinite" }} />
                  <div style={{ height: 10, width: 80, borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "skeletonPulse 1.4s ease-in-out infinite" }} />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(232,234,240,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#34d399", marginTop: 2 }}>{s.sub}</div>
                </>
              )}
            </div>
          ))}
        </div>
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