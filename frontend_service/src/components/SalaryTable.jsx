import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import SalarySubmissionForm from "./SalarySubmissionForm";
import { fetchSalaries, fetchCurrencies, fetchCountries } from "../api/salaryApi";
import { submitVote } from "../api/voteApi";
import { submitReport, REPORT_REASONS } from "../api/reportApi";

/* ── Inline styles ── */
const S = {
  wrapper: { width: "100%", fontFamily: "'DM Sans', sans-serif" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.065)",
  },
  tableTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#f1f5f9" },
  tableSubtitle: { fontSize: 13, color: "rgba(232,234,240,0.4)", marginTop: 3 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(232,234,240,0.4)",
    borderBottom: "1px solid rgba(255,255,255,0.065)", background: "rgba(255,255,255,0.018)", whiteSpace: "nowrap",
  },
  td: { padding: "14px 20px", fontSize: 14, color: "rgba(232,234,240,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
};

/* ── Experience badge ── */
const xpColors = {
  INTERN: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" },
  JUNIOR: { bg: "rgba(52,211,153,0.1)",  color: "#34d399", border: "rgba(52,211,153,0.25)" },
  MID:    { bg: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "rgba(99,102,241,0.3)"  },
  SENIOR: { bg: "rgba(251,146,60,0.1)",  color: "#fb923c", border: "rgba(251,146,60,0.25)" },
  LEAD:   { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.25)"  },
};

const XpBadge = ({ level }) => {
  const c = xpColors[level] || xpColors["MID"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", background: c.bg, color: c.color, border: "1px solid " + c.border }}>
      {level}
    </span>
  );
};

/* ── Helpers ── */
const countryFlag = (c) => ({ "Sri Lanka":"🇱🇰","Singapore":"🇸🇬","India":"🇮🇳","United States":"🇺🇸","United Kingdom":"🇬🇧","Germany":"🇩🇪","Australia":"🇦🇺","Canada":"🇨🇦" }[c] || "🌍");
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

/* ── Experience Levels ── */
const LEVELS = ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"];

/* ── Multi-Select Dropdown ── */
const MultiSelectDropdown = ({ label, icon, options, selected, onChange, isLoading, isSearchable = false }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, isSearchable]);

  const handleToggle = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid " + (open ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
          background: open ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
          color: selected.length > 0 ? "#a5b4fc" : "rgba(232,234,240,0.6)",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        {selected.length > 0 && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: 99,
            background: "rgba(99,102,241,0.25)",
            fontSize: 11,
            fontWeight: 700,
            color: "#a5b4fc",
          }}>
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 8,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(13, 17, 23, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          zIndex: 1000,
          minWidth: 240,
          maxWidth: 320,
          maxHeight: 320,
          overflowY: "auto",
        }}>
          {isSearchable && (
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(13, 17, 23, 0.98)" }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f1f5f9",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>
          )}
          {isLoading ? (
            <div style={{ padding: "16px 12px", textAlign: "center", color: "rgba(232,234,240,0.4)", fontSize: 13 }}>
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div style={{ padding: "16px 12px", textAlign: "center", color: "rgba(232,234,240,0.4)", fontSize: 13 }}>
              No options found
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <label
                    key={option}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: isSelected ? "rgba(99,102,241,0.15)" : "transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.target.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.target.style.background = isSelected ? "rgba(99,102,241,0.15)" : "transparent"; }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(option)}
                      style={{
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                        accentColor: "#6366f1",
                      }}
                    />
                    <span style={{
                      fontSize: 13,
                      color: isSelected ? "#a5b4fc" : "rgba(232,234,240,0.7)",
                      fontFamily: "'DM Sans', sans-serif",
                      userSelect: "none",
                    }}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Tag Input Filter ── */
const TagInput = ({ label, icon, tags, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid " + (focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"),
        background: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.03)",
        cursor: "text",
        minWidth: 180,
        maxWidth: 320,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14, userSelect: "none" }}>{icon}</span>
      {tags.length === 0 && inputValue === "" && (
        <span style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", fontFamily: "'DM Sans', sans-serif", pointerEvents: "none", userSelect: "none" }}>
          {label}…
        </span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 99,
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "#a5b4fc",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
          <button
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(165,180,252,0.6)",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
            }}
          >×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (inputValue.trim()) addTag(inputValue); }}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          color: "#f1f5f9",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          minWidth: 80,
          flex: 1,
          padding: "2px 0",
        }}
        placeholder={tags.length > 0 ? "+" : ""}
      />
    </div>
  );
};

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr>
    {[200, 160, 130, 80, 110, 90, 60].map((w, i) => (
      <td key={i} style={S.td}>
        <div style={{ height: 14, width: w, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "skeletonPulse 1.4s ease-in-out infinite" }} />
      </td>
    ))}
  </tr>
);

