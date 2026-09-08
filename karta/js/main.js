"use strict";

// Effektprognoser Värmland — Leaflet-app (file://-vänlig variant). v1.2
// Beror på: schema.js (window.SCHEMA), patterns.js (window.MAP_PATTERNS).
// v1.2: legenden är klickbar — klick på ett intervall visar bara det,
// fler klick lägger till/tar bort intervall, sista bortklicket visar allt.
// Geojson-data lazy-laddas från data/<år>_<kategori>.js via dynamisk
// <script>-tag — fungerar från file:// där fetch() blockeras.

const { SCHEMA, PALETTE, NY_BEBYGGELSE, bandFor, fixTransportNegativ } = window.SCHEMA;
const PATTERNS = window.MAP_PATTERNS;

// Returnerar SVG-fill-string för en feature givet aktuell prognos.
// Speglar logiken i styles.js i Erik Lindvalls Effektprognoser.se
// (https://github.com/mwa2k/effektprognoser, MIT) — styleFunctionEB +
// styleFunctionDifference + styleFunctionPercentage).
// Slå upp basfärg för hatch ("Ny bebyggelse") och transport-fallback:
// hämta eb/ea-värdet från rutan och slå upp det i AKTUELLA prognosens
// boundaries — speglar gamla appens styles.js (getColor(baseValue, ...)).
function baseColorFor(feature, kategori, prognos, baseFalt) {
  const schema = SCHEMA[prognos][kategori];
  const v = feature.properties[baseFalt] ?? 0;
  const band = bandFor(v, schema.bands);
  if (band && typeof band.style === "string" && band.style.startsWith("#")) {
    return band.style;
  }
  return PALETTE[kategori][0];
}

// Index i schema.bands för rutans värde, eller -1 om värdet saknas eller
// hamnar utanför alla band (rutan ritas då transparent). Samma index
// används av legendfiltret.
function bandIndexFor(feature, prognos, kategori) {
  const schema = SCHEMA[prognos][kategori];
  if (!schema) return -1;
  let value = feature.properties[prognos];

  // null = värdet gick inte att räkna ut mot basåret, dvs. rutan saknade
  // värde 2023. Sådana rutor hör till "Ny bebyggelse" / "Ny laddinfra".
  // Saknar vyn ett sådant band (Effektbehov) ger findIndex -1 och rutan
  // ritas transparent, vilket är rätt: där finns inget att visa.
  //
  // Äldre datafiler markerade samma sak med talet 10 000 000. Det formatet
  // fungerar fortfarande: bandet täcker intervallet [10 000 000, ∞) och
  // fångas av bandFor nedan. Talet var dock inte säkert — den största
  // verkliga procentsiffran i datat ligger bara 36 gånger under det.
  if (value == null || Number.isNaN(value)) {
    return schema.bands.findIndex((b) => b.style === "hatch");
  }

  // Transport: negativa visas som lägsta positiva (gamla appens regel)
  value = fixTransportNegativ(value, kategori, prognos);
  const band = bandFor(value, schema.bands);
  return band ? schema.bands.indexOf(band) : -1;
}

function fillForBand(feature, prognos, kategori, band) {
  const schema = SCHEMA[prognos][kategori];
  if (band.style === "hatch") {
    // "Ny bebyggelse" / "Ny laddinfra": värdet gick inte att räkna ut mot
    // basåret. Rutan ritas streckad över basårets färg.
    //
    // Originalappen ritade transportrutorna i hel basfärg utan streck. Här
    // streckas de som alla andra: för transport är 71 % av rutorna flaggade,
    // och nästan alla hamnar i palettens ljusaste ton — samma färg som
    // bandet "0 — 0,2". Utan streck går de alltså inte att skilja från det
    // lägsta bandet, och legendens streckade ruta stämmer inte med kartan.
    const basfarg = schema.base
      ? baseColorFor(feature, kategori, prognos, schema.base)
      : PALETTE[kategori][0];
    return PATTERNS.fill("hatch", basfarg);
  }
  if (band.style === "dot") {
    return PATTERNS.fill("dot", "transparent");
  }
  return band.style || "transparent";
}

