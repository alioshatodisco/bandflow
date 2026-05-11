import { useState } from "react";
import { supabase } from "./supabase";

export default function SetlistManager({ setlists, setSetlists, session }) {
  const [selectedSetlist, setSelectedSetlist] = useState(0);
  const [newSong, setNewSong] = useState("");
  const [newBpm, setNewBpm] = useState("120");
  const [newSetlistName, setNewSetlistName] = useState("");
  const [showNewSetlist, setShowNewSetlist] = useState(false);
  const [editingBpm, setEditingBpm] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const current = setlists[selectedSetlist];

  const saveSetlist = async (updated) => {
    await supabase.from('setlists').update({ songs: updated.songs, bpm: updated.bpm }).eq('id', updated.id);
    setSetlists(prev => prev.map((s, i) => i === selectedSetlist ? updated : s));
  };

  const addSetlist = async () => {
    if (!newSetlistName.trim()) return;
    const { data: inserted } = await supabase.from('setlists').insert([{
      name: newSetlistName.trim(),
      songs: [],
      bpm: [],
      user_id: session.user.id
    }]).select();
    if (inserted) setSetlists(prev => [...prev, ...inserted]);
    setNewSetlistName("");
    setShowNewSetlist(false);
  };

  const addSong = async () => {
    if (!newSong.trim() || !current) return;
    const updated = {
      ...current,
      songs: [...(current.songs || []), newSong.trim()],
      bpm: [...(current.bpm || []), Number(newBpm) || 120]
    };
    await saveSetlist(updated);
    setNewSong("");
    setNewBpm("120");
  };

  const removeSong = async (idx) => {
    const updated = {
      ...current,
      songs: current.songs.filter((_, i) => i !== idx),
      bpm: current.bpm.filter((_, i) => i !== idx)
    };
    await saveSetlist(updated);
  };

  const updateBpm = async (idx, val) => {
    const updatedBpm = [...current.bpm];
    updatedBpm[idx] = Number(val) || 0;
    const updated = { ...current, bpm: updatedBpm };
    await saveSetlist(updated);
    setEditingBpm(null);
  };

  const deleteSetlist = async () => {
    if (!current) return;
    await supabase.from('setlists').delete().eq('id', current.id);
    setSetlists(prev => prev.filter(s => s.id !== current.id));
    setSelectedSetlist(0);
  };

  // Drag & Drop
  const onDragStart = (idx) => setDragIdx(idx);
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };

  const onDrop = async (idx) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const songs = [...current.songs];
    const bpm = [...current.bpm];
    const [movedSong] = songs.splice(dragIdx, 1);
    const [movedBpm] = bpm.splice(dragIdx, 1);
    songs.splice(idx, 0, movedSong);
    bpm.splice(idx, 0, movedBpm);
    const updated = { ...current, songs, bpm };
    await saveSetlist(updated);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const inputStyle = {
    background: "white", border: "2px solid #dfe1e6", borderRadius: 4,
    padding: "8px 12px", color: "#172b4d", fontFamily: "inherit",
    fontSize: 14, outline: "none", boxSizing: "border-box"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#172b4d" }}>Setlist Manager</div>
        <button
          onClick={() => setShowNewSetlist(!showNewSetlist)}
          style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          + Neue Setlist
        </button>
      </div>

      {showNewSetlist && (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.12)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Setlist Name</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="z.B. Club Set – 45min" value={newSetlistName} onChange={e => setNewSetlistName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSetlist()} />
            <button onClick={addSetlist} style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>Erstellen</button>
            <button onClick={() => setShowNewSetlist(false)} style={{ background: "white", color: "#42526e", border: "1px solid #dfe1e6", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Abbrechen</button>
          </div>
        </div>
      )}

      {setlists.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, color: "#6b778c" }}>
          Noch keine Setlists – erstelle deine erste!
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {setlists.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelectedSetlist(i)}
                style={{
                  background: selectedSetlist === i ? "#0052cc" : "white",
                  color: selectedSetlist === i ? "white" : "#42526e",
                  border: `1px solid ${selectedSetlist === i ? "#0052cc" : "#dfe1e6"}`,
                  borderRadius: 4, padding: "8px 16px", fontFamily: "inherit",
                  fontSize: 14, fontWeight: selectedSetlist === i ? 500 : 400, cursor: "pointer"
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          {current && (
            <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{current.name}</div>
                  <div style={{ fontSize: 13, color: "#6b778c", marginTop: 2 }}>
                    {current.songs?.length || 0} Songs · ca. {Math.round((current.songs?.length || 0) * 3.5)} Min
                  </div>
                </div>
                <button
                  onClick={deleteSetlist}
                  style={{ background: "white", color: "#de350b", border: "1px solid #ffbdad", borderRadius: 4, padding: "6px 12px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}
                >
                  Setlist löschen
                </button>
              </div>

              {/* Hint */}
              {(current.songs?.length || 0) > 1 && (
                <div style={{ fontSize: 12, color: "#6b778c", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>☰</span> Songs per Drag & Drop verschieben · BPM anklicken zum Bearbeiten
                </div>
              )}

              {(current.songs || []).map((song, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={() => onDrop(idx)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", background: dragOverIdx === idx ? "#deebff" : "#f4f5f7",
                    borderRadius: 4, marginBottom: 6, cursor: "grab",
                    border: `2px solid ${dragOverIdx === idx ? "#0052cc" : "transparent"}`,
                    transition: "all 0.15s",
                    opacity: dragIdx === idx ? 0.5 : 1
                  }}
                >
                  <span style={{ fontSize: 14, color: "#c1c7d0", cursor: "grab", flexShrink: 0 }}>☰</span>
                  <span style={{ fontSize: 12, color: "#6b778c", width: 24, flexShrink: 0 }}>{String(idx + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontSize: 14, color: "#172b4d" }}>{song}</span>

                  {/* BPM editierbar */}
                  {editingBpm === idx ? (
                    <input
                      autoFocus
                      type="number"
                      defaultValue={current.bpm?.[idx] || 120}
                      onBlur={e => updateBpm(idx, e.target.value)}
                      onKeyDown={e => e.key === "Enter" && updateBpm(idx, e.target.value)}
                      style={{ width: 70, background: "white", border: "2px solid #0052cc", borderRadius: 4, padding: "3px 8px", fontSize: 13, fontWeight: 600, color: "#0052cc", outline: "none", textAlign: "center" }}
                    />
                  ) : (
                    <span
                      onClick={() => setEditingBpm(idx)}
                      style={{ fontSize: 12, color: "#0052cc", fontWeight: 600, cursor: "pointer", padding: "3px 8px", borderRadius: 4, background: "#deebff", flexShrink: 0 }}
                      title="Klicken zum Bearbeiten"
                    >
                      {current.bpm?.[idx] || 120} BPM
                    </span>
                  )}

                  <button
                    onClick={() => removeSong(idx)}
                    style={{ background: "white", color: "#de350b", border: "1px solid #ffbdad", borderRadius: 4, padding: "3px 8px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Song hinzufügen */}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Song hinzufügen..."
                  value={newSong}
                  onChange={e => setNewSong(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSong()}
                />
                <input
                  style={{ ...inputStyle, width: 90 }}
                  type="number"
                  placeholder="BPM"
                  value={newBpm}
                  onChange={e => setNewBpm(e.target.value)}
                />
                <button
                  onClick={addSong}
                  style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}