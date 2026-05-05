import { useState, useEffect } from "react";

const sprueche = [
  { text: "Du bist nicht hinter anderen her. Du bist auf deinem eigenen Weg.", kategorie: "Vergleiche" },
  { text: "Jeder grosse Künstler hat mal klein angefangen. Der Unterschied? Sie haben nicht aufgehört.", kategorie: "Durchhalten" },
  { text: "Deine Musik muss nicht perfekt sein. Sie muss ehrlich sein.", kategorie: "Kreativität" },
  { text: "Ein schlechter Proberaum-Tag ist immer noch besser als kein Musik-Tag.", kategorie: "Motivation" },
  { text: "Vergleiche dich nicht mit dem Highlight-Reel anderer. Du siehst nur ihre Bühne, nicht ihre Kämpfe.", kategorie: "Vergleiche" },
  { text: "Pause ist kein Versagen. Pause ist Teil des Prozesses.", kategorie: "Selbstfürsorge" },
  { text: "Die beste Version deiner Musik entsteht ausgeruhter Kopf.", kategorie: "Selbstfürsorge" },
  { text: "Heute geprobt = Morgen besser. So einfach ist das.", kategorie: "Motivation" },
  { text: "Dein nächster Song könnte der sein, der alles verändert.", kategorie: "Durchhalten" },
  { text: "Erfolg im Musikbusiness ist kein Sprint. Es ist ein Marathon mit sehr guter Playlist.", kategorie: "Geduld" },
  { text: "Jeder Gig – egal wie klein – ist Erfahrung die niemand dir nehmen kann.", kategorie: "Wertschätzung" },
  { text: "Du musst nicht viral gehen. Du musst authentisch sein.", kategorie: "Kreativität" },
  { text: "Die Leute die heute 10x mehr Follower haben, kämpfen mit denselben Zweifeln wie du.", kategorie: "Vergleiche" },
  { text: "Schreib den Song. Perfektionierung kommt später.", kategorie: "Kreativität" },
  { text: "Deine Stimme – ob gesungen oder gespielt – ist einzigartig. Das ist dein grösster Vorteil.", kategorie: "Selbstwert" },
];

export default function Mindset() {
  const [spruch, setSpruch] = useState(null);

  useEffect(() => {
    const heute = new Date().getDay();
    const idx = heute % sprueche.length;
    setSpruch(sprueche[idx]);
  }, []);

  if (!spruch) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a0a1a, #0a0a1f)",
      border: "1px solid #ff336630",
      borderRadius: 8,
      padding: 24,
      marginBottom: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 2,
        background: "linear-gradient(90deg, #ff3366, #6366f1, transparent)"
      }} />
      <div style={{ fontSize: 10, color: "#ff3366", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
        💙 Daily Mindset · {spruch.kategorie}
      </div>
      <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.6, fontStyle: "italic" }}>
        "{spruch.text}"
      </div>
    </div>
  );
}