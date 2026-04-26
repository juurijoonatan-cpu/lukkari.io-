import { useEffect } from 'react';
import { Ico } from './icons';

const DOCS = {
  tietosuoja: {
    title: "Tietosuojaseloste",
    updated: "25.4.2026",
    sections: [
      { h: "1. Rekisterinpitäjä", body: "Lukkari.io on yksityishenkilön ylläpitämä verkkopalvelu. Yhteydenotot tietosuoja-asioissa: privacy@lukkari.io." },
      { h: "2. Käsiteltävät tiedot", body: "Tällä hetkellä palvelu ei tallenna henkilötietoja palvelimelle. Kaikki kurssivalinnat, koulun valinta, lukuvuosi ja toivelista tallennetaan ainoastaan käyttäjän oman selaimen localStorage-muistiin avaimella \"lukkari.v1\". Tietoja ei lähetetä eteenpäin. Pro-version pilviominaisuudet voivat tulevaisuudessa muuttaa tätä käytäntöä — seloste päivitetään ennen muutosten käyttöönottoa." },
      { h: "3. Käsittelyn tarkoitus ja oikeusperuste", body: "Tietoja käsitellään yksinomaan palvelun toiminnallisuuden mahdollistamiseksi (kurssivalintojen säilyminen sivun uudelleenlatauksen yli). Oikeusperusteena GDPR 6 art. 1(f) — oikeutettu etu palvelun toimivuudessa. Tietoja ei käytetä profilointiin, mainontaan eikä muuhun." },
      { h: "4. Vastaanottajat ja tietojen siirto", body: "Tietoja ei luovuteta kolmansille osapuolille eikä siirretä EU/ETA-alueen ulkopuolelle. Palvelu hostataan GitHub Pagesilla (Microsoft Corporation), joka käsittelee ainoastaan teknisiä lokitietoja (IP-osoitteet, pyyntöajat) palvelinkäytön yhteydessä." },
      { h: "5. Säilytysaika", body: "LocalStorage-tiedot säilyvät selaimessa kunnes käyttäjä poistaa ne (asetuksista \"Tyhjennä valinnat\" tai selaimen sivuston tietojen tyhjennys). Palvelu ei poista tietoja automaattisesti." },
      { h: "6. Rekisteröidyn oikeudet", body: "Sinulla on oikeus tarkastella, oikaista ja poistaa tietosi milloin tahansa selaimen kehittäjätyökaluilla tai sovelluksen omilla toiminnoilla. Koska palvelu ei tallenna tietoja palvelimelle, erillistä tietopyyntöä ei tarvita. Voit halutessasi tehdä valituksen tietosuojavaltuutetulle (tietosuoja.fi)." },
      { h: "7. Evästeet", body: "Palvelu ei tällä hetkellä käytä evästeitä. Toiminnallisuuteen käytetään ainoastaan localStorage-rajapintaa, joka ei ole eväste eikä lähetä tietoa palvelimelle. Mikäli tulevaisuudessa otetaan käyttöön evästeitä edellyttäviä ominaisuuksia, tästä ilmoitetaan erikseen ja tämä seloste päivitetään." },
      { h: "8. Muutokset selosteeseen", body: "Tämä seloste voi päivittyä. Päivityspäivä on merkitty selosteen yläosaan. Suosittelemme tarkastamaan selosteen säännöllisesti." },
    ],
  },
  kayttoehdot: {
    title: "Käyttöehdot",
    updated: "25.4.2026",
    sections: [
      { h: "1. Palvelun kuvaus", body: "Lukkari.io on maksuton lukio- ja korkeakouluopiskelijoille suunnattu apuväline kurssivalintojen suunnitteluun. Palvelu toimii kokonaan käyttäjän selaimessa eikä vaadi rekisteröitymistä." },
      { h: "2. Palvelu \"sellaisenaan\"", body: "Palvelu tarjotaan \"sellaisenaan\" (AS IS) ilman minkäänlaisia takuita — nimenomaisia tai oletettuja — mukaan lukien mutta ei rajoittuen takuut soveltuvuudesta tiettyyn käyttötarkoitukseen, virheettömyydestä tai keskeytymättömyydestä. Palveluntarjoaja ei takaa tietojen oikeellisuutta, ajantasaisuutta tai saatavuutta." },
      { h: "3. Vastuunrajoitus", body: "Palveluntarjoaja ei ole vastuussa mistään välittömistä, välillisistä, satunnaisista, erityisistä tai seurannaisvahingoista, mukaan lukien (mutta ei rajoittuen) menetetyistä tiedoista, ajasta, tuloista, kurssipaikoista tai opintojen viivästymisestä, jotka johtuvat palvelun käytöstä tai käytön estymisestä. Korvausvastuu on enintään käyttäjän palvelusta maksaman määrän suuruinen (eli 0 €)." },
      { h: "4. Käyttäjän vastuu", body: "Käyttäjä on yksin vastuussa: (a) lopullisten kurssivalintojensa oikeellisuudesta omassa Wilma-järjestelmässä tai vastaavassa, (b) Pro-version suosittelijan ehdotusten arvioinnista — suositukset ovat informatiivisia apuvälineitä, ei sitovia, (c) oman koulunsa kurssivalintaohjeiden ja määräaikojen noudattamisesta." },
      { h: "5. Pro-ominaisuudet", body: "Pro-version kurssisuosittelija analysoi kurssivalintoja ja tarjoaa personoituja suosituksia ylioppilaskirjoitusten ja hakukohteiden perusteella. Suositukset ovat informatiivisia apuvälineitä — lopullinen kurssivalintavastuu on aina käyttäjällä. Muut tulevat Pro-ominaisuudet kuvataan tarkemmin erillisessä dokumentaatiossa ennen julkaisua." },
      { h: "6. Immateriaalioikeudet", body: "Palvelun lähdekoodi, ulkoasu ja sisältö ovat palveluntarjoajan tai sen lisenssinantajien omaisuutta. Käyttäjä saa rajoitetun, ei-yksinoikeudellisen oikeuden palvelun käyttöön henkilökohtaisiin tarkoituksiin. Palvelun jälleenmyynti, kopiointi, takaisinmallintaminen tai johdannaisten luominen ilman erillistä lupaa on kielletty." },
      { h: "7. Hyväksyttävä käyttö", body: "Palvelua ei saa käyttää tavalla, joka: häiritsee palvelua tai sen infrastruktuuria, yrittää murtautua palveluun, kuormittaa palvelua kohtuuttomasti automatisoiduilla pyynnöillä, loukkaa kolmansien osapuolten oikeuksia tai rikkoo voimassa olevaa lainsäädäntöä." },
      { h: "8. Palvelun muuttaminen ja lopettaminen", body: "Palveluntarjoaja varaa oikeuden muuttaa, keskeyttää tai lopettaa palvelun kokonaan tai osittain milloin tahansa ilman ennakkoilmoitusta tai korvausvelvollisuutta." },
      { h: "9. Sovellettava laki ja riitojen ratkaisu", body: "Näihin käyttöehtoihin sovelletaan Suomen lakia. Riidat pyritään ensisijaisesti ratkaisemaan neuvottelemalla. Mahdolliset riidat käsitellään Helsingin käräjäoikeudessa, ellei pakottavasta lainsäädännöstä muuta johdu (kuluttaja-asiakkailla on oikeus käsitellä riita kotipaikkansa käräjäoikeudessa)." },
      { h: "10. Muutokset käyttöehtoihin", body: "Käyttöehtoja voidaan päivittää. Olennaisista muutoksista pyritään ilmoittamaan palvelussa. Palvelun käytön jatkaminen muutosten julkaisun jälkeen tarkoittaa muutosten hyväksymistä." },
    ],
  },
  evasteet: {
    title: "Evästekäytäntö",
    updated: "25.4.2026",
    sections: [
      { h: "1. Evästeiden käyttö tällä hetkellä", body: "Lukkari.io ei tällä hetkellä aseta tai lue evästeitä (cookies). Toiminnallisuus toteutetaan ainoastaan selaimen localStorage-rajapinnalla. Mikäli tulevaisuudessa otetaan käyttöön evästeitä edellyttäviä ominaisuuksia, tämä sivu päivitetään ja käyttäjiltä pyydetään suostumus asianmukaisesti." },
      { h: "2. localStorage", body: "Palvelu tallentaa avaimen \"lukkari.v1\" alle JSON-muodossa: koulun valinnan, kurssivalinnat, lukuvuoden ja toivelistan. Tieto pysyy ainoastaan käyttäjän selaimessa, ei palvelimella." },
      { h: "3. Tietojen poistaminen", body: "Voit poistaa tiedot milloin tahansa: (a) sovelluksen asetuksista \"Tyhjennä valinnat\", (b) selaimesi sivuston tietojen tyhjennyksestä, tai (c) poistamalla localStorage-merkinnän selaimen kehittäjätyökaluilla." },
      { h: "4. Kolmannen osapuolen evästeet", body: "Palvelu lataa fontteja Google Fontsista (fonts.googleapis.com), joka voi asettaa omia evästeitään fonttien CDN-jakelua varten. Tämä rajapinta ei kerää käyttäjän henkilötietoja Lukkari.io:n osalta." },
    ],
  },
};

