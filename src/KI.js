import { useState } from "react";

const API_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

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
  const [copied, setCopied] = useState(false);

  const [selectedSetlist, setSelectedSetlist] = useState(0);
  const [spielzeit, setSpielzeit] = useState("45");
  const [energie, setEnergie] = useState("aufbauend");

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

  const handleCopy = () => {
    navigator.clipboard.writeText(ergebnis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    background: "white",
    border: "2px solid #dfe1e6",
    borderRadius: 4,
    padding: "8px 12px",
    color: "#172b4d",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 600, color: "#172b4d", marginBottom: 20 }}>KI-Features</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid #ebecf0", paddingBottom: 0 }}>
        {[["setlist", "🎵 Smart Setlist"], ["presse", "📝 Pressetext Generator"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setAktiv(id); setErgebnis(""); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: aktiv === id ? "2px solid #0052cc" : "2px solid transparent",
              padding: "8px 16px",
              color: aktiv === id ? "#0052cc" : "#6b778c",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: aktiv === id ? 600 : 400,
              cursor: "pointer",
              marginBottom: -2,
              transition: "all 0.15s"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Smart Setlist */}
      {aktiv === "setlist" && (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
          <div style={{ fontSize: 14, color: "#42526e", marginBottom: 20 }}>
            Wähle eine Setlist und sage der KI wie dein Set aussehen soll – sie optimiert die Reihenfolge für maximale Wirkung.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Setlist</label>
              <select style={inputStyle} value={selectedSetlist} onChange={e => setSelectedSetlist(Number(e.target.value))}>
                {setlists && setlists.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Spielzeit (Min)</label>
              <input style={inputStyle} placeholder="45" value={spielzeit} onChange={e => setSpielzeit(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Energie-Kurve</label>
              <select style={inputStyle} value={energie} onChange={e => setEnergie(e.target.value)}>
                <option value="aufbauend">Aufbauend</option>
                <option value="konstant">Konstant</option>
                <option value="wellenförmig">Wellenförmig</option>
              </select>
            </div>
          </div>
          <button onClick={smartSetlist} disabled={loading} style={{ background: loading ? "#c1c7d0" : "#0052cc", border: "none", borderRadius: 4, padding: "10px 20px", color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "KI denkt nach..." : "✨ Setlist optimieren"}
          </button>
        </div>
      )}

      {/* Pressetext */}
      {aktiv === "presse" && (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
          <div style={{ fontSize: 14, color: "#42526e", marginBottom: 20 }}>
            Füll die Details aus – die KI schreibt Pressetext, Bio und Instagram-Caption für dich.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["Bandname / Künstlername", bandname, setBandname],
              ["Genre (z.B. Indie-Pop, Jazz)", genre, setGenre],
              ["3 Adjektive (z.B. energetisch, ehrlich, roh)", adjektive, setAdjektive],
              ["Grösster Gig bisher", groessterGig, setGroessterGig]
            ].map(([placeholder, val, setter]) => (
              <div key={placeholder}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{placeholder}</label>
                <input style={inputStyle} placeholder={placeholder} value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}
          </div>
          <button onClick={pressetext} disabled={loading} style={{ background: loading ? "#c1c7d0" : "#0052cc", border: "none", borderRadius: 4, padding: "10px 20px", color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "KI schreibt..." : "✨ Pressetext generieren"}
          </button>
        </div>
      )}

      {/* Ergebnis */}
      {ergebnis && (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 24, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em" }}>✨ KI Ergebnis</div>
            <button
              onClick={handleCopy}
              style={{ background: copied ? "#e3fcef" : "#f4f5f7", border: "1px solid #dfe1e6", borderRadius: 4, padding: "6px 14px", color: copied ? "#00875a" : "#42526e", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}
            >
              {copied ? "✓ Kopiert!" : "📋 Kopieren"}
            </button>
          </div>
          <div style={{ fontSize: 14, color: "#172b4d", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "#f4f5f7", padding: 16, borderRadius: 6 }}>{ergebnis}</div>
        </div>
      )}
    </div>
  );
}