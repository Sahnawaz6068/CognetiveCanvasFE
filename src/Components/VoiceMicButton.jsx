/**
 * VoiceMicButton.jsx
 *
 * A floating mic button that:
 * 1. Records voice via Web Speech API (useVoiceCommand hook)
 * 2. Sends transcript to Claude AI (interpretVoiceCommand)
 * 3. Calls onCommand(command) with the structured result
 * 4. Shows a toast-style status overlay with the transcript + action
 *
 * Props:
 *   onCommand({ module, action, payload }) - called when AI returns a command
 */

import { useState, useCallback } from "react";
import { useVoiceCommand } from "../hooks/useVoiceCommand";
import { interpretVoiceCommand } from "../utils/voiceToCommand";

export function VoiceMicButton({ onCommand }) {
  // status: idle | listening | processing | success | error
  const [status, setStatus] = useState("idle");
  const [toastLines, setToastLines] = useState([]);

  const showToast = (lines, duration = 3500) => {
    setToastLines(lines);
    setTimeout(() => setToastLines([]), duration);
  };

  const handleResult = useCallback(
    async (transcript) => {
      setStatus("processing");
      setToastLines([`🎙 "${transcript}"`, "Thinking..."]);

      try {
        const command = await interpretVoiceCommand(transcript);

        if (command.action === "unknown") {
          setStatus("error");
          showToast([`❓ Didn't understand:`, `"${transcript}"`]);
        } else {
          setStatus("success");
          const actionLabel = command.action.replace(/_/g, " ");
          showToast([`✓ ${actionLabel}`, transcript], 2500);
          onCommand?.(command);
        }
      } catch {
        setStatus("error");
        showToast(["⚠ AI error — check API key"]);
      }

      setTimeout(() => setStatus("idle"), 2800);
    },
    [onCommand]
  );

  const handleError = useCallback((err) => {
    setStatus("error");
    showToast([`⚠ ${err}`]);
    setTimeout(() => setStatus("idle"), 3000);
  }, []);

  const { isListening, isSupported, startListening, stopListening } =
    useVoiceCommand({ onResult: handleResult, onError: handleError });

  const handleClick = () => {
    if (!isSupported) return;
    if (isListening) {
      stopListening();
      setStatus("idle");
      setToastLines([]);
    } else {
      setStatus("listening");
      setToastLines(["Listening..."]);
      startListening();
    }
  };

  // ── Colors per status ──────────────────────────────────────────────────────
  const colors = {
    idle:       { bg: "#1a1a1a", border: "#333",    ring: "transparent" },
    listening:  { bg: "#4f46e5", border: "#6366f1", ring: "rgba(99,102,241,0.4)" },
    processing: { bg: "#0f172a", border: "#334155", ring: "transparent" },
    success:    { bg: "#064e3b", border: "#10b981", ring: "rgba(16,185,129,0.3)" },
    error:      { bg: "#450a0a", border: "#ef4444", ring: "transparent" },
  };
  const col = colors[status] || colors.idle;

  return (
    <div style={{
      position: "fixed",
      bottom: 100,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    }}>

      {/* Toast feedback bubble */}
      {toastLines.length > 0 && (
        <div style={{
          background: "#0f172a",
          border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: 10,
          padding: "10px 14px",
          maxWidth: 240,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          animation: "voiceFadeIn 0.15s ease-out",
        }}>
          {toastLines.map((line, i) => (
            <div key={i} style={{
              fontSize: i === 0 ? 11 : 10,
              color: i === 0 ? "#e0e7ff" : "#64748b",
              lineHeight: 1.5,
              fontStyle: i === 1 ? "italic" : "normal",
            }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Mic button */}
      <button
        onClick={handleClick}
        disabled={!isSupported || status === "processing"}
        title={
          !isSupported
            ? "Not supported in this browser"
            : isListening
            ? "Click to stop listening"
            : "Click to speak a voice command"
        }
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `2px solid ${col.border}`,
          background: col.bg,
          cursor: isSupported && status !== "processing" ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "all 0.2s ease",
          boxShadow: col.ring !== "transparent"
            ? `0 0 0 6px ${col.ring}, 0 4px 20px rgba(0,0,0,0.5)`
            : "0 4px 20px rgba(0,0,0,0.5)",
          opacity: status === "processing" ? 0.7 : 1,
        }}
      >
        {/* Pulse ring when listening */}
        {isListening && (
          <>
            <span style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px solid rgba(99,102,241,0.5)",
              animation: "voicePulse 1.2s ease-out infinite",
              pointerEvents: "none",
            }} />
            <span style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "1.5px solid rgba(99,102,241,0.25)",
              animation: "voicePulse 1.2s ease-out infinite 0.3s",
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Icon */}
        {status === "processing" ? (
          <ProcessingIcon />
        ) : status === "success" ? (
          <CheckIcon />
        ) : status === "error" ? (
          <ErrorIcon />
        ) : (
          <MicIcon active={isListening} />
        )}
      </button>

      {/* Label */}
      <div style={{
        fontSize: 9,
        color: status === "listening" ? "#818cf8" : "#475569",
        letterSpacing: "0.06em",
        textAlign: "center",
        textTransform: "uppercase",
        transition: "color 0.2s",
      }}>
        {!isSupported
          ? "Not supported"
          : isListening
          ? "Listening..."
          : status === "processing"
          ? "Processing..."
          : status === "success"
          ? "Done!"
          : status === "error"
          ? "Try again"
          : "Voice"}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes voicePulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes voiceFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes voiceSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MicIcon({ active }) {
  const c = active ? "#a5b4fc" : "#94a3b8";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill={c} />
      <path
        d="M5 11a7 7 0 0 0 14 0"
        stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"
      />
      <line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="22" x2="16" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProcessingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      style={{ animation: "voiceSpin 1s linear infinite" }}>
      <circle
        cx="12" cy="12" r="9"
        stroke="#6366f1" strokeWidth="2.5"
        strokeDasharray="28 8" strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polyline
        points="5,12 10,17 19,8"
        stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <line x1="7" y1="7" x2="17" y2="17" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="7" x2="7" y2="17" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}