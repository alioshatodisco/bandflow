import { useState, useEffect } from "react";

const WARNSTUFEN = [
  {
    stunden: 2,
    farbe: "#f59e0b",
    emoji: "🌤️",
    titel: "Kurze Pause?",
    text: "Du arbeitest jetzt schon eine Weile. Ein kurzer Spaziergang oder ein Glas Wasser kann Wunder wirken.",
  },
  {
    stunden: 4,
    farbe: "#ef4444",
    emoji: "⚠️",
    titel: "Dein Kopf braucht Luft",
    text: "Du hast heute schon viel gegeben. Deine kreativsten Ideen kommen oft nach einer echten Pause – nicht davor.",
  },
  {
    stunden: 6,
    farbe: "#ff3366",
    emoji: "🛑",
    titel: "Ernsthaft – leg das hin.",
    text: "Du hast heute mehr als genug gemacht. Schlaf und Erholung sind kein Luxus – sie sind dein wichtigstes Instrument.",
  },
];

export default function AntiBurnout({ arbeitsstunden, onReset }) {
  const [warnung, setWarnung] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!arbeitsstunden || dismissed) return;
    const aktiv = [...WARNSTUFEN].reverse().find(w => arbeitsstunden >= w.stunden);
    setWarnung(aktiv || null);
  }, [arbeitsstunden, dismissed]);

  if (!warnung || dismissed) return null;

  return (
    <div style={{
      background: "#0f0a0a",
      border: `1px solid ${warnung.farbe}40`,
      borderRadius: 8,
      padding: 20,
      marginBottom: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${warnung.farbe}, transparent)`
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <span style={{ fontSize: 24 }}>{warnung.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: warnung.farbe, fontWeight: 500, marginBottom: 6, letterSpacing: "0.05em" }}>
            {warnung.titel}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            {warnung.text}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 16, padding: 4 }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: warnung.farbe + "22",
            border: `1px solid ${warnung.farbe}40`,
            borderRadius: 4,
            padding: "6px 14px",
            color: warnung.farbe,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
        >
          Pause machen ✓
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "1px solid #1e1e2e",
            borderRadius: 4,
            padding: "6px 14px",
            color: "#475569",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
        >
          Später
        </button>
      </div>
    </div>
  );
}