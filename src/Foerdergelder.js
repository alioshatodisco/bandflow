import { useState } from "react";

const FOERDERUNGEN = [
  {
    id: 1,
    name: "Pro Helvetia – Musikförderung",
    land: "🇨🇭 Schweiz",
    was: "Tourneen, Aufnahmen, Projekte",
    fuer: "Professionelle Musiker & Bands",
    betrag: "bis 50.000 CHF",
    deadline: "2026-03-31",
    link: "https://prohelvetia.ch",
    kategorie: "Projekt",
    tags: ["CH", "Tour", "Recording"]
  },
  {
    id: 2,
    name: "Swisslos Fonds – Kultur",
    land: "🇨🇭 Schweiz",
    was: "Kulturprojekte aller Art",
    fuer: "Kulturschaffende in der Schweiz",
    betrag: "variabel",
    deadline: "2026-06-30",
    link: "https://www.bak.admin.ch",
    kategorie: "Projekt",
    tags: ["CH", "Kultur"]
  },
  {
    id: 3,
    name: "Musikfonds e.V.",
    land: "🇩🇪 Deutschland",
    was: "Populäre Musik – Alben & Tourneen",
    fuer: "Bands & Solokünstler aus DE",
    betrag: "bis 150.000 €",
    deadline: "2026-04-15",
    link: "https://www.musikfonds.de",
    kategorie: "Album/Tour",
    tags: ["DE", "Album", "Tour"]
  },
  {
    id: 4,
    name: "Initiative Musik",
    land: "🇩🇪 Deutschland",
    was: "Musikwirtschaft & Künstlerförderung",
    fuer: "Deutsche Musikschaffende",
    betrag: "bis 200.000 €",
    deadline: "2026-05-31",
    link: "https://www.initiative-musik.de",
    kategorie: "Karriere",
    tags: ["DE", "Karriere"]
  },
  {
    id: 5,
    name: "AKM Fonds für Musik",
    land: "🇦🇹 Österreich",
    was: "Konzerte, Alben, Festivals",
    fuer: "AKM-Mitglieder aus AT",
    betrag: "bis 30.000 €",
    deadline: "2026-09-30",
    link: "https://www.akm.at",
    kategorie: "Projekt",
    tags: ["AT", "Konzert", "Album"]
  },
  {
    id: 6,
    name: "Österreichischer Musikfonds",
    land: "🇦🇹 Österreich",
    was: "Zeitgenössische Musik",
    fuer: "Österreichische Künstler",
    betrag: "bis 25.000 €",
    deadline: "2026-11-30",
    link: "https://www.musikfonds.at",
    kategorie: "Projekt",
    tags: ["AT", "Zeitgenössisch"]
  },
  {
    id: 7,
    name: "SUISA Fonds für Musik",
    land: "🇨🇭 Schweiz",
    was: "Schweizer Musikschaffen",
    fuer: "SUISA-Mitglieder",
    betrag: "bis 20.000 CHF",
    deadline: "2026-10-31",
    link: "https://fondsfuermusik.ch",
    kategorie: "Projekt",
    tags: ["CH", "SUISA"]
  },
  {
    id: 8,
    name: "Creative Europe – Music",
    land: "🇪🇺 Europa",
    was: "Europäische Musikprojekte & Tourneen",
    fuer: "Europäische Künstler & Labels",
    betrag: "bis 2.000.000 €",
    deadline: "2026-07-22",
    link: "https://culture.ec.europa.eu",
    kategorie: "International",
    tags: ["EU", "Tour", "International"]
  },
];