/* ── Pagination ── */
const Pagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0 || loading}
        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: currentPage === 0 ? "rgba(232,234,240,0.2)" : "rgba(232,234,240,0.6)", cursor: currentPage === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
        <button key={p} onClick={() => onPageChange(p)} disabled={loading}
          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid " + (p === currentPage ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"), background: p === currentPage ? "rgba(99,102,241,0.18)" : "transparent", color: p === currentPage ? "#a5b4fc" : "rgba(232,234,240,0.5)", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: p === currentPage ? 700 : 400 }}>
          {p + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || loading}
        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: currentPage >= totalPages - 1 ? "rgba(232,234,240,0.2)" : "rgba(232,234,240,0.6)", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
        Next
      </button>
    </div>
  );
};

/* ── Vote Success Animation ── */
const VoteSuccessOverlay = ({ voteType }) => {
  const isUp = voteType === "UPVOTE";
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 16, zIndex: 10,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: isUp ? "rgba(5,20,15,0.97)" : "rgba(20,5,5,0.97)",
      animation: "voteOverlayIn 0.25s ease-out",
    }}>
      <style>{`
        @keyframes voteOverlayIn { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
        @keyframes voteBounce { 0%{transform:scale(0.4);opacity:0} 55%{transform:scale(1.25)} 75%{transform:scale(0.92)} 100%{transform:scale(1);opacity:1} }
        @keyframes voteRing { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes voteText { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes votePop1 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-28px,-40px) scale(1);opacity:0} }
        @keyframes votePop2 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(28px,-40px) scale(1);opacity:0} }
        @keyframes votePop3 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-36px,-10px) scale(1);opacity:0} }
        @keyframes votePop4 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(36px,-10px) scale(1);opacity:0} }
        @keyframes votePop5 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(0px,-48px) scale(1);opacity:0} }
      `}</style>

      {/* Pulse ring */}
      <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: "absolute", width: 80, height: 80, borderRadius: "50%",
            border: `2px solid ${isUp ? "#34d399" : "#f87171"}`,
            animation: `voteRing 1.2s ease-out ${i * 0.3}s infinite`,
            opacity: 0,
          }} />
        ))}

        {/* Main icon circle */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: isUp ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
          border: `1.5px solid ${isUp ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`,
          fontSize: 34,
          animation: "voteBounce 0.5s cubic-bezier(.36,.07,.19,.97) both",
          position: "relative", zIndex: 1,
        }}>
          {isUp ? "👍" : "👎"}
        </div>

        {/* Particle bursts */}
        {isUp && ["✦","✦","★","✦","✦"].map((p, i) => (
          <div key={i} style={{
            position: "absolute", fontSize: i === 2 ? 12 : 8,
            color: i % 2 === 0 ? "#34d399" : "#6ee7b7",
            animation: `votePop${i + 1} 0.7s ease-out 0.15s forwards`,
            opacity: 0,
          }}>{p}</div>
        ))}
      </div>

      <div style={{ marginTop: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: isUp ? "#34d399" : "#f87171", animation: "voteText 0.35s ease-out 0.15s both" }}>
        {isUp ? "Marked as Accurate!" : "Marked as Inaccurate"}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "rgba(232,234,240,0.4)", fontFamily: "'DM Sans', sans-serif", animation: "voteText 0.35s ease-out 0.25s both" }}>
        Thanks for keeping the data honest
      </div>
    </div>
  );
};