// Rutornas täckningsgrad, styrs av slidern i panelen (0–1).
// Genomskinligheten läggs på hela rut-lagret (overlayPane), inte på varje
// ruta för sig. Varje ruta ritas helt täckande och kanten i fyllningens
// egen färg; först när lagret som helhet tonas ned blir det genomskinligt.
// Med genomskinlighet per ruta lägger sig kantens färg ovanpå fyllningen
// och grannrutors kanter ovanpå varandra, vilket ger en mörkare skarv runt
// varje ruta — uppmätt ca 5–10 % mörkare än insidan.
let cellOpacity = 0.75;

function sattRutOpacitet() {
  map.getPane("overlayPane").style.opacity = cellOpacity;
}

// Inzoomat får rutorna en synlig kant i en mörkare ton av sin egen färg.
// Kanten kan ritas täckande (genomskinligheten ligger på hela lagret), och
// därför blir en delad kant mellan två grannrutor — som ritas två gånger —
// exakt lika mörk som en kant utan granne. Alla sidor får samma färg.
// Utzoomat är rutorna bara några pixlar breda; då tar kanten över bilden,
// så under tröskeln ritas de sömlöst med kanten i fyllningens egen färg.
// Kantutjämningen lämnas påslagen: crispEdges ger visserligen exakt färg,
// men kastar bort linjer som täcker mindre än en halv pixel, så enstaka
// rutkanter försvann helt.
const KANT_ZOOM = 10;

// Kantfärg för en ruta, oavsett fyllningstyp — alltid en mörkare ton av
// den färg som faktiskt syns i rutan:
//   färgad ruta        → tonen av fyllningen
//   streckad ruta      → tonen av basfärgen under strecken (ligger i
//                        mönstrets id, t.ex. "url(#hatch-_99b1c3)")
//   prickig ruta       → tonen av vitt, dvs. ljusgrå (botten är genomskinlig)
// Tidigare fick mönsterrutorna en neutral mörkgrå kant, som blev betydligt
// tydligare än grannarnas och fick dem att sticka ut.
function kantFarg(fill) {
  if (fill.startsWith("#")) return morkareTon(fill);
  const m = /hatch-_([0-9a-fA-F]{6})/.exec(fill);
  return morkareTon(m ? `#${m[1]}` : "#ffffff");
}

function morkareTon(hex, k = 0.72) {
  const kanal = (i) =>
    Math.round(parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16) * k)
      .toString(16)
      .padStart(2, "0");
  return `#${kanal(0)}${kanal(1)}${kanal(2)}`;
}

// ===== Legendfilter =====
// Klick på en legendrad visar bara det intervallet; fler klick lägger till
// eller tar bort intervall ur urvalet. Tomt urval = allt visas. Urvalet
// lagras som band-index och nollställs när prognos eller kategori byts;
// intervallen är desamma över åren, så där behålls det.
const legendFilter = { key: null, valda: new Set() };
function arDold(idx) {
  const { valda } = legendFilter;
  return valda.size > 0 && !valda.has(idx);
}
// fill/stroke "none" → rutan ritas inte alls, till skillnad från fillOpacity 0.
const DOLD_STIL = { fill: false, stroke: false };
// setStyle slår ihop options, så synliga stilar måste uttryckligen slå på
// fill/stroke igen efter att en ruta varit dold.
const SYNLIG = { fill: true, stroke: true };

function styleFn(prognos, kategori) {
  const grid = map.getZoom() >= KANT_ZOOM;
  const bands = SCHEMA[prognos][kategori].bands;
  return function (feature) {
    const idx = bandIndexFor(feature, prognos, kategori);
    if (idx >= 0 && arDold(idx)) return DOLD_STIL;
    const fill = idx < 0 ? "transparent" : fillForBand(feature, prognos, kategori, bands[idx]);
    if (fill === "transparent") {
      return { ...SYNLIG, color: "#555", weight: 0.15, opacity: 0, fillColor: fill, fillOpacity: 0 };
    }
    const isColor = typeof fill === "string" && fill.startsWith("#");
    if (grid) {
      return {
        ...SYNLIG,
        color: kantFarg(fill),
        // 2 px, inte tunnare: rutnätet ligger snett mot skärmens axlar (se
        // KANT_ZOOM), och en tunnare linje delas då upp av kantutjämningen
        // över två pixelrader och tappar styrka på sina ställen. Uppmätt når
        // en 2 px-kant full kantfärg längs hela sin längd, en 1 px-kant bara
        // på delar av den.
        weight: 2,
        opacity: 1,
        fillColor: fill,
        fillOpacity: 1,
      };
    }
    return {
      ...SYNLIG,
      color: isColor ? fill : "#555",
      weight: isColor ? 0.6 : 0.15,
      opacity: 1,
      fillColor: fill,
      fillOpacity: 1,
    };
  };
}


