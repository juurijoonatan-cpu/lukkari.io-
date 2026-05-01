import { useEffect } from 'react';
import { Ico } from './icons';

const UPDATED = "1.5.2026";
const CONTACT_EMAIL = "tuki@lukkari.io";
const REGISTRANT = "4H-yrittäjä Joonatan Juuri";
const Y_TUNNUS = "3598782-9";

const DOCS = {
  tietosuoja: {
    title: "Tietosuojaseloste",
    updated: UPDATED,
    sections: [
      { h: "1. Rekisterinpitäjä", body: `${REGISTRANT}, Y-tunnus ${Y_TUNNUS}. Yhteydenotot tietosuoja-asioissa: ${CONTACT_EMAIL}. Huom: 4H-yrittäjyys on alaikäisten yritystoimintaa tukeva muoto. Kun palvelu kasvaa, rekisterinpitäjä päivitetään toiminimeksi tai osakeyhtiöksi, ja tämä seloste päivitetään vastaavasti.` },
      { h: "2. Käsittelyn tarkoitus ja oikeusperuste (GDPR 6 art.)", body: "Sopimuksen täytäntöönpano (6.1.b): tilauksen avaaminen ja ylläpito, lukujärjestyksen ja AI-suositusten tuottaminen sekä toimitus, sähköpostivahvistukset. Suostumus (6.1.a): markkinointi-sähköpostit (uutiskirje), demo-tilan käyttöanalytiikka. Oikeutettu etu (6.1.f): palvelun tekninen toiminta, tietoturva ja väärinkäytön esto (rate-limit AI-rajapinnoissa). Lakisääteinen velvollisuus (6.1.c): kirjanpitoaineiston säilyttäminen." },
      { h: "3. Käsiteltävät tiedot", body: "Tilitiedot: sähköposti, salasanan tiiviste (Supabase Auth — emme näe selväkielistä salasanaa), nimi (jos annettu), lukio-luokka, lukuvuosi. Käyttödata: koulun valinta (school_id, school_name), lukujärjestyksen tekstiesitys, palkit-täyttöaste, käyttäjäagentti (navigator.userAgent) tekninen-virheidenjäljityshetkellä. Maksudata: vain Stripe Customer ID ja tilaus-status; emme käsittele luottokorttinumeroita. AI-keskustelut ja niiden konteksti: tallennetaan käyttäjäkohtaisesti palvelimelle. Käyttäjän lataamat kuvat (lukujärjestys, kirjojen sisällysluettelot, muistiinpanot): tallennetaan Supabase Storageen, pääsy signed URL -tunnisteilla (24 h elinikä)." },
      { h: "4. Tiedon vastaanottajat ja tietojen siirto", body: "Käytämme seuraavia alikäsittelijöitä: Supabase Inc. — tietokanta, autentikointi, Edge Functions, Storage (sijainti EU, Frankfurt). Stripe Payments Europe Ltd. — maksuintegraatio (Irlanti, globaali infrastruktuuri). Brevo (Sendinblue SAS) — sähköpostitoimitus (Ranska). OpenAI Ireland Ltd. — AI-suositukset Pro-tilauksessa (EU + USA, DPF-sertifioitu). Anthropic PBC — kuvasta-tekstiksi -muunnos (USA, DPF-sertifioitu). GitHub, Inc. — staattisten tiedostojen hostaus GitHub Pagesilla (USA, DPF-sertifioitu). EU/ETA-ulkopuoliset siirrot perustuvat EU–USA Data Privacy Framework (DPF) -päätökseen tai Euroopan komission vakiosopimuslausekkeisiin (SCC), jos toimittaja ei ole DPF-sertifioitu." },
      { h: "5. Säilytysajat", body: "Tilin perustiedot: tilauksen voimassaolon ajan + 6 kuukautta. Maksu- ja laskutuskirjanpito: 6 vuotta (kirjanpitolaki 2:10 §). Sähköposti-uutiskirjelista: kunnes käyttäjä peruuttaa suostumuksensa. AI-keskustelut: 90 päivää, minkä jälkeen ne anonymisoidaan (käyttäjätunniste poistetaan, sisältö säilytetään mallin kehityskäyttöön ilman henkilöyhteyttä). Käyttäjän lataamat kuvat: 30 päivää tai siihen asti kun käyttäjä poistaa kuvan. Tilin poistamisen yhteydessä kaikki kohdat poistetaan tai anonymisoidaan ilman aiheetonta viivytystä, lukuun ottamatta lakisääteisesti säilytettävää aineistoa." },
      { h: "6. Rekisteröidyn oikeudet (GDPR 15–22 art.)", body: `Sinulla on oikeus tarkastaa sinusta kerätyt tiedot, oikaista virheelliset tiedot, pyytää poistoa ("oikeus tulla unohdetuksi"), rajoittaa käsittelyä, siirtää tiedot toiselle palveluntarjoajalle ja vastustaa käsittelyä. Automaattinen päätöksenteko (22 art.): AI-suositukset ovat informatiivisia eivätkä sitovia päätöksiä — voit muokata kaikkia ehdotuksia. Yhteys oikeuksien käyttöön: ${CONTACT_EMAIL}. Vastaamme ilman aiheetonta viivytystä, viimeistään yhden kuukauden kuluessa. Sinulla on oikeus tehdä valitus Tietosuojavaltuutetun toimistolle (tietosuoja.fi).` },
      { h: "7. Tietoturvaloukkaukset (GDPR 33–34 art.)", body: "Mahdolliset tietoturvaloukkaukset ilmoitetaan Tietosuojavaltuutetulle 72 tunnin kuluessa loukkauksen havaitsemisesta. Mikäli loukkaus aiheuttaa korkean riskin rekisteröidyille, ilmoitamme asiasta käyttäjille ilman aiheetonta viivytystä." },
      { h: "8. Evästeet ja paikallinen tallennus", body: "Käytämme välttämättömiä evästeitä ja localStorage-rajapintaa palvelun toiminnan kannalta (mm. istuntotunnus, kielivalinta, tilausten esitäyttö). Lue tarkemmat tiedot Evästekäytäntö-sivulta. Emme käytä mainosevästeitä emmekä kolmannen osapuolen analytiikkaa." },
      { h: "9. Muutokset selosteeseen", body: "Päivitämme selostetta tarpeen mukaan. Olennaisista muutoksista ilmoitamme palvelussa ja sähköpostilla rekisteröidyille käyttäjille ennen muutosten voimaantuloa." },
    ],
  },
  kayttoehdot: {
    title: "Käyttöehdot",
    updated: UPDATED,
    sections: [
      { h: "1. Palveluntarjoaja", body: `${REGISTRANT}, Y-tunnus ${Y_TUNNUS}, yhteys: ${CONTACT_EMAIL}.` },
      { h: "2. Palvelun kuvaus", body: "Lukkari.io on selainpohjainen lukujärjestys- ja opiskelusuunnittelutyökalu suomalaisille lukio-opiskelijoille. Maksuttomat ominaisuudet ovat käytettävissä ilman rekisteröintiä. Pro-tilauksessa on käytössä AI-pohjaisia suosituksia (OpenAI gpt-4o-mini -malli) sekä Claude Vision -kuvanluku, lukusuunnitelmagenerointi, koepreppaustyökalut ja kalenteri-export." },
      { h: "3. Tilin avaaminen ja ikäraja", body: `Pro-tilausta varten tarvitaan tili. Tilin avaaja vakuuttaa olevansa vähintään 13-vuotias (GDPR 8 art. ja Suomen tietosuojalaki 5 §, joka asettaa tietoyhteiskunnan palveluiden suostumusiän 13 vuoteen). Alle 13-vuotias tarvitsee huoltajan suostumuksen — ota yhteyttä ${CONTACT_EMAIL} ennen tilin avaamista.` },
      { h: "4. Tilausehdot ja hinnoittelu", body: "Pro-tilauksen hinnat: 7,99 €/kk kuukausilaskutuksessa tai 6,99 €/kk vuosilaskutuksessa (yhteensä 83,88 €/vuosi). Hinnat sisältävät arvonlisäveron. Kaikilla uusilla tilaajilla on 7 vuorokauden ilmainen kokeilujakso ennen ensimmäistä veloitusta. Tilaus jatkuu automaattisesti kunnes se peruutetaan; veloitus suoritetaan kunkin laskutuskauden alussa. Maksun käsittelee Stripe Payments Europe Ltd." },
      { h: "5. Peruutusoikeus (kuluttajansuojalaki 6 luku, EU 2011/83/EU)", body: `Sinulla on oikeus peruuttaa tilauksesi 14 vuorokauden kuluessa veloituksesta ilman syytä. Peruutus: lähetä viesti ${CONTACT_EMAIL} tai käytä tilaussivun "Peruuta tilaus" -toimintoa. Voit käyttää myös oikeusministeriön mallikaavaketta (oikeusministerio.fi). Huom: jos käytät AI-toimintoja kokeilujakson päättymisen jälkeen ennen 14 vrk:n peruutusajan umpeutumista, voit menettää peruutusoikeutesi siltä osin kuin palvelu on jo suoritettu. Tästä pyydetään erillinen vahvistus checkoutissa.` },
      { h: "6. AI-vastausten luotettavuus", body: "AI-pohjaiset suositukset, lukusuunnitelmat ja koepreppausaikataulut ovat informatiivisia apuvälineitä. AI voi tehdä virheitä. Käyttäjä on yksin vastuussa lopullisten kurssivalintojensa, opintosuunnitelmiensa ja koepreppausaikataulujensa oikeellisuudesta sekä koulun määräaikojen ja Wilma-syötteiden tarkistamisesta. Palveluntarjoaja ei korvaa virheellisten AI-vastausten aiheuttamia välittömiä, välillisiä tai seurannaisvahinkoja (esim. valittu väärä kurssi, menetetty kurssipaikka, opintojen viivästyminen)." },
      { h: "7. Hyväksyttävä käyttö", body: "Palvelua ei saa käyttää tavalla, joka tunkeutumisyrityksiä, mass-scrapingia, automaattista AI-rate-limit-kiertoa, palvelun infrastruktuurin häiritsemistä, kolmansien osapuolten oikeuksien loukkaamista tai voimassa olevan lain rikkomista. Tilin ja salasanan turvallisuus on käyttäjän vastuulla." },
      { h: "8. Sopimuksen päättyminen ja tilin poistaminen", body: `Tilauksen voi peruuttaa milloin tahansa; tilaus jatkuu kuluvan laskutuskauden loppuun. Tilin poistamista voi pyytää lähettämällä viestin ${CONTACT_EMAIL}; toteutamme poiston ilman aiheetonta viivytystä, lukuun ottamatta lakisääteisesti säilytettävää aineistoa.` },
      { h: "9. Vastuunrajoitus", body: "Palvelu tarjotaan \"sellaisenaan\". Korvausvastuu rajoittuu enintään käyttäjän kuuden viimeisen kuukauden tilausmaksujen yhteenlaskettuun määrään. Vastuunrajoitus ei koske kuluttajansuojalain pakottavia säännöksiä eikä tahallisuudella tai törkeällä huolimattomuudella aiheutettuja vahinkoja." },
      { h: "10. Sovellettava laki ja riitojen ratkaisu", body: "Näihin käyttöehtoihin sovelletaan Suomen lakia. Riidat pyritään ensisijaisesti ratkaisemaan neuvottelemalla. Kuluttaja-asiakas voi viedä riidan kuluttajariitalautakuntaan (kuluttajariita.fi) ennen oikeudellista käsittelyä. Toimivaltainen tuomioistuin on kuluttaja-asiakkaan kotipaikan käräjäoikeus tai Helsingin käräjäoikeus." },
      { h: "11. Muutokset käyttöehtoihin", body: "Käyttöehtoja voidaan päivittää. Olennaisista muutoksista ilmoitamme palvelussa ja sähköpostilla vähintään 14 vuorokautta ennen muutosten voimaantuloa. Muutosten jälkeen palvelun jatkuva käyttö tarkoittaa uusien ehtojen hyväksymistä." },
    ],
  },
  evasteet: {
    title: "Evästekäytäntö",
    updated: UPDATED,
    sections: [
      { h: "1. Yleistä", body: "Lukkari.io käyttää välttämättömiä evästeitä ja localStorage-rajapintaa palvelun toiminnan kannalta. Emme käytä mainosevästeitä, kolmannen osapuolen analytiikkaa, profilointia tai uudelleenmarkkinointia. Erillistä eväste-banneria ei näytetä, koska kaikki tallennettavat tiedot ovat välttämättömiä (ePrivacy-direktiivi 5.3 art. poikkeus)." },
      { h: "2. Käytetyt avaimet", body: "sb-* (Supabase Auth) — käyttäjän istuntotunnus, päivittyy automaattisesti. lukkari.school — valitsemasi koulu (toiminnallinen). lukkari.year — valitsemasi lukuvuosi (toiminnallinen). lukkari.proTheme — Pro-näkymän vaalea/tumma teema (toiminnallinen). lukkari.proDemo — demo-tilan lippu (vain DEV-buildissa). lukkari.v1 — kurssivalinnat ja toivelista paikallisesti (ei lähetetä palvelimelle ellet erikseen lähetä lukujärjestystä sähköpostiisi). Stripe Checkout asettaa omia välttämättömiä evästeitä maksusivulla CSRF-suojausta varten." },
      { h: "3. Tietojen poistaminen", body: "Voit poistaa tallennetut tiedot milloin tahansa: (a) sovelluksen asetuksista \"Tyhjennä valinnat\", (b) selaimesi sivuston tietojen tyhjennyksestä, (c) selaimen kehittäjätyökaluilla, tai (d) kirjautumalla ulos Pro-tilauksesta." },
      { h: "4. Kolmannen osapuolen pyynnöt", body: "Palvelu lataa fontteja Google Fontsista (fonts.googleapis.com). Maksusivu lataa Stripe.js-skriptin Stripen palvelimilta. Nämä palvelut voivat lokittaa teknisiä pyyntötietoja CDN-jakelua varten. Lukkari.io ei vastaanota näistä erillisiä tietoja." },
      { h: "5. Muutokset", body: `Päivitämme tätä sivua jos otamme käyttöön uusia evästeitä. Yhteydenotot: ${CONTACT_EMAIL}.` },
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
          Yhteydenotot: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </div>
  );
}
