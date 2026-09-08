# Tredjepartsbibliotek

Lokala kopior av de bibliotek kartan använder, för att inte vara beroende av
att en extern CDN är uppe och levererar rätt kod. Versionerna är låsta här.

| Fil | Paket | Version | Licens | sha256 |
|---|---|---|---|---|
| `leaflet.js`, `leaflet.css`, `images/` | [leaflet](https://www.npmjs.com/package/leaflet) | 1.9.4 | BSD-2-Clause | `db49d009c841f5ca…` |
| `maplibre-gl.js`, `maplibre-gl.css` | [maplibre-gl](https://www.npmjs.com/package/maplibre-gl) | 4.7.1 | BSD-3-Clause | `be9633c4d870e26f…` |
| `leaflet-maplibre-gl.js` | [@maplibre/maplibre-gl-leaflet](https://www.npmjs.com/package/@maplibre/maplibre-gl-leaflet) | 0.1.4 | ISC | `1e6cf8cb3eb5fd90…` |

Hämtade 2026-09-08 från unpkg.com. Varje fil kontrollerades vara byte-identisk
med samma fil från cdn.jsdelivr.net innan den lades in.

## Uppdatera ett bibliotek

Säkerhetsrättningar kommer inte av sig själva. Kontrollera någon gång per år:

- Leaflet: <https://github.com/Leaflet/Leaflet/releases>
- MapLibre GL JS: <https://github.com/maplibre/maplibre-gl-js/releases>

Byt fil, uppdatera tabellen ovan och prova kartan.

Fullständiga hashar:

```
db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a  leaflet.js
a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6  leaflet.css
be9633c4d870e26fb37f1cfe5c5a77181667114003ea16207ac7850d8da8add1  maplibre-gl.js
576b085fdd9487a65a19215328c1e086c07ce5bf6da09b666b3806d3d008dae9  maplibre-gl.css
1e6cf8cb3eb5fd909879aa1bf36a383fb506c9a5b2dbbfababce65a294dd1fcb  leaflet-maplibre-gl.js
```
