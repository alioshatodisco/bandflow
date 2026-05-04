import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Bestätigungs-Email wurde gesendet!");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, padding: 40, width: 360 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#ff3366", marginBottom: 8 }}>BANDFLOW</div>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>{isLogin ? "Login" : "Account erstellen"}</div>
        <input
          style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "10px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", marginBottom: 12, display: "block" }}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 4, padding: "10px 12px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", marginBottom: 20, display: "block" }}
          placeholder="Passwort"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          style={{ width: "100%", background: "#ff3366", border: "none", borderRadius: 4, padding: "10px", color: "white", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginBottom: 16 }}
        >
          {isLogin ? "Einloggen" : "Registrieren"}
        </button>
        {message && <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 12 }}>{message}</div>}
        <div
          onClick={() => setIsLogin(!isLogin)}
          style={{ fontSize: 11, color: "#475569", cursor: "pointer", textAlign: "center" }}
        >
          {isLogin ? "Noch kein Account? Registrieren" : "Bereits registriert? Login"}
        </div>
      </div>
    </div>
  );
}