// Färgytan ligger i en inre span med samma opacitet som rutorna på kartan,
// så legendens färger matchar det man faktiskt ser. Ramen påverkas inte.
function legendSwatchHtml(band) {
  let inner;
  if (band.style === "hatch") {
    inner = `<span class="swatch-inner swatch-hatch"></span>`;
  } else if (band.style === "dot") {
    inner = `<span class="swatch-inner swatch-dot"></span>`;
  } else {
    inner = `<span class="swatch-inner" style="background:${band.style || "transparent"}"></span>`;
  }
  return `<span class="swatch">${inner}</span>`;
}

function uppdateraLegendOpacitet() {
  document.querySelectorAll("#legend-body .swatch-inner").forEach((el) => {
    el.style.opacity = cellOpacity;
  });
}

function ritaLegend(prognos, kategori) {
  const schema = SCHEMA[prognos][kategori];
  const key = `${prognos}_${kategori}`;
  if (legendFilter.key !== key) {
    legendFilter.key = key;
    legendFilter.valda.clear();
  }
  document.getElementById("legend-title").textContent = schema.titel;
  const rader = schema.bands
    .map((band, i) => `
      <div class="legend-row" role="button" tabindex="0" data-band="${i}"
           title="Klicka för att visa bara detta intervall">
        ${legendSwatchHtml(band)}<span class="legend-label">${band.label}</span>
      </div>`)
    .join("");
  document.getElementById("legend-body").innerHTML = rader;
  uppdateraLegendOpacitet();
  uppdateraLegendTillstand();
}

// Speglar urvalet i legenden: ej valda rader tonas ned, foten visar
// "Visa alla"-knappen bara när ett urval är aktivt.
function uppdateraLegendTillstand() {
  const { valda } = legendFilter;
  const rows = document.querySelectorAll("#legend-body .legend-row");
  rows.forEach((row) => {
    const idx = Number(row.dataset.band);
    row.classList.toggle("dold", arDold(idx));
    row.setAttribute("aria-pressed", String(valda.has(idx)));
  });
  const aktiv = valda.size > 0;
  document.getElementById("legend-hint").textContent = aktiv
    ? `${valda.size} av ${rows.length} intervall visas`
    : "Klicka på ett intervall för att visa bara det";
  document.getElementById("legend-reset").hidden = !aktiv;
}

// Applicera filtret på kartan. setStyle över ~8000 rutor tar några tiotal
// ms — okej per klick, ingen throttling behövs.
function tillampaFilter() {
  uppdateraLegendTillstand();
  if (!currentLayer) return;
  const { category, prognos } = laesValda();
  currentLayer.setStyle(styleFn(prognos, category));
  visaLagerStatus();
}

function toggleBand(idx) {
  const { valda } = legendFilter;
  const antalBand = document.querySelectorAll("#legend-body .legend-row").length;
  if (valda.has(idx)) {
    valda.delete(idx);  // sista bortklicket ger tomt urval = allt visas
  } else {
    valda.add(idx);
    if (valda.size === antalBand) valda.clear();  // alla valda = inget filter
  }
  tillampaFilter();
}

{
  const body = document.getElementById("legend-body");
  body.addEventListener("click", (e) => {
    const row = e.target.closest(".legend-row");
    if (row) toggleBand(Number(row.dataset.band));
  });
  body.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest(".legend-row");
    if (!row) return;
    e.preventDefault();
    toggleBand(Number(row.dataset.band));
  });
  document.getElementById("legend-reset").addEventListener("click", () => {
    legendFilter.valda.clear();
    tillampaFilter();
  });
}

