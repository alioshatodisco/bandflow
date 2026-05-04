import { useState, useEffect } from "react";
import { supabase } from './supabase';
import Auth from './Auth';

const TABS = ["Dashboard", "Setlist", "Proben", "Gigs", "Finanzen"];

const initialData = {
  setlists: [
    { id: 1, name: "Club Set – 45min", songs: ["Intro Jam", "Neon Lights", "Break Free", "Rise Up", "Finale"], bpm: [92, 128, 110, 96, 140] },
    { id: 2, name: "Festival Set – 20min", songs: ["Rise Up", "Neon Lights", "Finale"], bpm: [96, 128, 140] },
  ],
  proben: [],
  gigs: [],
  finanzen: [],
};

const statusColor = {
  geplant: "#3b82f6",
  abgeschlossen: "#22c55e",
  bestätigt: "#22c55e",
  angefragt: "#f59e0b",
};

export default function BandFlow() {
  const [active, setActive] = useState("Dashboard");
  const [data, setData] = useState(initialData);
  const [session, setSession] = useState(null);
  const [selectedSetlist, setSelectedSetlist] = useState(0);
  const [newSong, setNewSong] = useState("");
  const [newGig, setNewGig] = useState({ name: "", date: "", fee: "", status: "angefragt", setlist: "" });
  const [showGigForm, setShowGigForm] = useState(false);
  const [newProbe, setNewProbe] = useState({ date: "", time: "19:00", location: "", themen: "" });
  const [showProbeForm, setShowProbeForm] = useState(false);
  const [newTx, setNewTx] = useState({ typ: "einnahme", beschreibung: "", betrag: "" });
  const [showTxForm, setShowTxForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    const { data: gigs } = await supabase.from('gigs').select('*');
    const { data: finanzen } = await supabase.from('finanzen').select('*');
    const { data: proben } = await supabase.from('proben').select('*');
    setData(prev => ({
      ...prev,
      gigs: gigs || [],
      finanzen: finanzen || [],
      proben: proben || [],
    }));
    setLoading(false);
  };

  const totalEinnahmen = data.finanzen.filter(f => f.typ === "einnahme").reduce((s, f) => s + f.betrag, 0);
  const totalAusgaben = data.finanzen.filter(f => f.typ === "ausgabe").reduce((s, f) => s + f.betrag, 0);
  const balance = totalEinnahmen - totalAusgaben;
  const nextGig = data.gigs.filter(g => g.status !== "abgeschlossen").sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const nextProbe = data.proben.filter(p => p.status === "geplant").sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const addSong = () => {
    if (!newSong.trim()) return;
    const updated = [...data.setlists];
    updated[selectedSetlist].songs.push(newSong.trim());
    updated[selectedSetlist].bpm.push(120);
    setData({ ...data, setlists: updated });
    setNewSong("");
  };

  const removeSong = (idx) => {
    const updated = [...data.setlists];
    updated[selectedSetlist].songs.splice(idx, 1);
    updated[selectedSetlist].bpm.splice(idx, 1);
    setData({ ...data, setlists: updated });
  };

  const addGig = async () => {
    if (!newGig.name || !newGig.date) return;
    const { data: inserted } = await supabase.from('gigs').insert([{ ...newGig, fee: Number(newGig.fee) }]).select();
    if (inserted) setData({ ...data, gigs: [...data.gigs, ...inserted] });
    setNewGig({ name: "", date: "", fee: "", status: "angefragt", setlist: "" });
    setShowGigForm(false);
  };

  const addProbe = async () => {
    if (!newProbe.date) return;
    const probe = { ...newProbe, status: "geplant" };
    const { data: inserted } = await supabase.from('proben').insert([probe]).select();
    if (inserted) setData({ ...data, proben: [...data.proben, ...inserted] });
    setNewProbe({ date: "", time: "19:00", location: "", themen: "" });
    setShowProbeForm(false);
  };

  const addTx = async () => {
    if (!newTx.beschreibung || !newTx.betrag) return;
    const tx = { ...newTx, betrag: Number(newTx.betrag), date: new Date().toISOString().split("T")[0] };
    const { data: inserted } = await supabase.from('finanzen').insert([tx]).select();
    if (inserted) setData({ ...data, finanzen: [...data.finanzen, ...inserted] });
    setNewTx({ typ: "einnahme", beschreibung: "", betrag: "" });
    setShowTxForm(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!session) return <Auth />;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", color: "#ff3366", fontSize: 14, letterSpacing: "0.2em" }}>
      BANDFLOW LÄDT...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0f; } ::-webkit-scrollbar-thumb { background: #ff3366; border-radius: 2px; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 8px 16px; color: #475569; transition: all 0.2s; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #ff3366; border-bottom-color: #ff3366; }
        .tab-btn:hover { color: #e2e8f0; }
        .card { background: #111118; border: 1px solid #1e1e2e; border-radius: 8px; padding: 20px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }
        .btn { border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 16px; border-radius: 4px; transition: all 0.2s; }
        .btn-primary { background: #ff3366; color: white; }
        .btn-primary:hover { background: #ff1a55; }
        .btn-ghost { background: transparent; color: #64748b; border: 1px solid #1e1e2e; }
        .btn-ghost:hover { border-color: #ff3366; color: #ff3366; }
        .input { background: #0a0a0f; border: 1px solid #1e1e2e; border-radius: 4px; padding: 8px 12px; color: #e2e8f0; font-family: 'DM Mono', monospace; font-size: 12px; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: #ff3366; }
        .song-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 6px; background: #0f0f18; border: 1px solid #1e1e2e; margin-bottom: 6px; transition: border-color 0.2s; }
        .song-item:hover { border-color: #ff336640; }
        .stat-card { background: #111118; border: 1px solid #1e1e2e; border-radius: 8px; padding: 20px; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #ff3366, transparent); }
        .gig-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #0f0f18; border: 1px solid #1e1e2e; border-radius: 6px; margin-bottom: 6px; }
        .tx-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #0f0f18; border-radius: 5px; margin-bottom: 4px; }
        select.input option { background: #111118; }
      `}</style>

      <div style={{ borderBottom: "1px solid #1e1e2e", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#ff3366", letterSpacing: "0.05em" }}>BANDFLOW</span>
            <span style={{ fontSize: 10, color: "#334155", letterSpacing: "0.2em", textTransform: "uppercase" }}>Band OS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, color: "#334155" }}>{session.user.email}</span>
            <button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 12px" }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => <button key={t} className={`tab-btn${active === t ? " active" : ""}`} onClick={() => setActive(t)}>{t}</button>)}
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>

        {active === "Dashboard" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Übersicht</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0" }}>Dein Band-Status</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <div className="stat-card">
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Balance</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: balance >= 0 ? "#22c55e" : "#ef4444" }}>{balance >= 0 ? "+" : ""}{balance}€</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>Total</div>
              </div>
              <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActive("Gigs")}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Nächster Gig</div>
                {nextGig ? <>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#e2e8f0" }}>{nextGig.name}</div>
                  <div style={{ fontSize: 11, color: "#ff3366", marginTop: 4 }}>{new Date(nextGig.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long" })} · {nextGig.fee}€</div>
                </> : <div style={{ color: "#334155", fontSize: 12 }}>Kein Gig geplant</div>}
              </div>
              <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActive("Proben")}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Nächste Probe</div>
                {nextProbe ? <>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#e2e8f0" }}>{new Date(nextProbe.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long" })}</div>
                  <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 4 }}>{nextProbe.time} Uhr · {nextProbe.location}</div>
                </> : <div style={{ color: "#334155", fontSize: 12 }}>Keine Probe geplant</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Gig Pipeline</div>
                {data.gigs.length === 0 ? <div style={{ color: "#334155", fontSize: 12 }}>Noch keine Gigs – füge deinen ersten hinzu!</div> : data.gigs.map(g => (
                  <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#e2e8f0" }}>{g.name}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>{new Date(g.date).toLocaleDateString("de-DE")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{g.fee}€</span>
                      <span className="badge" style={{ background: (statusColor[g.status] || "#475569") + "22", color: statusColor[g.status] || "#475569" }}>{g.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Letzte Transaktionen</div>
                {data.finanzen.length === 0 ? <div style={{ color: "#334155", fontSize: 12 }}>Noch keine Transaktionen</div> : data.finanzen.slice(-5).reverse().map(f => (
                  <div key={f.id} className="tx-row">
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{f.beschreibung}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: f.typ === "einnahme" ? "#22c55e" : "#ef4444" }}>
                      {f.typ === "einnahme" ? "+" : "-"}{f.betrag}€
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "Setlist" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {data.setlists.map((s, i) => (
                <button key={s.id} className={`btn ${selectedSetlist === i ? "btn-primary" : "btn-ghost"}`} onClick={() => setSelectedSetlist(i)}>{s.name}</button>
              ))}
            </div>
            <div className="card">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#e2e8f0" }}>{data.setlists[selectedSetlist].name}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{data.setlists[selectedSetlist].songs.length} Songs</div>
              </div>
              {data.setlists[selectedSetlist].songs.map((song, idx) => (
                <div key={idx} className="song-item">
                  <span style={{ fontSize: 10, color: "#334155", width: 20 }}>{String(idx + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{song}</span>
                  <span style={{ fontSize: 10, color: "#ff3366", letterSpacing: "0.1em" }}>{data.setlists[selectedSetlist].bpm[idx]} BPM</span>
                  <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => removeSong(idx)}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <input className="input" style={{ flex: 1 }} placeholder="Song hinzufügen..." value={newSong} onChange={e => setNewSong(e.target.value)} onKeyDown={e => e.key === "Enter" && addSong()} />
                <button className="btn btn-primary" onClick={addSong}>+ Add</button>
              </div>
            </div>
          </div>
        )}

        {active === "Proben" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0" }}>Probe-Planer</div>
              <button className="btn btn-primary" onClick={() => setShowProbeForm(!showProbeForm)}>+ Neue Probe</button>
            </div>
            {showProbeForm && (
              <div className="card" style={{ marginBottom: 16, borderColor: "#ff336640" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input className="input" type="date" value={newProbe.date} onChange={e => setNewProbe({ ...newProbe, date: e.target.value })} />
                  <input className="input" type="time" value={newProbe.time} onChange={e => setNewProbe({ ...newProbe, time: e.target.value })} />
                  <input className="input" placeholder="Location" value={newProbe.location} onChange={e => setNewProbe({ ...newProbe, location: e.target.value })} />
                  <input className="input" placeholder="Themen (kommagetrennt)" value={newProbe.themen} onChange={e => setNewProbe({ ...newProbe, themen: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={addProbe}>Speichern</button>
              </div>
            )}
            {data.proben.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
              <div key={p.id} className="gig-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div>
                    <span style={{ fontSize: 13, color: "#e2e8f0" }}>{new Date(p.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "long" })}</span>
                    <span style={{ fontSize: 11, color: "#475569", marginLeft: 12 }}>{p.time} · {p.location}</span>
                  </div>
                  <span className="badge" style={{ background: (statusColor[p.status] || "#475569") + "22", color: statusColor[p.status] || "#475569" }}>{p.status}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {typeof p.themen === "string" ? p.themen.split(",").map((t, i) => <span key={i} className="badge" style={{ background: "#1e1e2e", color: "#94a3b8" }}>📌 {t.trim()}</span>) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "Gigs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0" }}>Gig-Tracker</div>
              <button className="btn btn-primary" onClick={() => setShowGigForm(!showGigForm)}>+ Neuer Gig</button>
            </div>
            {showGigForm && (
              <div className="card" style={{ marginBottom: 16, borderColor: "#ff336640" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input className="input" placeholder="Venue / Event" value={newGig.name} onChange={e => setNewGig({ ...newGig, name: e.target.value })} />
                  <input className="input" type="date" value={newGig.date} onChange={e => setNewGig({ ...newGig, date: e.target.value })} />
                  <input className="input" type="number" placeholder="Gage (€)" value={newGig.fee} onChange={e => setNewGig({ ...newGig, fee: e.target.value })} />
                  <select className="input" value={newGig.status} onChange={e => setNewGig({ ...newGig, status: e.target.value })}>
                    <option>angefragt</option><option>bestätigt</option><option>abgeschlossen</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={addGig}>Speichern</button>
              </div>
            )}
            {data.gigs.length === 0 ? <div className="card" style={{ color: "#334155", fontSize: 12 }}>Noch keine Gigs – füge deinen ersten hinzu!</div> : data.gigs.sort((a, b) => new Date(b.date) - new Date(a.date)).map(g => (
              <div key={g.id} className="gig-row">
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 2 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{new Date(g.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 14, color: "#22c55e", fontFamily: "'Bebas Neue'" }}>{g.fee}€</span>
                  <span className="badge" style={{ background: (statusColor[g.status] || "#475569") + "22", color: statusColor[g.status] || "#475569" }}>{g.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "Finanzen" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#e2e8f0" }}>Finanzen</div>
              <button className="btn btn-primary" onClick={() => setShowTxForm(!showTxForm)}>+ Eintrag</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[["Einnahmen", totalEinnahmen, "#22c55e"], ["Ausgaben", totalAusgaben, "#ef4444"], ["Balance", balance, balance >= 0 ? "#22c55e" : "#ef4444"]].map(([label, val, col]) => (
                <div key={label} className="stat-card">
                  <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: col }}>{val >= 0 && label === "Balance" ? "+" : ""}{val}€</div>
                </div>
              ))}
            </div>
            {showTxForm && (
              <div className="card" style={{ marginBottom: 16, borderColor: "#ff336640" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <select className="input" value={newTx.typ} onChange={e => setNewTx({ ...newTx, typ: e.target.value })}>
                    <option value="einnahme">Einnahme</option><option value="ausgabe">Ausgabe</option>
                  </select>
                  <input className="input" placeholder="Beschreibung" value={newTx.beschreibung} onChange={e => setNewTx({ ...newTx, beschreibung: e.target.value })} />
                  <input className="input" type="number" placeholder="Betrag (€)" value={newTx.betrag} onChange={e => setNewTx({ ...newTx, betrag: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={addTx}>Speichern</button>
              </div>
            )}
            <div className="card">
              {data.finanzen.length === 0 ? <div style={{ color: "#334155", fontSize: 12 }}>Noch keine Transaktionen</div> : data.finanzen.sort((a, b) => new Date(b.date) - new Date(a.date)).map(f => (
                <div key={f.id} className="tx-row">
                  <div>
                    <div style={{ fontSize: 12, color: "#e2e8f0" }}>{f.beschreibung}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{new Date(f.date).toLocaleDateString("de-DE")}</div>
                  </div>
                  <span style={{ fontSize: 14, fontFamily: "'Bebas Neue'", color: f.typ === "einnahme" ? "#22c55e" : "#ef4444" }}>
                    {f.typ === "einnahme" ? "+" : "-"}{f.betrag}€
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}