import { useState } from "react";
import Band from "./Band";

export default function Einstellungen({ session, onClose }) {
  const [aktiv, setAktiv] = useState("band");

  const MENU = [
    { id: "band", icon: "👥", label: "Band & Mitglieder" },
    { id: "profil", icon: "👤", label: "Mein Profil" },
    { id: "notifications", icon: "🔔", label: "Benachrichtigungen" },
    { id: "region", icon: "🌍", label: "Region & Sprache" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(9,30,66,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "white", borderRadius: 8, width: "100%", maxWidth: 860,
        maxHeight: "90vh", overflow: "hidden", display: "flex",
        boxShadow: "0 8px 32px rgba(9,30,66,0.25)"
      }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#f4f5f7", borderRight: "1px solid #ebecf0", padding: "24px 12px", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#172b4d", padding: "0 12px", marginBottom: 20 }}>
            Einstellungen
          </div>
          {MENU.map(m => (
            <button
              key={m.id}
              onClick={() => setAktiv(m.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 6, width: "100%",
                border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, textAlign: "left", transition: "all 0.15s",
                background: aktiv === m.id ? "white" : "transparent",
                color: aktiv === m.id ? "#0052cc" : "#42526e",
                fontWeight: aktiv === m.id ? 500 : 400,
                boxShadow: aktiv === m.id ? "0 1px 3px rgba(9,30,66,0.12)" : "none"
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#172b4d" }}>
              {MENU.find(m => m.id === aktiv)?.label}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b778c", fontSize: 20, padding: 4 }}
            >
              ✕
            </button>
          </div>

          {aktiv === "band" && <Band session={session} />}

          {aktiv === "profil" && (
            <div>
              <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Konto</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0052cc", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
                    {session.user.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#172b4d" }}>{session.user.email}</div>
                    <div style={{ fontSize: 13, color: "#6b778c", marginTop: 2 }}>BandFlow Konto</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6b778c", background: "#f4f5f7", padding: "12px 16px", borderRadius: 6 }}>
                  Profil-Bearbeitung kommt bald – Name, Foto, Instrument und mehr.
                </div>
              </div>
            </div>
          )}

          {aktiv === "notifications" && (
            <div>
              <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Browser-Benachrichtigungen</div>
                {["Notification" in window ? (Notification.permission === "granted" ? "✅ Aktiviert" : "⚠️ Nicht aktiviert") : "❌ Nicht unterstützt"].map(status => (
                  <div key={status} style={{ fontSize: 14, color: "#172b4d", marginBottom: 16 }}>{status}</div>
                ))}
                <button
                  onClick={() => Notification.requestPermission()}
                  style={{ background: "#0052cc", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
                >
                  Benachrichtigungen aktivieren
                </button>
              </div>

              <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Erinnerungen</div>
                {[
                  "Probe heute / morgen / in 3 Tagen",
                  "Gig heute / morgen / in 7 Tagen",
                  "Förderantrag in 30 Tagen fällig"
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ color: "#00875a" }}>✓</span>
                    <span style={{ fontSize: 14, color: "#172b4d" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aktiv === "region" && (
            <div>
              <div style={{ background: "white", border: "1px solid #ebecf0", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(9,30,66,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Region</div>
                {[
                  ["Land", "🇨🇭 Schweiz"],
                  ["Währung", "CHF"],
                  ["Sprache", "Deutsch"],
                  ["Datumsformat", "DD.MM.YYYY"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ebecf0" }}>
                    <span style={{ fontSize: 14, color: "#6b778c" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#172b4d" }}>{val}</span>
                  </div>
                ))}
                <div style={{ fontSize: 13, color: "#6b778c", background: "#f4f5f7", padding: "12px 16px", borderRadius: 6 }}>
                  Weitere Regionen (DE, AT) kommen bald.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}