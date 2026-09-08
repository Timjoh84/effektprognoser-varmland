# Effektprognoser Värmland

Interaktiv karta över prognostiserat effektbehov och elanvändning i Värmlands
län, framtagen inom projektet *Effektprognoser Värmland* av RISE Research
Institutes of Sweden i samarbete med Region Värmland.

Kartan visar prognoser per kilometerruta för åren 2023, 2030 och 2040, uppdelat
på sektorerna bostäder, industri och bygg, offentlig och privat sektor samt
transport. Förutom absolut effektbehov visas tillkommande effektbehov och
elanvändning mot basåret, i megawatt, megawattimmar och procent.

## Innehåll

| Sökväg | Beskrivning |
|---|---|
| `karta/` | Kartapplikationen. Ren HTML, CSS och JavaScript utan byggsteg. |
| `karta/js/` | Applikationslogik (`main.js`), färgschema och intervall (`schema.js`), SVG-mönster (`patterns.js`). |
| `karta/vendor/` | Tredjepartsbibliotek i låsta versioner, se `karta/vendor/README.md`. |
| `karta/DATAFORMAT.md` | Specifikation av datafilerna som kartan läser. |
| `karta/CHANGELOG.md` | Ändringslogg. |

Geodata ingår inte i repot. Kartan förväntar sig datafiler under `karta/data/`
enligt `karta/DATAFORMAT.md`; katalogen är utesluten via `.gitignore`.

## Funktioner

- Fem prognosvyer, tre år och fem sektorer, valbara i panelen.
- Klickbar legend som filtrerar kartan på ett eller flera intervall.
- Rutor som saknar värde i basåret markeras streckade som ny bebyggelse, i
  transportsektorn som ny laddinfrastruktur. Negativa värden markeras prickade.
- Valbara lager för kommungränser och nätområden (Energimarknadsinspektionens
  områdeskoncessioner), med reglage för genomskinlighet.
- Ortnamn ritas ovanpå rutorna med krockhantering.
- Färger enligt Region Värmlands grafiska profil.
- Fungerar direkt från disk utan webbserver; kräver internet endast för
  bakgrundskartan.

## Köra kartan

Öppna `karta/index.html` i en webbläsare. Alternativt, för att slippa
webbläsarens varningar om `file:`-adresser, starta en enkel webbserver i
katalogen `karta`:

```bash
python -m http.server 8000
```

och öppna <http://localhost:8000>.

Bakgrundskartan hämtas från [OpenFreeMap](https://openfreemap.org), baserad
på OpenStreetMap-data. Inga API-nycklar behövs.

## Driftsättning

Kopiera `karta/` inklusive `karta/data/` till valfri statisk webbserver.
Aktivera gärna komprimering (gzip eller brotli) för `.js`-filer; datafilerna är
2–3 MB vardera okomprimerade.

Vid varje kod- eller datauppdatering ska versionsparametern `?v=` i
`karta/index.html` höjas, så att webbläsare inte använder cachade filer.

## Data

Datafilerna produceras utanför detta repo. Format, fältdefinitioner, enheter,
konventionen för saknade basvärden (`null`) och konsistenskrav beskrivs i
[`karta/DATAFORMAT.md`](karta/DATAFORMAT.md).

## Ursprung och tack

Kartan bygger på **Erik Lindvalls** öppna kartverktyg för
[Effektprognoser.se](https://effektprognoser.se/), publicerat under MIT-licens
i <https://github.com/mwa2k/effektprognoser>. Därifrån kommer applikationens
grundstruktur, färgschemat med intervall per prognos och sektor, mönstren för
ny bebyggelse och negativa värden samt reglerna för hur rutorna färgläggs.

Värmlandsversionen är omskriven och utökad, men hade inte funnits utan
originalet. Erik Lindvalls upphovsrättsnotis är bevarad i `LICENSE`.

## Licens

MIT, se [`LICENSE`](LICENSE). Tredjepartsbibliotekens licenser anges i
`karta/vendor/README.md`. Bakgrundskarta © OpenStreetMap-bidragsgivare.