export function LegalPanel({ docKey, onClose }) {
  const doc = DOCS[docKey];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  if (!doc) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 195,
      background: "rgba(20,10,5,0.45)",
      backdropFilter: "blur(8px) saturate(1.2)",
      WebkitBackdropFilter: "blur(8px) saturate(1.2)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 16px",
      overflowY: "auto",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 720, width: "100%",
        background: "rgba(255,255,255,0.92)",
        border: "1.5px solid rgba(255,255,255,0.95)",
        borderRadius: 24, padding: "32px 36px 40px",
        backdropFilter: "blur(40px) saturate(1.5)",
        WebkitBackdropFilter: "blur(40px) saturate(1.5)",
        boxShadow: "0 30px 80px rgba(80,40,10,0.22)",
        color: "#1f1d1a",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 16 }}>
          <h1 className="fr" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {doc.title}
          </h1>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.92)",
            color: "#797470", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }} title="Sulje">{Ico.close}</button>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#b2ada8", marginBottom: 28, letterSpacing: "0.05em" }}>
          Päivitetty {doc.updated}
        </div>
        {doc.sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 22 }}>
            <h2 className="fr" style={{ fontSize: 16, fontWeight: 500, color: "#1f1d1a", marginBottom: 8 }}>{s.h}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#4a4641" }}>{s.body}</p>
          </section>
        ))}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: 11, color: "#b2ada8" }}>
          Yhteydenotot: <a href="mailto:privacy@lukkari.io" style={{ color: "var(--accent)" }}>privacy@lukkari.io</a>
        </div>
      </div>
    </div>
  );
}
