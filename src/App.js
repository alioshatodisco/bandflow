import { useState, useEffect } from "react";
import { supabase } from './supabase';
import Auth from './Auth';
import Mindset from './Mindset';
import AntiBurnout from './AntiBurnout';
import ZeitTracker from './ZeitTracker';
import KI from './KI.js';
import Foerdergelder from './Foerdergelder';

const TABS = [
  { id: "Dashboard", icon: "⊞" },
  { id: "Setlist", icon: "♪" },
  { id: "Proben", icon: "⏱" },
  { id: "Gigs", icon: "★" },
  { id: "Finanzen", icon: "€" },
  { id: "Zeit", icon: "◷" },
  { id: "Fördergelder", icon: "💰" },
  { id: "KI", icon: "✦" },
];

const DEFAULT_MITGLIEDER = ["Member 1", "Member 2", "Member 3", "Member 4"];

const statusColor = {
  geplant: "#0052cc",
  abgeschlossen: "#00875a",
  bestätigt: "#00875a",
  angefragt: "#ff8b00",
};

const statusBg = {
  geplant: "#deebff",
  abgeschlossen: "#e3fcef",
  bestätigt: "#e3fcef",
  angefragt: "#fffae6",
};

export default function BandFlow() {
  const [active, setActive] = useState("Dashboard");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBurnout, setShowBurnout] = useState(false);

  // Data
  const [setlists, setSetlists] = useState([
    { id: 1, name: "Club Set – 45min", songs: ["Intro Jam", "Neon Lights", "Break Free", "Rise Up", "Finale"], bpm: [92, 128, 110, 96, 140] },
    { id: 2, name: "Festival Set – 20min", songs: ["Rise Up", "Neon Lights", "Finale"], bpm: [96, 128, 140] },
  ]);
  const [gigs, setGigs] = useState([]);
  const [proben, setProben] = useState([]);
  const [finanzen, setFinanzen] = useState([]);
  const [mitglieder, setMitglieder] = useState(DEFAULT_MITGLIEDER);

  // Forms
  const [selectedSetlist, setSelectedSetlist] = useState(0);
  const [newSong, setNewSong] = useState("");
  const [newGig, setNewGig] = useState({ name: "", date: "", fee: "", status: "angefragt", location: "", notiz: "" });
  const [showGigForm, setShowGigForm] = useState(false);
  const [newProbe, setNewProbe] = useState({ date: "", time: "19:00", location: "", themen: "" });
  const [showProbeForm, setShowProbeForm] = useState(false);
  const [newTx, setNewTx] = useState({ typ: "einnahme", beschreibung: "", betrag: "", kategorie: "Gage" });
  const [showTxForm, setShowTxForm] = useState(false);
  const [showMitgliederEdit, setShowMitgliederEdit] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    const [gigsRes, finanzenRes, probenRes] = await Promise.all([
      supabase.from('gigs').select('*').eq('user_id', session.user.id).order('date', { ascending: true }),
      supabase.from('finanzen').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
      supabase.from('proben').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
    ]);
    if (gigsRes.data) setGigs(gigsRes.data);
    if (finanzenRes.data) setFinanzen(finanzenRes.data);
    if (probenRes.data) setProben(probenRes.data);
    setLoading(false);
  };

  // Computed
  const totalEinnahmen = finanzen.filter(f => f.typ === "einnahme").reduce((s, f) => s + Number(f.betrag), 0);
  const totalAusgaben = finanzen.filter(f => f.typ === "ausgabe").reduce((s, f) => s + Number(f.betrag), 0);
  const balance = totalEinnahmen - totalAusgaben;
  const nextGig = gigs.filter(g => g.status !== "abgeschlossen" && new Date(g.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const nextProbe = proben.filter(p => p.status === "geplant" && new Date(p.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // Actions
  const addSong = () => {
    if (!newSong.trim()) return;
    const updated = [...setlists];
    updated[selectedSetlist] = {
      ...updated[selectedSetlist],
      songs: [...updated[selectedSetlist].songs, newSong.trim()],
      bpm: [...updated[selectedSetlist].bpm, 120]
    };
    setSetlists(updated);
    setNewSong("");
  };

  const removeSong = (idx) => {
    const updated = [...setlists];
    updated[selectedSetlist] = {
      ...updated[selectedSetlist],
      songs: updated[selectedSetlist].songs.filter((_, i) => i !== idx),
      bpm: updated[selectedSetlist].bpm.filter((_, i) => i !== idx)
    };
    setSetlists(updated);
  };

  const addGig = async () => {
    if (!newGig.name || !newGig.date) return;
    const { data: inserted, error } = await supabase.from('gigs').insert([{ ...newGig, fee: Number(newGig.fee), user_id: session.user.id }]).select();
    if (error) return console.error(error);
    if (inserted) setGigs(prev => [...prev, ...inserted].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewGig({ name: "", date: "", fee: "", status: "angefragt", location: "", notiz: "" });
    setShowGigForm(false);
  };

  const deleteGig = async (id) => {
    await supabase.from('gigs').delete().eq('id', id);
    setGigs(prev => prev.filter(g => g.id !== id));
  };

  const addProbe = async () => {
    if (!newProbe.date) return;
    const { data: inserted, error } = await supabase.from('proben').insert([{ ...newProbe, status: "geplant", user_id: session.user.id }]).select();
    if (error) return console.error(error);
    if (inserted) setProben(prev => [...inserted, ...prev]);
    setNewProbe({ date: "", time: "19:00", location: "", themen: "" });
    setShowProbeForm(false);
  };

  const addTx = async () => {
    if (!newTx.beschreibung || !newTx.betrag) return;
    const tx = { ...newTx, betrag: Number(newTx.betrag), date: new Date().toISOString().split("T")[0], user_id: session.user.id };
    const { data: inserted, error } = await supabase.from('finanzen').insert([tx]).select();
    if (error) return console.error(error);
    if (inserted) setFinanzen(prev => [...inserted, ...prev]);
    setNewTx({ typ: "einnahme", beschreibung: "", betrag: "", kategorie: "Gage" });
    setShowTxForm(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!session) return <Auth />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", color: "#0052cc", fontSize: 16 }}>
      BandFlow lädt...
    </div>
  );

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
    boxSizing: "border-box",
    transition: "border-color 0.15s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#172b4d", display: "flex" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f4f5f7; }
        ::-webkit-scrollbar-thumb { background: #c1c7d0; border-radius: 3px; }
        .nav-btn { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; cursor: pointer; color: #b3bac5; font-size: 14px; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
        .nav-btn:hover { background: rgba(255,255,255,0.08); color: #f4f5f7; }
        .nav-btn.active { background: #deebff; color: #0052cc; font-weight: 500; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(9,30,66,0.12); border: 1px solid #ebecf0; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
        .btn-primary { background: #0052cc; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #0065ff; }
        .btn-ghost { background: white; color: #42526e; border: 1px solid #dfe1e6; border-radius: 4px; padding: 8px 16px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all 0.15s; }
        .btn-ghost:hover { background: #f4f5f7; border-color: #c1c7d0; }
        .btn-danger { background: white; color: #de350b; border: 1px solid #ffbdad; border-radius: 4px; padding: 4px 10px; font-family: inherit; font-size: 12px; cursor: pointer; }
        .row-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: white; border-radius: 6px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(9,30,66,0.08); border: 1px solid #ebecf0; transition: box-shadow 0.15s; }
        .row-item:hover { box-shadow: 0 3px 8px rgba(9,30,66,0.12); }
        .section-title { font-size: 20px; font-weight: 600; color: #172b4d; margin-bottom: 20px; }
        .label { font-size: 12px; font-weight: 600; color: #6b778c; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        input:focus, select:focus { border-color: #0052cc !important; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#253858", minHeight: "100vh", padding: "20px 12px", flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "8px 12px", marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>BandFlow</div>
          <div style={{ fontSize: 11, color: "#506176", marginTop: 2 }}>Band OS</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "#506176", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px", marginBottom: 8 }}>Navigation</div>

        <div style={{ flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn${active === t.id ? " active" : ""}`} onClick={() => setActive(t.id)}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{t.icon}</span>
              <span>{t.id}</span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #344563", paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#506176", padding: "0 12px", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.user.email}
          </div>
          <button className="nav-btn" onClick={() => setShowBurnout(!showBurnout)} title="Anti-Burnout">
            <span>🛡️</span> <span>Anti-Burnout</span>
          </button>
          <button className="nav-btn" onClick={handleLogout}>
            <span>↪</span> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* DASHBOARD */}
        {active === "Dashboard" && (
          <div>
            <div className="section-title">Dashboard</div>
            <Mindset />
            {showBurnout && <AntiBurnout arbeitsstunden={3} />}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <div className="card">
                <div className="label">Balance</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: balance >= 0 ? "#00875a" : "#de350b", marginTop: 4 }}>
                  {balance >= 0 ? "+" : ""}{balance.toLocaleString("de-CH")} CHF
                </div>
                <div style={{ fontSize: 12, color: "#6b778c", marginTop: 4 }}>Einnahmen – Ausgaben</div>
              </div>
              <div className="card" style={{ cursor: "pointer" }} onClick={() => setActive("Gigs")}>
                <div className="label">Nächster Gig</div>
                {nextGig ? <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{nextGig.name}</div>
                  <div style={{ fontSize: 13, color: "#0052cc", marginTop: 4 }}>{new Date(nextGig.date).toLocaleDateString("de-CH", { day: "2-digit", month: "long" })} · {nextGig.fee} CHF</div>
                </> : <div style={{ color: "#6b778c", fontSize: 14, marginTop: 4 }}>Kein Gig geplant</div>}
              </div>
              <div className="card" style={{ cursor: "pointer" }} onClick={() => setActive("Proben")}>
                <div className="label">Nächste Probe</div>
                {nextProbe ? <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{new Date(nextProbe.date).toLocaleDateString("de-CH", { day: "2-digit", month: "long" })}</div>
                  <div style={{ fontSize: 13, color: "#6b778c", marginTop: 4 }}>{nextProbe.time} Uhr · {nextProbe.location}</div>
                </> : <div style={{ color: "#6b778c", fontSize: 14, marginTop: 4 }}>Keine Probe geplant</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div className="label" style={{ marginBottom: 16 }}>Gig Pipeline</div>
                {gigs.length === 0 ? <div style={{ color: "#6b778c", fontSize: 14 }}>Noch keine Gigs eingetragen</div> :
                  gigs.slice(0, 5).map(g => (
                    <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ebecf0" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{g.name}</div>
                        <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>{new Date(g.date).toLocaleDateString("de-CH")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{g.fee} CHF</span>
                        <span className="badge" style={{ background: statusBg[g.status] || "#f4f5f7", color: statusColor[g.status] || "#6b778c" }}>{g.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="card">
                <div className="label" style={{ marginBottom: 16 }}>Letzte Transaktionen</div>
                {finanzen.length === 0 ? <div style={{ color: "#6b778c", fontSize: 14 }}>Noch keine Transaktionen</div> :
                  finanzen.slice(0, 5).map(f => (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #ebecf0" }}>
                      <span style={{ fontSize: 14 }}>{f.beschreibung}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: f.typ === "einnahme" ? "#00875a" : "#de350b" }}>
                        {f.typ === "einnahme" ? "+" : "-"}{f.betrag} CHF
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* SETLIST */}
        {active === "Setlist" && (
          <div>
            <div className="section-title">Setlist Manager</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {setlists.map((s, i) => (
                <button key={s.id} className={selectedSetlist === i ? "btn-primary" : "btn-ghost"} onClick={() => setSelectedSetlist(i)}>{s.name}</button>
              ))}
            </div>
            <div className="card">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{setlists[selectedSetlist].name}</div>
                <div style={{ fontSize: 13, color: "#6b778c", marginTop: 2 }}>{setlists[selectedSetlist].songs.length} Songs · ca. {Math.round(setlists[selectedSetlist].songs.length * 3.5)} Min</div>
              </div>
              {setlists[selectedSetlist].songs.map((song, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#f4f5f7", borderRadius: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6b778c", width: 24, flexShrink: 0 }}>{String(idx + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{song}</span>
                  <span style={{ fontSize: 12, color: "#0052cc", fontWeight: 500, flexShrink: 0 }}>{setlists[selectedSetlist].bpm[idx]} BPM</span>
                  <button className="btn-ghost" style={{ padding: "3px 8px", fontSize: 12, flexShrink: 0 }} onClick={() => removeSong(idx)}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <input style={inputStyle} placeholder="Song hinzufügen..." value={newSong} onChange={e => setNewSong(e.target.value)} onKeyDown={e => e.key === "Enter" && addSong()} />
                <button className="btn-primary" style={{ flexShrink: 0 }} onClick={addSong}>+ Add</button>
              </div>
            </div>
          </div>
        )}

        {/* PROBEN */}
        {active === "Proben" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Probe-Planer</div>
              <button className="btn-primary" onClick={() => setShowProbeForm(!showProbeForm)}>+ Neue Probe</button>
            </div>
            {showProbeForm && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div><div className="label">Datum</div><input style={inputStyle} type="date" value={newProbe.date} onChange={e => setNewProbe({ ...newProbe, date: e.target.value })} /></div>
                  <div><div className="label">Uhrzeit</div><input style={inputStyle} type="time" value={newProbe.time} onChange={e => setNewProbe({ ...newProbe, time: e.target.value })} /></div>
                  <div><div className="label">Location</div><input style={inputStyle} placeholder="Proberaum..." value={newProbe.location} onChange={e => setNewProbe({ ...newProbe, location: e.target.value })} /></div>
                  <div><div className="label">Themen</div><input style={inputStyle} placeholder="Kommagetrennt..." value={newProbe.themen} onChange={e => setNewProbe({ ...newProbe, themen: e.target.value })} /></div>
                </div>
                <button className="btn-primary" onClick={addProbe}>Speichern</button>
              </div>
            )}
            {proben.length === 0 && <div className="card" style={{ color: "#6b778c" }}>Noch keine Proben geplant.</div>}
            {proben.map(p => (
              <div key={p.id} className="row-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{new Date(p.date).toLocaleDateString("de-CH", { weekday: "long", day: "2-digit", month: "long" })}</span>
                    <span style={{ fontSize: 13, color: "#6b778c", marginLeft: 10 }}>{p.time} Uhr · {p.location}</span>
                  </div>
                  <span className="badge" style={{ background: statusBg[p.status] || "#f4f5f7", color: statusColor[p.status] || "#6b778c" }}>{p.status}</span>
                </div>
                {p.themen && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(typeof p.themen === "string" ? p.themen.split(",") : p.themen).map((t, i) => (
                      <span key={i} style={{ fontSize: 12, background: "#ebecf0", color: "#42526e", padding: "2px 8px", borderRadius: 3 }}>{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GIGS */}
        {active === "Gigs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Gig-Tracker</div>
              <button className="btn-primary" onClick={() => setShowGigForm(!showGigForm)}>+ Neuer Gig</button>
            </div>
            {showGigForm && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div><div className="label">Venue / Event</div><input style={inputStyle} placeholder="Club Volt..." value={newGig.name} onChange={e => setNewGig({ ...newGig, name: e.target.value })} /></div>
                  <div><div className="label">Datum</div><input style={inputStyle} type="date" value={newGig.date} onChange={e => setNewGig({ ...newGig, date: e.target.value })} /></div>
                  <div><div className="label">Gage (CHF/CHF)</div><input style={inputStyle} type="number" placeholder="500" value={newGig.fee} onChange={e => setNewGig({ ...newGig, fee: e.target.value })} /></div>
                  <div><div className="label">Status</div>
                    <select style={inputStyle} value={newGig.status} onChange={e => setNewGig({ ...newGig, status: e.target.value })}>
                      <option value="angefragt">Angefragt</option>
                      <option value="bestätigt">Bestätigt</option>
                      <option value="abgeschlossen">Abgeschlossen</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}><div className="label">Notiz (optional)</div><input style={inputStyle} placeholder="Rider, Kontaktperson..." value={newGig.notiz} onChange={e => setNewGig({ ...newGig, notiz: e.target.value })} /></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={addGig}>Speichern</button>
                  <button className="btn-ghost" onClick={() => setShowGigForm(false)}>Abbrechen</button>
                </div>
              </div>
            )}
            {gigs.length === 0 && <div className="card" style={{ color: "#6b778c" }}>Noch keine Gigs eingetragen.</div>}
            {gigs.map(g => (
              <div key={g.id} className="row-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>
                    {new Date(g.date).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" })}
                    {g.notiz && <span style={{ marginLeft: 8 }}>· {g.notiz}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{g.fee} CHF</span>
                  <span className="badge" style={{ background: statusBg[g.status] || "#f4f5f7", color: statusColor[g.status] || "#6b778c" }}>{g.status}</span>
                  <button className="btn-danger" onClick={() => deleteGig(g.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FINANZEN */}
        {active === "Finanzen" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Finanzen</div>
              <button className="btn-primary" onClick={() => setShowTxForm(!showTxForm)}>+ Eintrag</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                ["Einnahmen", totalEinnahmen, "#00875a"],
                ["Ausgaben", totalAusgaben, "#de350b"],
                ["Balance", balance, balance >= 0 ? "#00875a" : "#de350b"]
              ].map(([label, val, col]) => (
                <div key={label} className="card">
                  <div className="label">{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: col, marginTop: 4 }}>
                    {val >= 0 && label === "Balance" ? "+" : ""}{val.toLocaleString("de-CH")} CHF
                  </div>
                </div>
              ))}
            </div>
            {showTxForm && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div className="label">Typ</div>
                    <select style={inputStyle} value={newTx.typ} onChange={e => setNewTx({ ...newTx, typ: e.target.value })}>
                      <option value="einnahme">Einnahme</option>
                      <option value="ausgabe">Ausgabe</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">Beschreibung</div>
                    <input style={inputStyle} placeholder="Gage Konzert..." value={newTx.beschreibung} onChange={e => setNewTx({ ...newTx, beschreibung: e.target.value })} />
                  </div>
                  <div>
                    <div className="label">Betrag (CHF/CHF)</div>
                    <input style={inputStyle} type="number" placeholder="500" value={newTx.betrag} onChange={e => setNewTx({ ...newTx, betrag: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={addTx}>Speichern</button>
                  <button className="btn-ghost" onClick={() => setShowTxForm(false)}>Abbrechen</button>
                </div>
              </div>
            )}
            <div className="card">
              {finanzen.length === 0 ? <div style={{ color: "#6b778c" }}>Noch keine Transaktionen.</div> :
                finanzen.map(f => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ebecf0" }}>
                    <div>
                      <div style={{ fontSize: 14 }}>{f.beschreibung}</div>
                      <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>{new Date(f.date).toLocaleDateString("de-CH")}</div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: f.typ === "einnahme" ? "#00875a" : "#de350b" }}>
                      {f.typ === "einnahme" ? "+" : "-"}{f.betrag} CHF
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {active === "Zeit" && (
          <div>
            {/* Bandmitglieder editieren */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowMitgliederEdit(!showMitgliederEdit)}>
                ⚙ Bandmitglieder bearbeiten
              </button>
            </div>
            {showMitgliederEdit && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="label" style={{ marginBottom: 12 }}>Bandmitglieder</div>
                {mitglieder.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      style={inputStyle}
                      value={m}
                      onChange={e => {
                        const updated = [...mitglieder];
                        updated[i] = e.target.value;
                        setMitglieder(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <ZeitTracker mitglieder={mitglieder} />
          </div>
        )}

        {active === "Fördergelder" && <Foerdergelder />}
        {active === "KI" && <KI setlists={setlists} />}

      </div>
    </div>
  );
}