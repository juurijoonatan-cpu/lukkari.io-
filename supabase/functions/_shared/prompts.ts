export const TIMETABLE_PROMPT = `Analysoi tämä tuntikiiertokaavio-kuva. Palauta tiedot JSON-muodossa seuraavalla rakenteella:
{
  "name": "Koulun nimi",
  "palkkiCount": 8,
  "periodCount": 5,
  "times": ["8.15–9.30", "9.45–11.00", "11.10–13.00", "13.15–14.30", "14.45–16.00"],
  "days": ["Ma", "Ti", "Ke", "To", "Pe"],
  "rotation": [
    [2, 7, 4, 7, 1],
    [3, 5, 2, 5, 4],
    [7, 4, 3, 1, 6],
    [6, 1, 6, 2, 5],
    [8, null, 8, 3, 8]
  ]
}

Ohjeet:
- rotation on 2D-taulukko: yksi rivi per oppitunti, yksi sarake per päivä
- Jokainen arvo on palkkinumero (kokonaisluku)
- Käytä null jos solu on tyhjä tai "YS" (yhteinen suunnittelu)
- palkkiCount = suurin palkkinumero taulukossa
- Palauta VAIN JSON, ei muuta tekstiä`;

export const BOOK_TOC_PROMPT = `Analysoi tämä lukion oppikirjan sisällysluettelo-kuva. Palauta tiedot JSON-muodossa:
{
  "subject": "YH",
  "course_code": "YH1",
  "title": "Yhteiskuntaoppi 1",
  "chapters": [
    {
      "num": 1,
      "title": "Luvun otsikko",
      "sections": [
        { "num": "1.1", "title": "Alaotsikko" },
        { "num": "1.2", "title": "Toinen alaotsikko" }
      ]
    }
  ]
}

Ohjeet:
- subject ja course_code: kirjan kannessa tai sisällysluettelossa näkyvät tunnukset, null jos ei tunnistu
- chapters: pääluvut numerojärjestyksessä
- sections: alaluvut jos ne näkyvät; tyhjä taulukko jos ei
- Palauta VAIN JSON, ei muuta tekstiä`;

export const NOTE_INGEST_PROMPT = `Tämä on suomalaisen lukiolaisen muistiinpanokuva. Palauta tiedot JSON-muodossa:
{
  "ocr_text": "Puhdas tekstilitterointi, järjestyksessä",
  "topics": ["lyhyet aihetagit"]
}

Ohjeet:
- ocr_text: muistiinpanon teksti puhtaaksi kirjoitettuna; säilytä järjestys, poista hajanaiset reunamerkinnät
- topics: 2–6 lyhyttä aihetagia (esim. "kpl 5", "demokratia", "vaalit", "th 1")
- Palauta VAIN JSON, ei muuta tekstiä`;

export const STUDY_PLAN_SYSTEM_PROMPT = `Olet suomalaisen lukiolaisen opiskeluneuvoja. Saat käyttäjän tiedot, kurssit, kirjojen luvut ja vapaa-ajan tapahtumat. Tee viikoittainen lukusuunnitelma joka:
1. Jakaa kunkin kurssin lukutyön viikoittaisiin sessioihin sopivasti
2. Lisää vähintään yhden kertausviikon ennen kunkin jakson koetta
3. Suosii aamuopiskelua, välttää treeni-iltoja ja muita varauksia
4. Palauttaa pelkän JSON-objektin muodossa:

{
  "weeks": [
    {
      "week_no": 1,
      "sessions": [
        { "course_code": "YH1", "topic": "kpl 1", "duration_min": 60, "day": "Ma", "time": "16:00" }
      ]
    }
  ]
}

Älä ehdota mitään lainvastaista. AI-suositukset ovat ohjeellisia — käyttäjä päättää viime kädessä.
Palauta VAIN JSON, ei muuta tekstiä.`;

export const TRIAGE_PROMPT = `Käyttäjä kirjoitti viestin lukio-AI:lle. Tunnista viestin tarkoitus ja palauta JSON-muodossa:
{
  "intent": "review" | "study" | "explain" | "schedule" | "other",
  "course_code": "YH1" | null,
  "topics": ["kpl 1","th 1","th 2","th 3"],
  "needs_note_ingestion": false
}

Esimerkki: "tarkasta kpl 1 yh1 th 1,2,3"
→ {"intent":"review","course_code":"YH1","topics":["kpl 1","th 1","th 2","th 3"],"needs_note_ingestion":false}

Ohjeet:
- intent: "review" = kertaus, "study" = uusi opiskelu, "explain" = selitä, "schedule" = aikataulutus
- course_code: tunnistetaan ÄI/MAA/ENA/YH/HI/BI/MA/FY/KE jne. + numero, esim "yh1" → "YH1"
- topics: lyhyet avainsanat tai luvut/tehtävät
- needs_note_ingestion: true jos käyttäjä on liittänyt muistiinpanokuvan
- Palauta VAIN JSON, ei muuta tekstiä`;