// ===== Karta-init =====
// zoomControl: false → Leaflets egna +/–-knappar hamnar annars uppe till
// vänster, rakt under kontrollpanelen, och blir helt dolda. De läggs i
// stället uppe till höger, ovanför lagerväljaren.
const map = L.map("map", { renderer: L.svg(), zoomControl: false }).setView([59.6, 13.5], 8);
L.control.zoom({ position: "topright", zoomInTitle: "Zooma in", zoomOutTitle: "Zooma ut" }).addTo(map);

const ofmAttribution =
  '<a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const baseLayers = {
  "Ljus": L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/positron",
    attribution: ofmAttribution,
  }),
  "Karta": L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/liberty",
    attribution: ofmAttribution,
  }),
};
baseLayers["Ljus"].addTo(map);

// ===== Ortnamn ovanpå rutorna =====
// Rutlagret täcker annars bakgrundskartans ortnamn. Namnen ritas därför en
// gång till, som vanliga HTML-etiketter i en pane ovanför rutorna, och
// bakgrundskartans egna ortnamn släcks. Data: OpenStreetMap via Overpass,
// se data/ortnamn.js. (Ett andra MapLibre-lager vore enklare men kostar ett
// extra WebGL-sammanhang och gick inte att få att rita tillförlitligt.)
map.createPane("ortnamnPane");
Object.assign(map.getPane("ortnamnPane").style, { zIndex: 500, pointerEvents: "none" });

// Från vilken zoomnivå varje ortstyp visas: stad, tätort, by, stadsdel, småort.
const ORT_MINZOOM = { 1: 7, 2: 8, 3: 10, 4: 11, 5: 12 };
const ORT_KLASS = { 1: "ort-stad", 2: "ort-tatort", 3: "ort-by", 4: "ort-stadsdel", 5: "ort-smaort" };
let ortnamnData = null;

// Ritar om etiketterna för aktuell vy. Bara orter i rutan och över sin
// zoomtröskel tas med, och en etikett hoppas över om den krockar med en
// redan utsatt (viktigast först: stad före by). Utan krockhantering blir
// namnen oläsliga i tätbebyggda områden.
function ritaOrtnamn() {
  const pane = map.getPane("ortnamnPane");
  if (!ortnamnData) return;
  const z = map.getZoom();
  const bounds = map.getBounds().pad(0.05);
  const utsatta = [];
  const frag = document.createDocumentFragment();

  for (const o of ortnamnData) {
    if (z < ORT_MINZOOM[o.k]) continue;
    if (!bounds.contains([o.y, o.x])) continue;
    const pt = map.latLngToLayerPoint([o.y, o.x]);
    // Grov textbredd: räcker för krockhantering, ingen mätning i DOM:en.
    const teckenbredd = o.k <= 2 ? 7.5 : 6;
    const halvB = (o.n.length * teckenbredd) / 2 + 3;
    const halvH = (o.k <= 2 ? 9 : 8);
    const ruta = { x1: pt.x - halvB, x2: pt.x + halvB, y1: pt.y - halvH, y2: pt.y + halvH };
    if (utsatta.some((u) => !(ruta.x2 < u.x1 || ruta.x1 > u.x2 || ruta.y2 < u.y1 || ruta.y1 > u.y2))) continue;
    utsatta.push(ruta);
    const el = document.createElement("span");
    el.className = `ortnamn ${ORT_KLASS[o.k]}`;
    el.textContent = o.n;
    el.style.transform = `translate(${Math.round(pt.x)}px, ${Math.round(pt.y)}px)`;
    frag.appendChild(el);
  }
  pane.replaceChildren(frag);
}

// resize behövs: ritas etiketterna medan kartan har noll storlek (dolt
// fönster, hopfälld panel) blir vyn tom, och utan resize ritas de inte om
// förrän användaren själv panorerar.
map.on("zoomend moveend resize", ritaOrtnamn);

// Släcker bakgrundskartans ortnamn (alla symbol-lager ur source-layer
// "place"), oavsett vilken stil som är vald.
function slackBakgrundensOrtnamn(lager) {
  const gl = lager.getMaplibreMap && lager.getMaplibreMap();
  if (!gl) return;
  const doIt = () => {
    for (const l of (gl.getStyle() || {}).layers || []) {
      if (l.type === "symbol" && l["source-layer"] === "place") {
        gl.setLayoutProperty(l.id, "visibility", "none");
      }
    }
  };
  try { gl.isStyleLoaded() ? doIt() : gl.once("styledata", doIt); } catch (e) { gl.once("styledata", doIt); }
}