/* ── Vote Modal ── */
const VoteModal = ({ open, onClose, salary }) => {
  const [vote, setVote]             = useState("UPVOTE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  // phase: "vote" | "success" | "transitioning" | "report" | "reportSuccess"
  const [phase, setPhase]           = useState("vote");
  const [successVote, setSuccessVote] = useState(null);

  // Report state
  const [reason, setReason]           = useState("");
  const [comment, setComment]         = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [commentFocused, setCommentFocused] = useState(false);

  useEffect(() => {
    if (open) {
      setVote("UPVOTE"); setSubmitting(false); setError(null);
      setPhase("vote"); setSuccessVote(null);
      setReason(""); setComment(""); setReportError(null); setReportSubmitting(false);
    }
  }, [open, salary?.id]);

  const handleVoteSubmit = async () => {
    if (!salary?.id) return;
    setSubmitting(true); setError(null);
    try {
      await submitVote({ salarySubmissionId: salary.id, voteType: vote });
      setSuccessVote(vote);
      setPhase("success");
      if (vote === "DOWNVOTE") {
        setTimeout(() => setPhase("transitioning"), 1800);
        setTimeout(() => setPhase("report"), 2150);
      } else {
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reason) { setReportError("Please select a reason."); return; }
    setReportSubmitting(true); setReportError(null);
    try {
      await submitReport({ submissionId: salary.id, reason, comment });
      setPhase("reportSuccess");
      setTimeout(() => onClose(), 2200);
    } catch (err) {
      setReportError(err?.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  if (!salary) return null;

  const isCloseable = phase === "vote" || phase === "report";

  return (
    <Dialog open={open} onClose={isCloseable ? onClose : undefined}
      PaperProps={{ style: {
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        minWidth: 380, position: "relative", overflow: "hidden",
      }}}>

      <style>{`
        @keyframes voteSlideOut  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-52px)} }
        @keyframes reportSlideIn { from{opacity:0;transform:translateX(56px)} to{opacity:1;transform:translateX(0)} }
        @keyframes rptFlagWave   { 0%{transform:rotate(-18deg) scale(0.3);opacity:0} 45%{transform:rotate(8deg) scale(1.15)} 65%{transform:rotate(-4deg) scale(0.97)} 80%{transform:rotate(2deg)} 100%{transform:rotate(0deg) scale(1);opacity:1} }
        @keyframes rptRing       { 0%{transform:scale(0.5);opacity:0.6} 100%{transform:scale(2.1);opacity:0} }
        @keyframes rptTextIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rptPop1       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-32px,-38px) scale(1);opacity:0} }
        @keyframes rptPop2       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(32px,-38px) scale(1);opacity:0} }
        @keyframes rptPop3       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-42px,4px) scale(1);opacity:0} }
        @keyframes rptPop4       { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(42px,4px) scale(1);opacity:0} }
        @keyframes rptBarGrow    { from{width:0} to{width:100%} }
        @keyframes rptSuccessIn  { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* ── VOTE phase ── */}
      {(phase === "vote" || phase === "success" || phase === "transitioning") && (
        <div style={{
          animation: phase === "transitioning" ? "voteSlideOut 0.32s cubic-bezier(0.4,0,1,1) both" : undefined,
        }}>
          {(phase === "success" || phase === "transitioning") && (
            <VoteSuccessOverlay voteType={successVote} />
          )}

          <DialogTitle style={{ padding: "24px 28px 0", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", fontSize: 18 }}>
            Cast your vote
            <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(232,234,240,0.4)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {salary.company} · {salary.role}
            </div>
          </DialogTitle>

          <DialogContent style={{ padding: "20px 28px 28px" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, marginTop: 8 }}>
              {["UPVOTE", "DOWNVOTE"].map((v) => (
                <button key={v} onClick={() => !submitting && setVote(v)}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, transition: "all 0.15s",
                    border: "1px solid " + (vote === v ? (v === "UPVOTE" ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.5)") : "rgba(255,255,255,0.08)"),
                    background: vote === v ? (v === "UPVOTE" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)") : "rgba(255,255,255,0.03)",
                    color: vote === v ? (v === "UPVOTE" ? "#34d399" : "#f87171") : "rgba(232,234,240,0.55)",
                    opacity: submitting ? 0.6 : 1,
                  }}>
                  {v === "UPVOTE" ? "👍 Accurate" : "👎 Inaccurate"}
                </button>
              ))}
            </div>

            {vote === "DOWNVOTE" && phase === "vote" && (
              <div style={{ marginBottom: 14, padding: "9px 13px", borderRadius: 8, background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.18)", color: "rgba(251,146,60,0.8)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                ⚑ After voting, you'll have the option to file a report with more details.
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} disabled={submitting}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, background: "rgba(255,255,255,0.05)", color: "rgba(232,234,240,0.6)", border: "1px solid rgba(255,255,255,0.08)", opacity: submitting ? 0.5 : 1 }}>
                Cancel
              </button>
              <button onClick={handleVoteSubmit} disabled={submitting}
                style={{ flex: 2, padding: "10px 0", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.35)", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "filterSpin 0.7s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Submitting…
                  </>
                ) : "Submit Vote"}
              </button>
            </div>
          </DialogContent>
        </div>
      )}

      {/* ── REPORT phase ── */}
      {(phase === "report" || phase === "reportSuccess") && (
        <div style={{ animation: phase === "report" ? "reportSlideIn 0.38s cubic-bezier(0.16,1,0.3,1) both" : undefined, position: "relative" }}>

          {/* Report success overlay */}
          {phase === "reportSuccess" && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16, zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(ellipse at 50% 55%, rgba(251,146,60,0.12) 0%, #0d1117 70%)",
              animation: "rptSuccessIn 0.28s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[0,1].map(i => <div key={i} style={{ position: "absolute", width: 78, height: 78, borderRadius: "50%", border: "1.5px solid rgba(251,146,60,0.4)", animation: `rptRing 1.3s ease-out ${i*0.28}s infinite`, opacity: 0 }} />)}
                <div style={{ width: 74, height: 74, borderRadius: "50%", zIndex: 1, position: "relative", background: "rgba(251,146,60,0.12)", border: "1.5px solid rgba(251,146,60,0.4)", boxShadow: "0 0 28px rgba(251,146,60,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, animation: "rptFlagWave 0.6s cubic-bezier(.36,.07,.19,.97) both" }}>⚑</div>
                {["✦","✦","✧","✦"].map((p,i) => <div key={i} style={{ position: "absolute", fontSize: 8, color: i%2===0?"#fb923c":"#fcd34d", animation: `rptPop${i+1} 0.65s ease-out 0.2s forwards`, opacity: 0 }}>{p}</div>)}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#fb923c", marginTop: 20, animation: "rptTextIn 0.38s ease-out 0.22s both" }}>Report submitted</div>
              <div style={{ fontSize: 13, color: "rgba(232,234,240,0.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 6, animation: "rptTextIn 0.38s ease-out 0.32s both" }}>We'll review this entry soon</div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, overflow: "hidden", borderRadius: "0 0 16px 16px" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, #fb923c, #fcd34d)", animation: "rptBarGrow 2s linear 0.15s both" }} />
              </div>
            </div>
          )}

          <DialogTitle style={{ padding: "22px 24px 0", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", fontSize: 17 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>⚑</span> Report entry
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, color: "rgba(251,146,60,0.65)", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 99, padding: "2px 9px", letterSpacing: "0.04em" }}>
                after inaccurate vote
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(232,234,240,0.35)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {salary.company} · {salary.role}
            </div>
          </DialogTitle>

          <DialogContent style={{ padding: "16px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
              Reason <span style={{ color: "#f87171" }}>*</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              {REPORT_REASONS.map((r) => {
                const selected = reason === r;
                return (
                  <button key={r} onClick={() => { setReason(r); setReportError(null); }}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: selected ? 600 : 400,
                      transition: "all 0.13s",
                      border: `1px solid ${selected ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.07)"}`,
                      background: selected ? "rgba(251,146,60,0.1)" : "rgba(255,255,255,0.025)",
                      color: selected ? "#fb923c" : "rgba(232,234,240,0.65)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${selected ? "#fb923c" : "rgba(255,255,255,0.2)"}`, background: selected ? "#fb923c" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.13s" }}>
                      {selected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d1117", display: "block" }} />}
                    </span>
                    {r}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
              Additional comment <span style={{ color: "rgba(232,234,240,0.25)", textTransform: "none", fontWeight: 400, letterSpacing: 0 }}> — optional</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={() => setCommentFocused(true)}
              onBlur={() => setCommentFocused(false)}
              placeholder="Any extra details that might help our review…"
              maxLength={400} rows={3}
              style={{
                width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, resize: "none",
                background: commentFocused ? "rgba(251,146,60,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${commentFocused ? "rgba(251,146,60,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: "#f1f5f9", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                outline: "none", transition: "all 0.15s", marginBottom: 4,
              }}
            />
            <div style={{ fontSize: 11, color: "rgba(232,234,240,0.25)", textAlign: "right", marginBottom: 18 }}>{comment.length}/400</div>

            {reportError && (
              <div style={{ marginBottom: 14, padding: "9px 13px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                {reportError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} disabled={reportSubmitting}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, cursor: reportSubmitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: "rgba(232,234,240,0.55)", border: "1px solid rgba(255,255,255,0.07)", opacity: reportSubmitting ? 0.5 : 1 }}>
                Skip
              </button>
              <button onClick={handleReportSubmit} disabled={reportSubmitting || !reason}
                style={{
                  flex: 2, padding: "10px 0", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: reportSubmitting || !reason ? "not-allowed" : "pointer",
                  background: !reason ? "rgba(255,255,255,0.04)" : reportSubmitting ? "rgba(251,146,60,0.3)" : "linear-gradient(135deg, #fb923c, #f97316)",
                  color: !reason ? "rgba(232,234,240,0.3)" : "#fff",
                  border: !reason ? "1px solid rgba(255,255,255,0.07)" : "none",
                  boxShadow: !reason || reportSubmitting ? "none" : "0 4px 16px rgba(251,146,60,0.3)",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {reportSubmitting ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "filterSpin 0.7s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Submitting…
                  </>
                ) : "Submit Report"}
              </button>
            </div>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

/* ── Main component ── */
function SalaryTable({ isLoggedIn }) {
  const [openSubmission, setOpenSubmission] = useState(false);
  const [openVote, setOpenVote]             = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [hoveredRow, setHoveredRow]         = useState(null);

  // Multi-select filters
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedRoles, setSelectedRoles]         = useState([]);
  const [selectedLevels, setSelectedLevels]       = useState([]);

  // Dropdown options
  const [countries, setCountries] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({ countries: false });

  // API state
  const [salaries, setSalaries]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentPage, setCurrentPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalCount, setTotalCount]     = useState(0);

  const debounceRef = useRef(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountriesData = async () => {
      setLoadingOptions((prev) => ({ ...prev, countries: true }));
      try {
        const data = await fetchCountries();
        setCountries(data || []);
      } catch (err) {
        console.error("Failed to fetch countries", err);
        setCountries(["Sri Lanka", "United States"]);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, countries: false }));
      }
    };
    fetchCountriesData();
  }, []);

  const loadSalaries = useCallback(
    async (page) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, pageSize: 10 };

        // Add filters if selected
        if (selectedCountries.length > 0) params.countries = selectedCountries.join(",");
        if (selectedCompanies.length > 0) params.companies = selectedCompanies.join(",");
        if (selectedRoles.length > 0) params.roles = selectedRoles.join(",");
        if (selectedLevels.length > 0) params.levels = selectedLevels.join(",");

        const data = await fetchSalaries(params);
        setSalaries(data.salaries || []);
        setTotalPages(data.totalPages || 0);
        setTotalCount(data.totalCount || 0);
        setCurrentPage(data.currentPage ?? page);
      } catch (err) {
        console.error("Failed to fetch salaries", err);
        setError("Failed to load salaries. Please check your connection and try again.");
        setSalaries([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedCountries, selectedCompanies, selectedRoles, selectedLevels]
  );

  // Trigger fetch when filters change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSalaries(0);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [selectedCountries, selectedCompanies, selectedRoles, selectedLevels, loadSalaries]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadSalaries(newPage);
  };

  const handleOpenVote = (s) => {
    if (!isLoggedIn) { alert("Please log in to vote."); return; }
    setSelectedSalary(s);
    setOpenVote(true);
  };

  const handleVoteSubmit = () => {}; // voting is now handled inside VoteModal

  const handleSubmissionClose = () => {
    setOpenSubmission(false);
    loadSalaries(0);
  };

  const isFiltering = selectedCountries.length > 0 || selectedCompanies.length > 0 || selectedRoles.length > 0 || selectedLevels.length > 0;

  return (
    <>
      <style>{`@keyframes skeletonPulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} } @keyframes filterSpin { to { transform: rotate(360deg); } }`}</style>

      <div style={S.wrapper}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={S.tableTitle}>Latest Submissions</div>
            <div style={S.tableSubtitle}>
              {loading ? "Loading…"
                : error ? "Error loading data"
                : isFiltering ? totalCount + " result" + (totalCount !== 1 ? "s" : "") + " found"
                : totalCount + " entries · page " + (currentPage + 1) + " of " + totalPages}
            </div>
          </div>
          <button className="btn-primary" onClick={() => setOpenSubmission(true)} style={{ fontSize: 13 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Submit Salary
          </button>
        </div>

        {/* Multi-Select Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.012)" }}>
          <MultiSelectDropdown
            label="Country"
            icon="🌍"
            options={countries}
            selected={selectedCountries}
            onChange={setSelectedCountries}
            isLoading={loadingOptions.countries}
          />
          <TagInput
            label="Company"
            icon="🏢"
            tags={selectedCompanies}
            onChange={setSelectedCompanies}
          />
          <TagInput
            label="Role"
            icon="💼"
            tags={selectedRoles}
            onChange={setSelectedRoles}
          />
          <MultiSelectDropdown
            label="Level"
            icon="📊"
            options={LEVELS}
            selected={selectedLevels}
            onChange={setSelectedLevels}
          />
          {loading && isFiltering && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "filterSpin 0.7s linear infinite", flexShrink: 0 }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span style={{ fontSize: 12, color: "rgba(165,180,252,0.75)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                Filtering…
              </span>
            </div>
          )}
          {isFiltering && (
            <button
              onClick={() => {
                setSelectedCountries([]);
                setSelectedCompanies([]);
                setSelectedRoles([]);
                setSelectedLevels([]);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Company", "Role", "Country", "Level", "Salary", "Date", ""].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Skeleton */}
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={7} style={{ padding: "52px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
                    <div style={{ color: "#f87171", fontSize: 14, marginBottom: 12 }}>{error}</div>
                    <button onClick={() => loadSalaries(currentPage)}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                      Retry
                    </button>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && salaries.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "52px 24px", textAlign: "center", color: "rgba(232,234,240,0.3)", fontSize: 14 }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
                    {isFiltering
                      ? "No results found. Try a different filter."
                      : "No salary entries yet. Be the first to submit!"}
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && !error && salaries.map((row) => (
                <tr key={row.id}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background: hoveredRow === row.id ? "rgba(255,255,255,0.025)" : "transparent", transition: "background 0.15s" }}
                >
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.3))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#a5b4fc" }}>
                        {row.isAnonymized ? "?" : row.company[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: "#f1f5f9" }}>
                        {row.isAnonymized ? <em style={{ color: "rgba(232,234,240,0.35)", fontStyle: "italic" }}>Anonymous</em> : row.company}
                      </span>
                    </div>
                  </td>
                  <td style={S.td}>{row.role}</td>
                  <td style={S.td}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{countryFlag(row.country)}</span>
                      <span>{row.country}</span>
                    </span>
                  </td>
                  <td style={S.td}><XpBadge level={row.experienceLevel} /></td>
                  <td style={{ ...S.td, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>
                    {row.salary.toLocaleString()}
                    <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(232,234,240,0.4)", marginLeft: 4 }}>{row.currency}</span>
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: "rgba(232,234,240,0.35)", whiteSpace: "nowrap" }}>
                    {formatDate(row.submittedAt)}
                  </td>
                  <td style={{ ...S.td, textAlign: "right" }}>
                    <button onClick={() => handleOpenVote(row)} disabled={!isLoggedIn}
                      style={{ padding: "7px 14px", borderRadius: 8, cursor: isLoggedIn ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, background: isLoggedIn ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)", color: isLoggedIn ? "#a5b4fc" : "rgba(232,234,240,0.3)", border: "1px solid " + (isLoggedIn ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"), transition: "all 0.15s", opacity: isLoggedIn ? 1 : 0.5 }}
                      onMouseEnter={(e) => { if (isLoggedIn) { e.target.style.background = "rgba(99,102,241,0.22)"; e.target.style.borderColor = "rgba(99,102,241,0.4)"; }}}
                      onMouseLeave={(e) => { if (isLoggedIn) { e.target.style.background = "rgba(99,102,241,0.12)"; e.target.style.borderColor = "rgba(99,102,241,0.25)"; }}}
                    >Vote</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} />
        )}

        {/* Login footer */}
        {!isLoggedIn && (
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 13, color: "rgba(232,234,240,0.35)" }}>
            🔒 Log in to vote on salaries
          </div>
        )}

        <Dialog open={openSubmission} onClose={handleSubmissionClose} maxWidth="md" fullWidth
          PaperProps={{ style: { background: "#0d1117", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" } }}>
          <DialogContent style={{ padding: 0 }}>
            <SalarySubmissionForm onClose={handleSubmissionClose} />
          </DialogContent>
        </Dialog>

        <VoteModal open={openVote} onClose={() => setOpenVote(false)} salary={selectedSalary} />
      </div>
    </>
  );
}

export default SalaryTable;