# Dataformat för kartan

Specifikation av de filer kartan läser, avsedd som underlag till datapipelinen.
Beskriver läget i version `1.4.1`.

Kartan gör inga egna beräkningar på datat. Den läser en fil i taget, slår upp
varje rutas värde i ett färgintervall och ritar. Allt som rör vilka rutor som
finns, vad de innehåller och vilka som saknar basvärde bestäms av datat.

---

## 1. Filer och namngivning

Alla filer ligger i `karta/data/`.

| Fil | Innehåll | Produceras av pipelinen |
|---|---|---|
| `<år>_<kategori>.js` | Rutdata, en fil per kombination | Ja |
| `kommungranser.js` | Kommungränser | Nej, statisk |
| `koncessioner.js` | Nätområden (EI:s koncessioner) | Nej, statisk |
| `ortnamn.js` | Ortnamn från OpenStreetMap | Nej, statisk |

Rutfilerna måste heta exakt `<år>_<kategori>.js` med dessa värden:

- **År:** `2023` (basår), `2030`, `2040`
- **Kategori:** `total`, `bostader`, `industri_och_bygg`,
  `offentlig_och_privat_sektor`, `transport`

Det ger 15 filer. Namnen måste matcha radioknapparnas `value` i `index.html`.
Ska år eller kategorier ändras måste `index.html` ändras samtidigt.

---

## 2. Filens struktur

Filerna är JavaScript, inte `.geojson`. Skälet är att kartan ska gå att öppna
direkt från disk genom att dubbelklicka på `index.html`; webbläsare blockerar
`fetch()` mot `file://`, men tillåter `<script>`-taggar.

En rutfil består av **en rad**: en tilldelning där högerledet är vanlig GeoJSON.

```js
(window.GEOJSON = window.GEOJSON || {})["2030_total"] = {"type":"FeatureCollection", ...};
```

Krav:

- Nyckeln inom hakparentes ska vara **exakt filnamnet utan `.js`**. Stämmer den
  inte hittar kartan ingen data och visar felmeddelande.
- Filen ska vara UTF-8 utan BOM. Svenska tecken skrivs som tecken, inte som
  `ä`-sekvenser.
- Radslut `\n`.
- Kompakt JSON utan blanksteg mellan nycklar och värden. Filerna är stora
  (2–3 MB per styck) och blanksteg kostar onödigt mycket.

---

## 3. GeoJSON-innehållet

```json
{
  "type": "FeatureCollection",
  "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
  "features": [ ... ]
}
```

Koordinater i **WGS84 (EPSG:4326)**, longitud före latitud. `crs`-blocket är
inte längre en del av GeoJSON-standarden men skadar inte och kan behållas.

### Geometri

Varje ruta är en `Polygon` med **en ring och fem punkter**, där sista punkten
är identisk med den första (sluten ring). Rutorna är kvadratiska kilometer i
SWEREF99 TM, vilket gör dem svagt roterade i WGS84 — det är förväntat.

```json
{"type":"Polygon","coordinates":[[[12.9837,60.1336],[12.9831,60.1426],[13.0011,60.1429],[13.0017,60.1339],[12.9837,60.1336]]]}
```

Grannrutor **ska dela hörnkoordinater exakt**. Kartan ritar rutorna sömlöst,
och avrundningsskillnader ger synliga glapp eller dubbla kanter.

Cirka 5 decimaler räcker (≈ 1 meter). Fler decimaler gör bara filerna större.

---

## 4. Attribut per ruta

### Basåret 2023 — sex fält

```json
{"rid":"3880006668000","kn":"Torsby","kk":"1737","category":"total","ea":14209.22,"eb":3.3674}
```

### Prognosåren 2030 och 2040 — tio fält

```json
{"rid":"3880006668000","kn":"Torsby","kk":"1737","category":"total","ea":14209.22,"eb":3.3674,"ebd":-0.0347,"ead":-161.02,"ebp":-1.0,"eap":-1.1}
```

| Fält | Typ | Enhet | Beskrivning |
|---|---|---|---|
| `rid` | sträng | — | Rutans id, se avsnitt 5 |
| `kn` | sträng | — | Kommunnamn, t.ex. `"Torsby"` |
| `kk` | sträng | — | Kommunkod, fyra siffror, t.ex. `"1737"` |
| `category` | sträng | — | Samma som filnamnets kategori |
| `ea` | tal | MWh/år | Elanvändning |
| `eb` | tal | MW | Effektbehov |
| `ebd` | tal eller `null` | MW | Tillkommande effektbehov mot basåret |
| `ead` | tal eller `null` | MWh/år | Tillkommande elanvändning mot basåret |
| `ebp` | tal eller `null` | procent | Tillkommande effektbehov |
| `eap` | tal eller `null` | procent | Tillkommande elanvändning |

Noteringar:

- Basårsfilerna ska **inte** innehålla de fyra tillkommande fälten alls.
- `ea` och `eb` ska alltid ha ett riktigt tal, även i markerade rutor.
- Procentfälten är procent, inte andel. `5049.2` betyder 5 049 %.
- Negativa värden är tillåtna och ritas prickigt, utom i transportlagret där
  de i stället visas som det lägsta positiva intervallet (ärvd regel).
