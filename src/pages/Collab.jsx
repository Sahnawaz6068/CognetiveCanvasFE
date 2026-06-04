import React, { useMemo } from "react";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import "tldraw/tldraw.css";

export default function Collab() {
  const roomId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    let room = params.get("room");
    if (!room) {
      room = crypto.randomUUID();
      window.history.replaceState({}, "", `${window.location.pathname}?room=${room}`);
    }
    return room;
  }, []);

  const store = useSyncDemo({ roomId });

  const joinLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* Share bar */}
      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 1000,
        display: "flex", alignItems: "center", gap: 8,
        background: "#fff", border: "1px solid #ddd",
        borderRadius: 10, padding: "8px 12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        fontFamily: "system-ui, sans-serif",
      }}>
        <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Invite:</span>
        <input
          readOnly
          value={joinLink}
          onClick={e => e.target.select()}
          style={{
            fontSize: 12, border: "1px solid #eee", borderRadius: 6,
            padding: "5px 10px", width: 260, color: "#333",
            background: "#f9f9f9", outline: "none",
          }}
        />
        <button
          onClick={() => navigator.clipboard.writeText(joinLink)}
          style={{
            fontSize: 13, fontWeight: 600, padding: "6px 14px",
            borderRadius: 7, border: "none", background: "#2563eb",
            color: "#fff", cursor: "pointer",
          }}
        >
          Copy
        </button>
      </div>

      <Tldraw store={store} />
    </div>
  );
}