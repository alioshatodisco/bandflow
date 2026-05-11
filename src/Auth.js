import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setMessage("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("✓ Bestätigungs-Email wurde gesendet! Bitte prüfe dein Postfach.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f5f7",
      display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Left Panel */}
      <div style={{
        width: 420,
        background: "#253858",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 48px",
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 8 }}>BandFlow</div>
          <div style={{ fontSize: 16, color: "#7a8699" }}>Band Management & Wellbeing</div>
        </div>

        <div style={{ marginBottom: 32 }}>
          {[
            { icon: "🎸", text: "Gigs planen & tracken" },
            { icon: "💰", text: "Finanzen im Griff behalten" },
            { icon: "⏱", text: "Arbeitszeit fair aufteilen" },
            { icon: "🤖", text: "KI-Features für Musiker" },
            { icon: "💙", text: "Anti-Burnout & Wellbeing" },
            { icon: "💰", text: "Fördergelder nie verpassen" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 15, color: "#b3bac5" }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: "#344563", fontStyle: "italic" }}>
          "Made for Musicians. Not just the music."
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#172b4d", marginBottom: 8 }}>
            {isLogin ? "Willkommen zurück" : "Account erstellen"}
          </h1>
          <p style={{ fontSize: 15, color: "#6b778c", marginBottom: 32 }}>
            {isLogin ? "Logge dich in dein BandFlow-Konto ein." : "Starte heute mit BandFlow – kostenlos."}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input
              type="email"
              placeholder="deine@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAuth()}
              style={{ width: "100%", background: "white", border: "2px solid #dfe1e6", borderRadius: 4, padding: "10px 14px", color: "#172b4d", fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#0052cc"}
              onBlur={e => e.target.style.borderColor = "#dfe1e6"}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b778c", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Passwort</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAuth()}
              style={{ width: "100%", background: "white", border: "2px solid #dfe1e6", borderRadius: 4, padding: "10px 14px", color: "#172b4d", fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#0052cc"}
              onBlur={e => e.target.style.borderColor = "#dfe1e6"}
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#c1c7d0" : "#0052cc",
              border: "none",
              borderRadius: 4,
              padding: "12px",
              color: "white",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 16,
              transition: "background 0.15s"
            }}
          >
            {loading ? "Wird verarbeitet..." : isLogin ? "Einloggen →" : "Account erstellen →"}
          </button>

          {message && (
            <div style={{
              fontSize: 14,
              color: message.startsWith("✓") ? "#00875a" : "#de350b",
              background: message.startsWith("✓") ? "#e3fcef" : "#ffebe6",
              border: `1px solid ${message.startsWith("✓") ? "#abf5d1" : "#ffbdad"}`,
              padding: "10px 14px",
              borderRadius: 4,
              marginBottom: 16,
            }}>
              {message}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { setIsLogin(!isLogin); setMessage(""); }}
              style={{ background: "none", border: "none", color: "#0052cc", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              {isLogin ? "Noch kein Account? Jetzt registrieren →" : "Bereits registriert? Einloggen →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}