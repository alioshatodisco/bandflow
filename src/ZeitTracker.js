import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const KATEGORIEN = ["Probe", "Recording", "Songwriting", "Marketing", "Fahrt", "Admin", "Anderes"];

const MITGLIEDER = ["Aliosha", "Member 2", "Member 3", "Member 4"];

export default function ZeitTracker() {
  const [eintraege, setEintraege] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timerLaeuft, setTimerLaeuft] = useState(false);
  const [timerSekunden, setTimerSekunden] = useState(0);
  const [neuerEintrag, setNeuerEintrag] = useState({
    mitglied: MITGLIEDER[0],
    kategorie: KATEGORIEN[0],
    stunden: "",
    datum: new Date().toISOString().split("T")[0],
    notiz: ""
  });

  useEffect(() => {
    loadEintraege();
  }, []);

  useEffect(() => {
    let interval;
    if (timerLaeuft) {
      interval = setInterval(() => setTimerSekunden(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerLaeuft]);

  const loadEintraege = async () => {
    const { data } = await supabase.from('zeittracker').select('*');
    if (data) setEintraege(data);
  };

  const formatTimer = (sek) => {
    const h = Math.floor(sek / 3600);
    const m = Math.floor((sek % 3600) / 60);
    const s = sek % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timerStoppen = () => {
    setTimerLaeuft(false);
    const stunden = (timerSekunden / 3600).toFixed(2);
    setNeuerEintrag(prev => ({ ...prev, stunden }));
    setShowForm(true);
    setTimerSekunden(0);
  };

  const eintragSpeichern = async () => {
    if (!neuerEintrag.stunden) return;
    const { data: inserted } = await supabase.from('zeittracker').insert([neuerEintrag]).select();
    if (inserted) setEintraege([...eintraege, ...inserted]);
    setNeuerEintrag({ mitglied: MITGLIEDER[0], kategorie: KATEGORIEN[0], stunden: "", datum: new Date().toISOString().split("T")[0], notiz: "" });
    setShowForm(false);
  };

  const stundenProMitglied = MITGLIEDER.map(m => ({
    name: m,
    stunden: eintraege.filter(e => e.mitglied === m).reduce((s, e) => s + Number(e.stunden), 0)
  }));

  const maxStunden = Math.max(...stundenProMitglied.map(m => m.stunden), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0" }}>Zeit-Tracker</div>
        <div style={{ display: "flex", gap: 8 }}>
          {!timerLaeuft ? (
            <button
              onClick={() => setTimerLaeuft(true)}
              style={{ background: "#22c55e22", border: "1px solid #22c55e40", borderRadius: 4, padding: "8px 16px", color: "#22c55e", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              ▶ Timer Start
            </button>
          ) : (
            <button
              onClick={timerStoppen}
              style={{ background: "#ef444422", border: "1px solid #ef444440", borderRadius: 4, padding: "8px 16px", color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              ⏹ {formatTimer(timerSekunden)}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: "#ff3366", border: "none", borderRadius: 4, padding: "8px 16px", color: "white", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            + Manuell
          </button>
        </div>
      </div>

      {timerLaeuft && (
        <div style={{ background: "#0f1a0f", border: "1px solid #22c55e30", borderRadius: 8, padding: 16, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, color: "#22c55e", letterSpacing: "0.1em" }}>{formatTimer(timerSekunden)}</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase" }}>Timer läuft...</div>
        </div>
      )}

      {showForm && (
        <div style={{ background: "#111118", border: "1px solid #ff336640", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <select
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              value={neuerEintrag.mitglied}
              onChange={e => setNeuerEintrag({ ...neuerEintrag, mitglied: e.target.value })}
            >
              {MITGLIEDER.map(m => <option key={m}>{m}</option>)}
            </select>
            <select
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              value={neuerEintrag.kategorie}
              onChange={e => setNeuerEintrag({ ...neuerEintrag, kategorie: e.target.value })}
            >
              {KATEGORIEN.map(k => <option key={k}>{k}</option>)}
            </select>
            <input
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              type="number"
              placeholder="Stunden (z.B. 1.5)"
              value={neuerEintrag.stunden}
              onChange={e => setNeuerEintrag({ ...neuerEintrag, stunden: e.target.value })}
            />
            <input
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }}
              type="date"
              value={neuerEintrag.datum}
              onChange={e => setNeuerEintrag({ ...neuerEintrag, datum: e.target.value })}
            />
            <input
              style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "8px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", gridColumn: "span 2" }}
              placeholder="Notiz (optional)"
              value={neuerEintrag.notiz}
              onChange={e => setNeuerEintrag({ ...neuerEintrag, notiz: e.target.value })}
            />
          </div>
          <button onClick={eintragSpeichern} style={{ background: "#ff3366", border: "none", borderRadius: 4, padding: "8px 16px", color: "white", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Speichern
          </button>
        </div>
      )}

      {/* Übersicht pro Mitglied */}
      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Stunden pro Mitglied</div>
        {stundenProMitglied.map(m => (
          <div key={m.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#e2e8f0" }}>{m.name}</span>
              <span style={{ fontSize: 12, color: "#ff3366" }}>{m.stunden.toFixed(1)}h</span>
            </div>
            <div style={{ background: "#1e1e2e", borderRadius: 2, height: 4 }}>
              <div style={{ background: "#ff3366", borderRadius: 2, height: 4, width: `${(m.stunden / maxStunden) * 100}%`, transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Letzte Einträge */}
      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Letzte Einträge</div>
        {eintraege.length === 0 ? (
          <div style={{ color: "#334155", fontSize: 12 }}>Noch keine Einträge – starte den Timer oder füge manuell hinzu!</div>
        ) : eintraege.slice(-5).reverse().map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e1e2e" }}>
            <div>
              <span style={{ fontSize: 12, color: "#e2e8f0" }}>{e.mitglied}</span>
              <span style={{ fontSize: 10, color: "#475569", marginLeft: 8 }}>{e.kategorie}</span>
              {e.notiz && <span style={{ fontSize: 10, color: "#334155", marginLeft: 8 }}>· {e.notiz}</span>}
            </div>
            <span style={{ fontSize: 12, color: "#ff3366" }}>{Number(e.stunden).toFixed(1)}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}