// Kommungränser i egen pane ovanför rut-lagret (overlayPane har z-index 400).
map.createPane("kommunPane");
map.getPane("kommunPane").style.zIndex = 450;
const kommunLayer = L.geoJSON(null, {
  pane: "kommunPane",
  interactive: false,
  style: { color: "#444", weight: 1.5, opacity: 0.5, fill: false },
});
kommunLayer.addTo(map);

// Nätområden i menyn = Energimarknadsinspektionens områdeskoncessioner, via
// SVK:s karttjänst, som streckad linje och klippta vid länsgränsen. EI:s
// koncessioner används i stället för SVK:s egna nätområden eftersom
// nätägarnas polygoner överlappar varandra och ger dubbla linjer.
// Av som standard. Samma pane som kommungränserna, ritas under dem.
const koncessionLayer = L.geoJSON(null, {
  pane: "kommunPane",
  interactive: false,
  style: { color: "#222", weight: 1.5, opacity: 0.8, dashArray: "7 5", fill: false },
});

const layersControl = L.control.layers(baseLayers, {
  "Kommungränser": kommunLayer,
  "Nätområden": koncessionLayer,
}).addTo(map);

// ===== Opacitet-sektion inne i lagerväljar-menyn =====
// (100 % = helt täckande, 0 % = osynlig — opacitet, inte transparens)
{
  const listEl = layersControl.getContainer().querySelector(".leaflet-control-layers-list");
  const sep = document.createElement("div");
  sep.className = "leaflet-control-layers-separator";
  listEl.appendChild(sep);
  const div = document.createElement("div");
  div.className = "opacitet-sektion";
  div.innerHTML = `
    <h4>Opacitet</h4>
    <div class="t-row">
      <div class="t-label"><span>Rutor</span><span class="t-val" id="op-cells-val">75 %</span></div>
      <input type="range" id="op-cells" min="0" max="100" step="5" value="75">
    </div>
    <div class="t-row">
      <div class="t-label"><span>Kommungränser</span><span class="t-val" id="op-kommun-val">50 %</span></div>
      <input type="range" id="op-kommun" min="0" max="100" step="5" value="50">
    </div>
    <div class="t-row">
      <div class="t-label"><span>Nätområden</span><span class="t-val" id="op-nat-val">80 %</span></div>
      <input type="range" id="op-nat" min="0" max="100" step="5" value="80">
    </div>
  `;
  listEl.appendChild(div);
}

const statusEl = document.getElementById("status");
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
}

// ===== Lazy geojson-laddning (file://-vänlig) =====
const pendingLoads = {};
function loadGeo(key) {
  if (window.GEOJSON && window.GEOJSON[key]) {
    return Promise.resolve(window.GEOJSON[key]);
  }
  if (pendingLoads[key]) return pendingLoads[key];
  pendingLoads[key] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `data/${key}.js`;
    s.async = true;
    s.onload = () => {
      if (window.GEOJSON && window.GEOJSON[key]) resolve(window.GEOJSON[key]);
      else reject(new Error(`Filen data/${key}.js registrerade ingen data`));
    };
    s.onerror = () => reject(new Error(`Kunde inte ladda data/${key}.js`));
    document.head.appendChild(s);
  });
  return pendingLoads[key];
}

let currentLayer = null;
let currentData = null;  // { data, year, category, prognos } för statusraden

function visaLagerStatus() {
  if (!currentData) return;
  const { data, year, category, prognos } = currentData;
  const titel = SCHEMA[prognos][category].titel;
  const total = data.features.length;
  if (legendFilter.valda.size === 0) {
    setStatus(`${total} rutor — ${year} ${category} (${titel})`);
    return;
  }
  const synliga = data.features.filter(
    (f) => !arDold(bandIndexFor(f, prognos, category))
  ).length;
  setStatus(`${synliga} av ${total} rutor visas — ${year} ${category} (${titel})`);
}

function laesValda() {
  return {
    year: document.querySelector('input[name="year"]:checked').value,
    category: document.querySelector('input[name="category"]:checked').value,
    prognos: document.querySelector('input[name="prognos"]:checked').value,
  };
}

