import { useState, useEffect } from "react";

export function useNotifications(gigs, proben, foerderDeadlines) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const newNotifs = [];

    proben.forEach(p => {
      if (p.status !== "geplant") return;
      const probeDate = new Date(p.date);
      probeDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((probeDate - heute) / (1000 * 60 * 60 * 24));
      if (diff === 0) newNotifs.push({ id: `probe-${p.id}`, typ: "probe", prio: "hoch", titel: "Probe heute!", text: `${p.time} Uhr · ${p.location}`, icon: "🥁" });
      else if (diff === 1) newNotifs.push({ id: `probe-${p.id}`, typ: "probe", prio: "mittel", titel: "Probe morgen", text: `${p.time} Uhr · ${p.location}`, icon: "🥁" });
      else if (diff <= 3) newNotifs.push({ id: `probe-${p.id}`, typ: "probe", prio: "niedrig", titel: `Probe in ${diff} Tagen`, text: `${p.time} Uhr · ${p.location}`, icon: "🥁" });
    });

    gigs.forEach(g => {
      if (g.status === "abgeschlossen") return;
      const gigDate = new Date(g.date);
      gigDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((gigDate - heute) / (1000 * 60 * 60 * 24));
      if (diff === 0) newNotifs.push({ id: `gig-${g.id}`, typ: "gig", prio: "hoch", titel: "Gig heute!", text: `${g.name} · ${g.fee} CHF`, icon: "🎸" });
      else if (diff === 1) newNotifs.push({ id: `gig-${g.id}`, typ: "gig", prio: "hoch", titel: "Gig morgen!", text: `${g.name} · ${g.fee} CHF`, icon: "🎸" });
      else if (diff <= 7) newNotifs.push({ id: `gig-${g.id}`, typ: "gig", prio: "mittel", titel: `Gig in ${diff} Tagen`, text: `${g.name} · ${g.fee} CHF`, icon: "🎸" });
    });

    if (foerderDeadlines) {
      foerderDeadlines.forEach(f => {
        const deadlineDate = new Date(f.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diff = Math.ceil((deadlineDate - heute) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 30) newNotifs.push({ id: `foerder-${f.id}`, typ: "foerder", prio: diff <= 7 ? "hoch" : "mittel", titel: `Förderantrag in ${diff} Tagen`, text: f.name, icon: "💰" });
      });
    }

    const prio = { hoch: 0, mittel: 1, niedrig: 2 };
    newNotifs.sort((a, b) => prio[a.prio] - prio[b.prio]);
    setNotifications(newNotifs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(gigs), JSON.stringify(proben)]);

  return notifications;
}

export function requestBrowserPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(titel, text) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(titel, { body: text, icon: "/favicon.ico" });
  }
}

const prioColor = {
  hoch: { bg: "#ffebe6", border: "#ffbdad", color: "#de350b" },
  mittel: { bg: "#fffae6", border: "#ffe380", color: "#ff8b00" },
  niedrig: { bg: "#e3fcef", border: "#abf5d1", color: "#00875a" },
};

function NotificationPanel({ notifications, gelesen, onMarkRead, onMarkAllRead, onClose }) {
  const ungelesen = notifications.filter(n => !gelesen.includes(n.id));
  const gelesenList = notifications.filter(n => gelesen.includes(n.id));

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 230, width: 340,
      background: "white", border: "1px solid #dfe1e6",
      borderRadius: 8, boxShadow: "0 8px 24px rgba(9,30,66,0.2)",
      zIndex: 1000, overflow: "hidden"
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #ebecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#172b4d" }}>
          Erinnerungen {ungelesen.length > 0 && <span style={{ fontSize: 12, background: "#de350b", color: "white", borderRadius: 10, padding: "1px 7px", marginLeft: 6 }}>{ungelesen.length}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {ungelesen.length > 0 && (
            <button onClick={onMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0052cc", fontFamily: "inherit" }}>
              Alle als gelesen
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b778c", fontSize: 16 }}>✕</button>
        </div>
      </div>

      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 20, fontSize: 14, color: "#6b778c", textAlign: "center" }}>
            ✅ Keine Erinnerungen
          </div>
        ) : (
          <>
            {ungelesen.map(n => {
              const style = prioColor[n.prio];
              return (
                <div key={n.id} style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: "1px solid #f4f5f7", background: style.bg, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: style.color }}>{n.titel}</div>
                    <div style={{ fontSize: 12, color: "#42526e", marginTop: 2 }}>{n.text}</div>
                  </div>
                  <button
                    onClick={() => onMarkRead(n.id)}
                    title="Als gelesen markieren"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6b778c", fontSize: 14, flexShrink: 0, padding: "2px 4px" }}
                  >
                    ✓
                  </button>
                </div>
              );
            })}
            {gelesenList.length > 0 && (
              <div>
                <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "#6b778c", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f4f5f7" }}>
                  Gelesen
                </div>
                {gelesenList.map(n => (
                  <div key={n.id} style={{ display: "flex", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f4f5f7", opacity: 0.5, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#172b4d" }}>{n.titel}</div>
                      <div style={{ fontSize: 12, color: "#6b778c", marginTop: 2 }}>{n.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);
  const [gelesen, setGelesen] = useState([]);

  const ungeleseneCount = notifications.filter(n => !gelesen.includes(n.id)).length;
  const hochCount = notifications.filter(n => n.prio === "hoch" && !gelesen.includes(n.id)).length;

  const markRead = (id) => setGelesen(prev => [...prev, id]);
  const markAllRead = () => setGelesen(notifications.map(n => n.id));

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="nav-btn"
        style={{ color: open ? "#f4f5f7" : "#b3bac5", background: open ? "rgba(255,255,255,0.1)" : "none" }}
      >
        <span style={{ position: "relative", width: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b3bac5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {ungeleseneCount > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -8,
              background: hochCount > 0 ? "#de350b" : "#ff8b00",
              color: "white", borderRadius: 10,
              padding: "0px 4px", fontSize: 9, fontWeight: 700,
              minWidth: 14, textAlign: "center", lineHeight: "14px"
            }}>
              {ungeleseneCount > 9 ? "9+" : ungeleseneCount}
            </span>
          )}
        </span>
        <span style={{ color: "#b3bac5" }}>Erinnerungen</span>
      </button>
      {open && (
        <NotificationPanel
          notifications={notifications}
          gelesen={gelesen}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}