import { useState, useEffect } from "react";

const WARNSTUFEN = [
  { stunden: 2, farbe: "#ff8b00", bg: "#fffae6", border: "#ffe380", emoji: "🌤️", titel: "Kurze Pause?", text: "Du arbeitest jetzt schon eine Weile. Ein kurzer Spaziergang oder ein Glas Wasser kann Wunder wirken." },
  { stunden: 4, farbe: "#de350b", bg: "#ffebe6", border: "#ffbdad", emoji: "⚠️", titel: "Dein Kopf braucht Luft", text: "Du hast heute schon viel gegeben. Deine kreativsten Ideen kommen oft nach einer echten Pause." },
  { stunden: 6, farbe: "#bf2600", bg: "#ffebe6", border: "#ff8f73", emoji: "🛑", titel: "Ernsthaft – leg das hin.", text: "Du hast heute mehr als genug gemacht. Schlaf und Erholung sind dein wichtigstes Instrument." },
];

export default function AntiBurnout({ arbeitsstunden }) {
  const [warnung, setWarnung] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!arbeitsstunden || dismissed) return;
    const aktiv = [...WARNSTUFEN].reverse().find(w => arbeitsstunden >= w.stunden);
    setWarnung(aktiv || null);
  }, [arbeitsstunden, dismissed]);

  if (!warnung || dismissed) return null;

  return (
    <div style={{ background: warnung.bg, border: `1px solid ${warnung.border}`, borderRadius: 8, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: 20 }}>{warnung.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: warnung.farbe, marginBottom: 4 }}>{warnung.titel}</div>
        <div style={{ fontSize: 13, color: "#42526e", lineHeight: 1.5 }}>{warnung.text}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => setDismissed(true)} style={{ background: warnung.farbe, border: "none", borderRadius: 4, padding: "6px 14px", color: "white", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Pause machen ✓</button>
          <button onClick={() => setDismissed(true)} style={{ background: "transparent", border: `1px solid ${warnung.border}`, borderRadius: 4, padding: "6px 14px", color: warnung.farbe, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Später</button>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "#6b778c", cursor: "pointer", fontSize: 16, padding: 4 }}>✕</button>
    </div>
  );
}