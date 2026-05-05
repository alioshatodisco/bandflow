import { useState } from "react";

const API_KEY = "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";

async function claudeAnfrage(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
        model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content[0].text;
}

export default function KI({ setlists }) {
  const [aktiv, setAktiv] = useState("setlist");
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState("");

  // Smart Setlist
  const [selectedSetlist, setSelectedSetlist] = useState(0);
  const [spielzeit, setSpielzeit] = useState("45");
  const [energie, setEnergie] = useState("aufbauend");

  // Pressetext
  const [bandname, setBandname] = useState("");
  const [genre, setGenre] = useState("");
  const [adjektive, setAdjektive] = useState("");
  const [groessterGig, setGroessterGig] = useState("");

  const smartSetlist = async () => {
    if (!setlists || setlists.length === 0) return;
    setLoading(true);
    setErgebnis("");
    const songs = setlists[selectedSetlist].songs.map((s, i) => `${s} (${setlists[selectedSetlist].bpm[i]} BPM)`).join(", ");
    const prompt = `Du bist ein professioneller Tourmanager. Ich habe folgende Songs: ${songs}. 
    Erstelle eine optimale Setlist für ein ${spielzeit}-minütiges Set mit ${energie}er Energie-Kurve.
    Gib mir die Songs in der optimalen Reihenfolge mit kurzer Begründung pro Song.
    Antworte auf Deutsch, klar und strukturiert.`;
    const antwort = await claudeAnfrage(prompt);
    setErgebnis(antwort);
    setLoading(false);
  };

  const pressetext = async () => {
    if (!bandname) return;
    setLoading(true);
    setErgebnis("");
    const prompt = `Du bist ein professioneller Musikjournalist. 
    Schreibe einen überzeugenden Pressetext für folgende Band/Künstler:
    Name: ${bandname}
    Genre: ${genre}
    Stil/Adjektive: ${adjektive}
    Grösster Gig bisher: ${groessterGig}
    
    Erstelle:
    1. Einen Pressetext (150 Wörter, DE)
    2. Eine Kurzbiografie (50 Wörter, DE)
    3. Eine Instagram-Bio (150 Zeichen)
    
    Ton: professionell aber nahbar. Antworte auf Deutsch.`;
    const antwort = await claudeAnfrage(prompt);
    setErgebnis(antwort);
    setLoading(false);
  };

  return (
    <div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0", marginBottom: 20 }}>KI-Features</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["setlist", "🎵 Smart Setlist"], ["presse", "📝 Pressetext"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setAktiv(id); setErgebnis(""); }}
            style={{
              background: aktiv === id ? "#ff3366" : "transparent",
              border: `1px solid ${aktiv === id ? "#ff3366" : "#1e1e2e"}`,
              borderRadius: 4,
              padding: "8px 16px",
              color: aktiv === id ? "white" : "#64748b",
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {aktiv === "setlist" && (
        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <select
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              value={selectedSetlist}
              onChange={e => setSelectedSetlist(Number(e.target.value))}
            >
              {setlists && setlists.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
            </select>
            <input
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              placeholder="Spielzeit (Min)"
              value={spielzeit}
              onChange={e => setSpielzeit(e.target.value)}
            />
            <select
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              value={energie}
              onChange={e => setEnergie(e.target.value)}
            >
              <option value="aufbauend">Aufbauend</option>
              <option value="konstant">Konstant</option>
              <option value="wellenförmig">Wellenförmig</option>
            </select>
          </div>
          <button
            onClick={smartSetlist}
            disabled={loading}
            style={{ background: loading ? "#334155" : "#ff3366", border: "none", borderRadius: 4, padding: "10px 20px", color: "white", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "KI denkt..." : "✨ Setlist generieren"}
          </button>
        </div>
      )}

      {aktiv === "presse" && (
        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <input style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} placeholder="Bandname / Künstlername" value={bandname} onChange={e => setBandname(e.target.value)} />
            <input style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} placeholder="Genre (z.B. Indie-Pop)" value={genre} onChange={e => setGenre(e.target.value)} />
            <input style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} placeholder="3 Adjektive (z.B. energetisch, ehrlich, roh)" value={adjektive} onChange={e => setAdjektive(e.target.value)} />
            <input style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} placeholder="Grösster Gig bisher" value={groessterGig} onChange={e => setGroessterGig(e.target.value)} />
          </div>
          <button
            onClick={pressetext}
            disabled={loading}
            style={{ background: loading ? "#334155" : "#ff3366", border: "none", borderRadius: 4, padding: "10px 20px", color: "white", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "KI schreibt..." : "✨ Pressetext generieren"}
          </button>
        </div>
      )}

      {ergebnis && (
        <div style={{ background: "#111118", border: "1px solid #ff336630", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#ff3366", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>✨ KI Ergebnis</div>
          <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{ergebnis}</div>
          <button
            onClick={() => navigator.clipboard.writeText(ergebnis)}
            style={{ marginTop: 16, background: "transparent", border: "1px solid #1e1e2e", borderRadius: 4, padding: "6px 14px", color: "#475569", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            📋 Kopieren
          </button>
        </div>
      )}
    </div>
  );
}