// Löpnummer per anrop: om användaren byter val medan data laddas ska det
// äldre anropet inte lägga till sitt lager när laddningen väl är klar.
let laddSekvens = 0;

async function laddaLager() {
  const seq = ++laddSekvens;
  const { year, category, prognos } = laesValda();
  const key = `${year}_${category}`;
  ritaLegend(prognos, category);

  if (prognos !== "eb" && year === "2023") {
    if (currentLayer) { map.removeLayer(currentLayer); currentLayer = null; }
    currentData = null;
    setStatus("Tillkommande visas mot 2023 som referens — välj 2030 eller 2040.", true);
    return;
  }

  if (currentLayer) {
    map.removeLayer(currentLayer);
    currentLayer = null;
  }

  setStatus(`Laddar ${year} ${category}…`);
  try {
    const data = await loadGeo(key);
    if (seq !== laddSekvens) return;  // ett nyare val har tagit över
    // Ingen popup i den här versionen: rutorna är inte klickbara, så
    // kartan kan dras och zoomas var som helst.
    currentLayer = L.geoJSON(data, {
      style: styleFn(prognos, category),
      interactive: false,
    }).addTo(map);
    sattRutOpacitet();
    currentData = { data, year, category, prognos };
    visaLagerStatus();
  } catch (e) {
    if (seq !== laddSekvens) return;
    setStatus(e.message, true);
    console.error(e);
  }
}

document.querySelectorAll("#control-panel input[type=radio]").forEach((el) => {
  el.addEventListener("change", laddaLager);
});

// Rita om rutkanterna när zoomen passerar tröskeln mellan kantlägena
let senasteKantlage = null;
map.on("zoomend", () => {
  const nu = map.getZoom() >= KANT_ZOOM;
  if (senasteKantlage === nu) return;
  senasteKantlage = nu;
  if (currentLayer) {
    const { category, prognos } = laesValda();
    currentLayer.setStyle(styleFn(prognos, category));
  }
});

// ===== Opacitet-sliders (värde = opacitet: 100 % = helt täckande) =====
const cellSlider = document.getElementById("op-cells");
const cellVal = document.getElementById("op-cells-val");
cellSlider.addEventListener("input", () => {
  cellOpacity = cellSlider.value / 100;
  cellVal.textContent = `${cellSlider.value} %`;
  uppdateraLegendOpacitet();
  // En CSS-egenskap på hela lagret — inget setStyle över ~8000 rutor.
  sattRutOpacitet();
});

const kommunSlider = document.getElementById("op-kommun");
const kommunVal = document.getElementById("op-kommun-val");
kommunSlider.addEventListener("input", () => {
  kommunVal.textContent = `${kommunSlider.value} %`;
  kommunLayer.setStyle({ opacity: kommunSlider.value / 100 });
});

const natSlider = document.getElementById("op-nat");
const natVal = document.getElementById("op-nat-val");
natSlider.addEventListener("input", () => {
  natVal.textContent = `${natSlider.value} %`;
  koncessionLayer.setStyle({ opacity: natSlider.value / 100 });
});

// ===== Ortnamn, kommungränser och koncessioner (lazy, samma mönster som rutdatan) =====
// OBS: anropen måste ligga här, efter att loadGeo och pendingLoads deklarerats.
loadGeo("ortnamn")
  .then((data) => {
    ortnamnData = data;
    ritaOrtnamn();
    // Släck bakgrundskartans egna ortnamn först när våra syns — ett fel här
    // ska inte ge en karta helt utan ortnamn.
    Object.values(baseLayers).forEach(slackBakgrundensOrtnamn);
    map.on("baselayerchange", (e) => slackBakgrundensOrtnamn(e.layer));
  })
  .catch((e) => console.error("Ortnamn kunde inte laddas:", e));

loadGeo("kommungranser")
  .then((data) => kommunLayer.addData(data))
  .catch((e) => console.error("Kommungränser kunde inte laddas:", e));

// Koncessionerna laddas först när lagret tänds
map.on("overlayadd", (e) => {
  if (e.layer !== koncessionLayer || koncessionLayer.getLayers().length) return;
  loadGeo("koncessioner")
    .then((data) => koncessionLayer.addData(data))
    .catch((err) => { console.error("Koncessioner kunde inte laddas:", err); setStatus(err.message, true); });
});

laddaLager();