- `rid` och `category` läses inte av kartan i dagsläget, men behåll dem för
  spårbarhet och för framtida funktioner.

---

## 5. rid — rutans id

Sträng, 13 tecken: **sex siffror östlig koordinat följt av sju siffror nordlig
koordinat i SWEREF99 TM (EPSG:3006)**, för rutans sydvästra hörn.

```
"3880006668000"  ->  E 388 000, N 6 668 000  ->  ungefär 60,1336° N, 12,9837° Ö
```

Kontrollerat mot geometrin: koordinaten stämmer med rutans hörn. Behåll
formatet, det gör att rutor kan matchas mellan år och kategorier.

---

## 6. Rutor som saknar basvärde — `null`

**Detta är den viktigaste konventionen.**

Saknar en ruta värde i basåret går de tillkommande värdena inte att räkna ut.
Sätt då **`null` i alla fyra tillkommande fälten**:

```json
{"rid":"3800006550000","kn":"Säffle","kk":"1785","category":"bostader","ea":160.0,"eb":0.0582,"ebd":null,"ead":null,"ebp":null,"eap":null}
```

Kartan ritar sådana rutor streckade och kallar dem "Ny bebyggelse", utom i
transportlagret där de kallas "Ny laddinfra".

Regler:

- Alla fyra fälten sätts till `null` samtidigt. Blanda inte tal och `null`.
- `ea` och `eb` ska ha riktiga värden.
- Markeringen är **per kategori**. En ruta kan vara ny i transportlagret och
  befintlig i bostadslagret. I nuvarande data gäller det 3 937 rutor.

### Använd inte talet 10 000 000

Tidigare versioner markerade detta med värdet `10000000`. Det är avvecklat
eftersom det kan kollidera med verkliga värden: den största verkliga
procentsiffran i datat är 278 152 % (transportruta i Årjäng 2040), bara
36 gånger under gränsen. En kollision hade tyst ritat rutan som "Ny bebyggelse"
i stället för som den kraftigaste ökningen på kartan.

Kartan läser fortfarande det gamla formatet, så en övergång kan ske gradvis,
men nya uttag ska använda `null`.

### Om ni vill skilja begreppen åt

Kartan härleder i dag "ny laddinfra" ur att kategorin är transport. Vill ni
i stället styra det från datat, lägg till ett eget fält, exempelvis
`ny: "bebyggelse" | "laddinfra"`. Det kräver en liten ändring i kartan och kan
införas utan att bryta befintliga filer.

---

## 7. Avrundning

Nuvarande data är avrundat till:

| Fält | Decimaler | Minsta steg | Största avrundningsfel |
|---|---|---|---|
| `eb`, `ebd` | 4 | 0,0001 MW | 50 W per ruta |
| `ea`, `ead` | 2 | 0,01 MWh | 5 kWh per ruta |
| `ebp`, `eap` | 1 | 0,1 % | 0,05 % |

Felen är försumbara i summor: som mest 0,03 % för länets samlade effektbehov
och 0,0007 % för elanvändningen.

De märks däremot i de minsta rutorna. I nuvarande data visas 2 231 av 6 319
transportrutor som `0.000 MW`, och 14 rutor i industrilagret (10 st 2023,
2 st 2030, 2 st 2040) har fått exakt noll i effektbehov redan i filen,
trots att de har en förbrukning. **Sex decimaler i `eb` och `ead`
skulle ta bort det** och kostar bara några procents filstorlek.

---

## 8. Interna konsistenskrav

Kontroller som nuvarande data klarar och som bör fortsätta gälla:

- Inga dubbletter av `rid` inom en fil.
- Inga saknade fält, inga `NaN`.
- Alla rutor inom länet.
- `category` stämmer med filnamnet.
- **Elanvändning: `total` = summan av kategorierna**, per ruta. Uppfyllt exakt.
- **Effektbehov: `total` ≤ summan av kategorierna.** Topparna infaller inte
  samtidigt, så summan ligger 1,6–4,1 % över totalen. Det är korrekt och ska
  inte "rättas".

---

## 9. Efter en datauppdatering

Lägg de nya filerna i `karta/data/`. Inget annat behöver ändras.

Webbläsare som haft kartan öppen tidigare kan ha de gamla datafilerna i
cachen. Ladda då om med Ctrl+F5. På en webbserver undviks det genom att
servern skickar `Cache-Control: no-cache` för `.js`-filer.

---

## 10. Övriga lager

Dessa produceras inte av pipelinen, men formatet dokumenteras för fullständighetens skull.

| Fil | Nyckel | Innehåll |
|---|---|---|
| `kommungranser.js` | `kommungranser` | GeoJSON, 16 polygoner, attribut `kk` och `kn` |
| `koncessioner.js` | `koncessioner` | GeoJSON, ett sammanslaget linjenät av koncessionsgränser klippta vid länsgränsen |
| `ortnamn.js` | `ortnamn` | Vanlig JSON-array, inte GeoJSON: `{"n":namn,"y":lat,"x":lon,"k":klass,"p":folkmängd}` där klass 1–5 är stad, tätort, by, stadsdel, småort |

De två sista använder radformen

```js
window.GEOJSON = window.GEOJSON || {};
window.GEOJSON["koncessioner"] = ...;
```

vilket fungerar likvärdigt med enradsformen i avsnitt 2.