const kategorieColor = {
  "Projekt": { bg: "#deebff", color: "#0052cc" },
  "Album/Tour": { bg: "#e3fcef", color: "#00875a" },
  "Karriere": { bg: "#eae6ff", color: "#403294" },
  "International": { bg: "#fff0b3", color: "#974f0c" },
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function deadlineColor(days) {
  if (days < 0) return { color: "#6b778c", bg: "#f4f5f7" };
  if (days <= 30) return { color: "#bf2600", bg: "#ffebe6" };
  if (days <= 60) return { color: "#ff8b00", bg: "#fffae6" };
  return { color: "#00875a", bg: "#e3fcef" };
}

export default function Foerdergelder() {
  const [filter, setFilter] = useState("Alle");
  const [gespeichert, setGespeichert] = useState([]);

  const laender = ["Alle", "🇨🇭 Schweiz", "🇩🇪 Deutschland", "🇦🇹 Österreich", "🇪🇺 Europa"];

  const gefiltert = FOERDERUNGEN.filter(f => {
    if (filter === "Alle") return true;
    return f.land === filter;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const toggleSpeichern = (id) => {
    setGespeichert(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#172b4d", marginBottom: 4 }}>Fördergelder</div>
          <div style={{ fontSize: 14, color: "#6b778c" }}>Verpasse nie wieder eine Einreichfrist – sortiert nach Deadline.</div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "#deebff", border: "1px solid #b3d4ff", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div style={{ fontSize: 13, color: "#0052cc" }}>
          <strong>Tipp:</strong> Viele Förderungen erfordern eine SUISA/AKM/GEMA-Mitgliedschaft. Frühzeitig beantragen lohnt sich!
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {laender.map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            style={{
              background: filter === l ? "#0052cc" : "white",
              border: `1px solid ${filter === l ? "#0052cc" : "#dfe1e6"}`,
              borderRadius: 4,
              padding: "6px 14px",
              color: filter === l ? "white" : "#42526e",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: filter === l ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ display: "grid", gap: 12 }}>
        {gefiltert.map(f => {
          const days = daysUntil(f.deadline);
          const dc = deadlineColor(days);
          const isSaved = gespeichert.includes(f.id);
          const kat = kategorieColor[f.kategorie] || { bg: "#f4f5f7", color: "#6b778c" };

          return (
            <div key={f.id} style={{
              background: "white",
              border: "1px solid #ebecf0",
              borderRadius: 8,
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(9,30,66,0.08)",
              transition: "box-shadow 0.15s",
              opacity: days < 0 ? 0.6 : 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{f.land.split(" ")[0]}</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#172b4d" }}>{f.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, background: kat.bg, color: kat.color, padding: "2px 8px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.kategorie}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Was wird gefördert</div>
                      <div style={{ fontSize: 13, color: "#172b4d" }}>{f.was}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Für wen</div>
                      <div style={{ fontSize: 13, color: "#172b4d" }}>{f.fuer}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Förderbetrag</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#172b4d" }}>{f.betrag}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Deadline</div>
                      <span style={{ fontSize: 13, fontWeight: 600, background: dc.bg, color: dc.color, padding: "3px 10px", borderRadius: 3 }}>
                        {days < 0 ? "Abgelaufen" : days === 0 ? "Heute!" : `${new Date(f.deadline).toLocaleDateString("de-DE")} (${days} Tage)`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  <a
                    href={f.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: "#0052cc", border: "none", borderRadius: 4, padding: "8px 16px", color: "white", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", textAlign: "center" }}
                  >
                    Zur Website →
                  </a>
                  <button
                    onClick={() => toggleSpeichern(f.id)}
                    style={{
                      background: isSaved ? "#e3fcef" : "white",
                      border: `1px solid ${isSaved ? "#abf5d1" : "#dfe1e6"}`,
                      borderRadius: 4,
                      padding: "7px 16px",
                      color: isSaved ? "#00875a" : "#42526e",
                      fontFamily: "inherit",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {isSaved ? "✓ Gemerkt" : "Merken"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, padding: "16px 20px", background: "#f4f5f7", borderRadius: 8, fontSize: 13, color: "#6b778c" }}>
        💡 <strong>Hinweis:</strong> Deadlines und Beträge können sich ändern. Prüfe immer die offiziellen Websites vor der Einreichung.
      </div>
    </div>
  );
}