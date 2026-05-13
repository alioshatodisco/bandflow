import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

export default function Band({ session }) {
  const [band, setBand] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBandName, setNewBandName] = useState("");
  const [showCreateBand, setShowCreateBand] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRolle, setInviteRolle] = useState("Gesang");
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const ROLLEN = ["Gesang", "Gitarre", "Bass", "Schlagzeug", "Keyboards", "Produktion", "Management", "Anderes"];

  const loadMembers = useCallback(async (bandId) => {
    const { data } = await supabase
      .from("band_members")
      .select("*")
      .eq("band_id", bandId);
    if (data) setMembers(data);
  }, []);

  const loadBand = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);
    setLoading(true);

    const { data: myBands } = await supabase
      .from("bands")
      .select("*")
      .eq("created_by", session.user.id)
      .limit(1);

    if (myBands && myBands.length > 0) {
      setBand(myBands[0]);
      await loadMembers(myBands[0].id);
    }

    setLoading(false);
  }, [initialized, session.user.id, loadMembers]);

  useEffect(() => {
    loadBand();
  }, [loadBand]);

  const createBand = async () => {
    if (!newBandName.trim()) return;
    const { data: inserted, error } = await supabase
      .from("bands")
      .insert([{ name: newBandName.trim(), created_by: session.user.id }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    if (inserted && inserted[0]) {
      const newBand = inserted[0];
      setBand(newBand);

      await supabase.from("band_members").insert([{
        band_id: newBand.id,
        user_id: session.user.id,
        email: session.user.email,
        rolle: "Admin",
        status: "aktiv"
      }]);

      await loadMembers(newBand.id);
    }

    setNewBandName("");
    setShowCreateBand(false);
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !band) return;

    const existing = members.find(m => m.email === inviteEmail.trim());
    if (existing) {
      setMessage("Diese Person ist bereits eingeladen!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const { error } = await supabase.from("band_members").insert([{
      band_id: band.id,
      email: inviteEmail.trim(),
      rolle: inviteRolle,
      status: "eingeladen"
    }]);

    if (error) {
      setMessage("Fehler – bitte versuche es nochmal.");
    } else {
      setMessage("✓ " + inviteEmail + " wurde eingeladen!");
      await loadMembers(band.id);
    }

    setInviteEmail("");
    setShowInvite(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const removeMember = async (id) => {
    await supabase.from("band_members").delete().eq("id", id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const isAdmin = band && band.created_by === session.user.id;

  const inputStyle = {
    background: "white", border: "2px solid #dfe1e6", borderRadius: 4,
    padding: "8px 12px", color: "#172b4d", fontFamily: "inherit",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box"
  };

  if (loading) return (
    <div style={{ color: "#6b778c", fontSize: 14, padding: 20 }}>Lädt...</div>
  );

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 600, color: "#172b4d", marginBottom: 20 }}>Band</div>

      {!band ? (
        <div>
          <div style={{ background: "#deebff", border: "1px solid #b3d4ff", borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0052cc", marginBottom: 8 }}>Erstelle deine Band</div>
            <div style={{ fontSize: 14, color: "#42526e" }}>
              Erstelle eine Band und lade deine Mitglieder ein.
            </div>
          </div>

          {!showCreateBand ? (
            <button
              onClick={() => setShowCreateBand(true)}
              style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "10px 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              + Band erstellen
            </button>
          ) : (
            <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.12)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Bandname</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={inputStyle}
                  placeholder="z.B. Fräulein Luise"
                  value={newBandName}
                  onChange={e => setNewBandName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createBand()}
                />
                <button onClick={createBand} style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
                  Erstellen
                </button>
                <button onClick={() => setShowCreateBand(false)} style={{ background: "white", color: "#42526e", border: "1px solid #dfe1e6", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#172b4d" }}>{band.name}</div>
                <div style={{ fontSize: 13, color: "#6b778c", marginTop: 4 }}>
                  {members.filter(m => m.status === "aktiv").length} aktive Mitglieder · {members.filter(m => m.status === "eingeladen").length} ausstehend
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
                >
                  + Mitglied einladen
                </button>
              )}
            </div>
          </div>

          {message && (
            <div style={{
              background: message.startsWith("✓") ? "#e3fcef" : "#ffebe6",
              border: `1px solid ${message.startsWith("✓") ? "#abf5d1" : "#ffbdad"}`,
              borderRadius: 6, padding: "10px 16px", marginBottom: 16,
              fontSize: 14, color: message.startsWith("✓") ? "#00875a" : "#de350b"
            }}>
              {message}
            </div>
          )}

          {showInvite && (
            <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.12)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email</div>
                  <input style={inputStyle} type="email" placeholder="band@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Rolle</div>
                  <select style={inputStyle} value={inviteRolle} onChange={e => setInviteRolle(e.target.value)}>
                    {ROLLEN.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={inviteMember} style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Einladen
                </button>
                <button onClick={() => setShowInvite(false)} style={{ background: "white", color: "#42526e", border: "1px solid #dfe1e6", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#6b778c", marginTop: 12 }}>
                💡 Die Person muss sich mit dieser Email bei BandFlow registrieren.
              </div>
            </div>
          )}

          <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Bandmitglieder</div>
            {members.length === 0 && <div style={{ color: "#6b778c", fontSize: 14 }}>Noch keine Mitglieder.</div>}
            {members.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ebecf0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0052cc", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {m.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#172b4d" }}>{m.email}</div>
                    <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>{m.rolle}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: m.status === "aktiv" ? "#e3fcef" : "#fffae6",
                    color: m.status === "aktiv" ? "#00875a" : "#ff8b00",
                    padding: "2px 8px", borderRadius: 3, textTransform: "uppercase"
                  }}>
                    {m.status}
                  </span>
                  {isAdmin && m.email !== session.user.email && (
                    <button onClick={() => removeMember(m.id)} style={{ background: "white", color: "#de350b", border: "1px solid #ffbdad", borderRadius: 4, padding: "4px 10px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}