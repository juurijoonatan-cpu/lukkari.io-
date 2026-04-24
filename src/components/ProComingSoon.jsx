import { Ico } from './icons';

export function ProComingSoon() {
  const features = [
    {
      icon: Ico.bolt,
      color: "oklch(0.60 0.15 45)",
      bg: "oklch(0.93 0.055 45)",
      title: "Wilma-automaatio",
      desc: "JavaScript-skripti, jonka voit ajaa selaimen konsolissa. Se navigoi Wilmaan ja klikkaa kurssivalinnat automaattisesti puolestasi — pohjautuen Lukkari.io-suunnittelmaasi.",
      badge: "Tärkein ominaisuus"
    },
    {
      icon: Ico.conflict,
      color: "oklch(0.52 0.14 25)",
      bg: "oklch(0.94 0.04 25)",
      title: "Konfliktianalyysi",
      desc: "Sovellus tunnistaa automaattisesti jos olet valinnut kaksi kurssia samalle palkille samalla periodilla.",
    },
    {
      icon: Ico.calendar,
      color: "oklch(0.44 0.10 240)",
      bg: "oklch(0.93 0.04 240)",
      title: "Kalenteri-synkronointi",
      desc: "Vie lukujärjestyksesi suoraan Google- tai Apple-kalenteriin ICS-tiedostona.",
    },
    {
      icon: Ico.download,
      color: "oklch(0.45 0.10 150)",
      bg: "oklch(0.93 0.04 150)",
      title: "PDF-export",
      desc: "Tulosta tai tallenna lukujärjestyksesi näyttävänä PDF-tiedostona.",
    },
    {
      icon: Ico.shield,
      color: "oklch(0.50 0.11 340)",
      bg: "oklch(0.93 0.04 340)",
      title: "Varmuuskopiointi",
      desc: "Tallenna ja synkronoi lukujärjestyksesi pilvipalveluun — ei enää pelkoa tietojen menettämisestä.",
    },
  ];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.85)",
          borderRadius: 99, padding: "6px 16px", marginBottom: 20,
          backdropFilter: "blur(10px)",
        }}>
          <span style={{ color: "var(--accent)", display: "flex" }}>{Ico.star}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-s)", letterSpacing: "0.04em" }}>TULOSSA PIAN</span>
        </div>
        <h1 className="fr" style={{ fontSize: 54, fontWeight: 500, letterSpacing: "-0.025em", color: "var(--ink)", marginBottom: 12 }}>Lukkari Pro</h1>
        <p style={{ fontSize: 15, color: "var(--ink-s)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
          Automaattinen kurssivalinta Wilmaan ja paljon muuta — tee lukuvuosisuunnittelu muutamassa minuutissa.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
        {features.map((f, i) => (
          <div key={i} className="glass" style={{ borderRadius: 18, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: f.bg, display: "flex", alignItems: "center", justifyContent: "center",
              color: f.color, border: `1.5px solid ${f.bg.replace("0.93","0.82").replace("0.94","0.82")}`,
            }}>{f.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="fr" style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)" }}>{f.title}</span>
                {f.badge && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                    background: "var(--accent)", color: "white", borderRadius: 99, padding: "2px 7px",
                  }}>{f.badge}</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 20, padding: "28px 32px", textAlign: "center" }}>
        <p className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Kiinnostuitko?</p>
        <p style={{ fontSize: 13, color: "var(--ink-s)", marginBottom: 20 }}>Ilmoita sähköpostisi niin kerromme kun Pro-versio on saatavilla.</p>
        <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
          <input type="email" placeholder="sinun@email.fi" style={{
            flex: 1, padding: "10px 16px", borderRadius: 12,
            border: "1.5px solid rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.65)",
            fontSize: 13, outline: "none", color: "var(--ink)",
            backdropFilter: "blur(8px)",
          }}/>
          <button style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))",
            color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 16px oklch(0.62 0.13 45 / 0.35)",
            whiteSpace: "nowrap",
          }}
            onClick={() => alert("Kiitos! Otamme yhteyttä kun Pro on valmis.")}
          >Ilmoittaudu</button>
        </div>
      </div>
    </div>
  );
}
