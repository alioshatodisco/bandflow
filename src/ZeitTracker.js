import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const KATEGORIEN = ["Probe", "Recording", "Songwriting", "Marketing", "Fahrt", "Admin", "Anderes"];

export default function ZeitTracker({ mitglieder = ["Member 1", "Member 2", "Member 3", "Member 4"] }) {
  const [eintraege, setEintraege] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [timerLaeuft, setTimerLaeuft] = useState(false);
  const [timerSekunden, setTimerSekunden] = useState(0);
  const [neuerEintrag, setNeuerEintrag] = useState({
    mitglied: mitglieder[0],
    kategorie: KATEGORIEN[0],
    stunden: "",
    date: new Date().toISOString().split("T")[0],
    notiz: ""
  });

  useEffect(() => { loadEintraege(); }, []);

  useEffect(() => {
    let interval;
    if (timerLaeuft) interval = setInterval(() => setTimerSekunden(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerLaeuft]);

  const loadEintraege = async () => {
    const { data } = await supabase.from('zeittracker').select('*').order('date', { ascending: false });
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
    setNeuerEintrag(prev => ({ ...prev, stunden: (timerSekunden / 3600).toFixed(2) }));
    setShowForm(true);
    setTimerSekunden(0);
  };

  const eintragSpeichern = async () => {
    if (!neuerEintrag.stunden) return;
    const { data: inserted } = await supabase.from('zeittracker').insert([neuerEintrag]).select();
    if (inserted) setEintraege(prev => [...inserted, ...prev]);
    setNeuerEintrag({ mitglied: mitglieder[0], kategorie: KATEGORIEN[0], stunden: "", date: new Date().toISOString().split("T")[0], notiz: "" });
    setShowForm(false);
  };

  const stundenProMitglied = mitglieder.map(m => ({
    name: m,
    stunden: eintraege.filter(e => e.mitglied === m).reduce((s, e) => s + Number(e.stunden), 0)
  }));

  const maxStunden = Math.max(...stundenProMitglied.map(m => m.stunden), 1);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#172b4d" }}>Zeit-Tracker</div>
        <div style={{ display: "flex", gap: 8 }}>
          {!timerLaeuft ? (
            <button onClick={() => setTimerLaeuft(true)} style={{ background: "#e3fcef", border: "1px solid #abf5d1", borderRadius: 4, padding: "8px 16px", color: "#00875a", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              ▶ Timer starten
            </button>
          ) : (
            <button onClick={timerStoppen} style={{ background: "#ffebe6", border: "1px solid #ffbdad", borderRadius: 4, padding: "8px 16px", color: "#de350b", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              ⏹ {formatTimer(timerSekunden)}
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#0052cc", border: "none", borderRadius: 4, padding: "8px 16px", color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            + Manuell
          </button>
        </div>
      </div>

      {timerLaeuft && (
        <div style={{ background: "#e3fcef", border: "1px solid #abf5d1", borderRadius: 8, padding: 20, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#00875a", fontVariantNumeric: "tabular-nums" }}>{formatTimer(timerSekunden)}</div>
          <div style={{ fontSize: 13, color: "#006644", marginTop: 4 }}>Timer läuft – klicke Stop wenn du fertig bist</div>
        </div>
      )}

      {showForm && (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.12)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Eintrag speichern</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Mitglied</div>
              <select style={inputStyle} value={neuerEintrag.mitglied} onChange={e => setNeuerEintrag({ ...neuerEintrag, mitglied: e.target.value })}>
                {mitglieder.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Kategorie</div>
              <select style={inputStyle} value={neuerEintrag.kategorie} onChange={e => setNeuerEintrag({ ...neuerEintrag, kategorie: e.target.value })}>
                {KATEGORIEN.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Stunden</div>
              <input style={inputStyle} type="number" step="0.5" placeholder="z.B. 2.5" value={neuerEintrag.stunden} onChange={e => setNeuerEintrag({ ...neuerEintrag, stunden: e.target.value })} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Datum</div>
              <input style={inputStyle} type="date" value={neuerEintrag.date} onChange={e => setNeuerEintrag({ ...neuerEintrag, date: e.target.value })} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Notiz (optional)</div>
              <input style={inputStyle} placeholder="Was wurde gemacht?" value={neuerEintrag.notiz} onChange={e => setNeuerEintrag({ ...neuerEintrag, notiz: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={eintragSpeichern} style={{ background: "#0052cc", border: "none", borderRadius: 4, padding: "8px 16px", color: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Speichern</button>
            <button onClick={() => setShowForm(false)} style={{ background: "white", border: "1px solid #dfe1e6", borderRadius: 4, padding: "8px 16px", color: "#42526e", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Abbrechen</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Stunden pro Mitglied</div>
          {stundenProMitglied.map(m => (
            <div key={m.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: "#172b4d" }}>{m.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0052cc" }}>{m.stunden.toFixed(1)}h</span>
              </div>
              <div style={{ background: "#f4f5f7", borderRadius: 3, height: 6 }}>
                <div style={{ background: "#0052cc", borderRadius: 3, height: 6, width: `${(m.stunden / maxStunden) * 100}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Letzte Einträge</div>
          {eintraege.length === 0 ? (
            <div style={{ color: "#6b778c", fontSize: 14 }}>Noch keine Einträge – starte den Timer!</div>
          ) : eintraege.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #ebecf0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#172b4d" }}>{e.mitglied}</span>
                  <span style={{ fontSize: 11, background: "#ebecf0", color: "#42526e", padding: "2px 6px", borderRadius: 3 }}>{e.kategorie}</span>
                </div>
                {e.notiz && <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>{e.notiz}</div>}
                <div style={{ fontSize: 11, color: "#6b778c", marginTop: 2 }}>{new Date(e.date).toLocaleDateString("de-CH")}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0052cc", flexShrink: 0 }}>{Number(e.stunden).toFixed(1)}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}