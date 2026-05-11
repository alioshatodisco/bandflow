import { useState, useEffect } from "react";

const sprueche = [
  { text: "Du bist nicht hinter anderen her. Du bist auf deinem eigenen Weg.", kategorie: "Perspektive" },
  { text: "Jeder grosse Künstler hat mal klein angefangen. Der Unterschied? Sie haben nicht aufgehört.", kategorie: "Durchhalten" },
  { text: "Deine Musik muss nicht perfekt sein. Sie muss ehrlich sein.", kategorie: "Kreativität" },
  { text: "Ein schlechter Proberaum-Tag ist immer noch besser als kein Musik-Tag.", kategorie: "Motivation" },
  { text: "Pause ist kein Versagen. Pause ist Teil des Prozesses.", kategorie: "Selbstfürsorge" },
  { text: "Die beste Version deiner Musik entsteht mit ausgeruhtem Kopf.", kategorie: "Selbstfürsorge" },
  { text: "Heute geprobt = Morgen besser. So einfach ist das.", kategorie: "Motivation" },
  { text: "Dein nächster Song könnte der sein, der alles verändert.", kategorie: "Durchhalten" },
  { text: "Du musst nicht viral gehen. Du musst authentisch sein.", kategorie: "Kreativität" },
  { text: "Deine Stimme ist einzigartig. Das ist dein grösster Vorteil.", kategorie: "Selbstwert" },
];

export default function Mindset() {
  const [spruch, setSpruch] = useState(null);

  useEffect(() => {
    const now = new Date();
    const idx = (now.getDate() + now.getMonth() * 31) % sprueche.length;
    setSpruch(sprueche[idx]);
  }, []);

  if (!spruch) return null;

  return (
    <div style={{
      background: "white",
      border: "1px solid #ebecf0",
      borderRadius: 8,
      padding: "20px 24px",
      marginBottom: 20,
      boxShadow: "0 1px 3px rgba(9,30,66,0.08)",
      display: "flex",
      alignItems: "flex-start",
      gap: 16
    }}>
      <div style={{ fontSize: 24, flexShrink: 0 }}>💙</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Daily Mindset · {spruch.kategorie}
        </div>
        <div style={{ fontSize: 15, color: "#172b4d", lineHeight: 1.6, fontStyle: "italic" }}>
          „{spruch.text}"
        </div>
      </div>
    </div>
  );
}