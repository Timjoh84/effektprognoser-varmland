# Effektprognoser Värmland

Verktyg och underlag från projektet Effektprognoser Värmland (RISE). Repot
samlar det som byggs i projektet, en mapp per del. Mappen ligger i projektets
delade OneDrive/Teams-yta under `Verktyg\effektprognoser-varmland` och är
samtidigt ett git-repo kopplat till GitHub.

## Innehåll

| Mapp | Vad |
|---|---|
| `karta/` | Interaktiv karta över prognostiserat effektbehov och elanvändning per kilometerruta för 2023, 2030 och 2040, uppdelat på sektorer. Ren HTML, CSS och JavaScript med Leaflet, ingen byggprocess. Se `karta/CHANGELOG.md`. |
| `karta/data/` | Rutdata, kommungränser och koncessionsområden. Finns bara lokalt i OneDrive, inte på GitHub. |

## Ursprung och tack

Kartan bygger på **Erik Lindvalls** öppna kartverktyg för
[Effektprognoser.se](https://effektprognoser.se/), publicerat under MIT-licens
i <https://github.com/mwa2k/effektprognoser>. Därifrån kommer grundstrukturen
för appen, färgschemat med intervall per prognos och sektor
(`boundaries_colors.js`, här `karta/js/schema.js`), mönstren för ny bebyggelse
och negativa värden (`patterns.js`) samt reglerna för hur rutorna färgläggs
(`styles.js`, här delar av `karta/js/main.js`).

Värmlandsversionen är omskriven och utökad — bland annat med klickbar legend,
ortnamn ovanpå rutorna, nätområden, Region Värmlands färgprofil och ett annat
dataformat — men den hade inte funnits utan originalet. Hans upphovsrättsnotis
finns bevarad i `LICENSE`.

## Köra kartan

Det enklaste: dubbelklicka på `karta\index.html`. Kartan fungerar direkt från
disk, ingen installation behövs. Bakgrundskartan hämtas från internet.

Vill man slippa Chromes varning i konsolen om `file:`-adresser, kör i stället
en lokal webbserver i mappen `karta` (kräver Python):

```bash
python -m http.server 8000
```

Öppna sedan <http://localhost:8000>.

## Versionshantering

- Git sköter historiken. Skapa inga kopior av typen `v1.3` eller `karta_ny`,
  gör ändringen i `karta/` och committa.
- Milstolpar markeras med taggar, t.ex. `v1.2`. Lista dem med `git tag`.
- **Geodata committas inte.** Allt under `karta/data/` samt filer av typen
  GeoJSON, GeoPackage, Parquet och SQLite är uteslutna via `.gitignore`, oavsett
  var i repot de ligger. `git status` visar aldrig dem. Datat delas via
  OneDrive i stället.
- Vid driftsättning på webbserver läggs `karta/data/` upp separat.

## Äldre versioner

Tidigare versioner av kartan (v1.0 och v1.1) ligger i `Verktyg\_arkiv` och
används inte längre.
