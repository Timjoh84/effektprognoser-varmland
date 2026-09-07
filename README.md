# Effektprognoser Värmland

Verktyg och underlag från projektet Effektprognoser Värmland (RISE). Repot
samlar det som byggs i projektet, en mapp per del.

## Innehåll

| Mapp | Vad |
|---|---|
| `karta/` | Interaktiv karta över prognostiserat effektbehov och elanvändning per kilometerruta för 2023, 2030 och 2040, uppdelat på sektorer. Ren HTML, CSS och JavaScript med Leaflet, ingen byggprocess. Se `karta/CHANGELOG.md`. |

## Geodata ingår inte

Rutdata, kommungränser och koncessionsområden ligger under `karta/data/` och
är uteslutna via `.gitignore`. Vid driftsättning läggs mappen på servern
separat.

## Köra kartan lokalt

Kartan använder OpenFreeMap som bakgrund och laddar data via `<script>`-taggar,
så den fungerar både direkt från disk och via en webbserver. För att slippa
Chromes varningar för `file://`, kör i mappen `karta`:

```bash
python -m http.server 8000
```

Öppna sedan <http://localhost:8000>.
