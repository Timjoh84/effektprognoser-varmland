"use strict";

// Färgschema + intervall för effektprognoser-kartan.
// Detta är en trogen kopia av gamla appens boundaries_colors.js + patterns.js.
// Legendordning som i gamla appen: "Ny bebyggelse" sist, och inte alls under
// Effektbehov (MW).
// Varje prognos (eb/ebd/ebp/ead/eap) har ett intervall + färgpalett per
// kategori (raps). Sentinel-värdet 10_000_000 (NY_BEBYGGELSE) ritas som
// diagonalt streckat mönster ("hatch"). Negativa värden i ebd/ebp/ead/eap
// (för icke-bostäder, icke-transport) ritas som prickigt mönster ("dot").

window.SCHEMA = (function () {
  const NY_BEBYGGELSE = 10_000_000 - 1;  // tröskel: värden > detta = hatch

  // Färgpaletter per kategori (mörkast först → ljusast sist, 4 färger).
  // Hämtade ordagrant från boundaries_colors.js.
  const PALETTE = {
    total:                       ["#060807", "#163019", "#296633", "#599E66"],
    bostader:                    ["#3E2C13", "#C46737", "#EFA327", "#FEE292"],
    industri_och_bygg:           ["#4B1216", "#961B1E", "#ED1C29", "#F0675E"],
    offentlig_och_privat_sektor: ["#10101D", "#393777", "#7E7DBC", "#BCBADD"],
    transport:                   ["#091C1D", "#155384", "#068AB6", "#7BACAE"],
  };

  // Bygger ett intervall med tröskel + etikett + ev. specialstil
  function band(min, max, label, style = null) {
    return { min, max, label, style };
  }

  // Effektbehov (eb) — samma intervall för alla kategorier, bara färger varierar.
  function ebSchema(katpalette) {
    return {
      titel: "Effektbehov (MW)",
      base: null,
      format: (v) => `${v.toFixed(2)} MW`,
      // Ingen "Ny bebyggelse" här: eb är ett absolut värde och får aldrig
      // flaggvärdet (det sätts bara i de tillkommande fälten).
      bands: [
        band(10,            Infinity,  "> 10",          katpalette[0]),
        band(5,             10,        "5 — 10",        katpalette[1]),
        band(0.5,           5,         "0,5 — 5",       katpalette[2]),
        band(-Infinity,     0.5,       "< 0,5",         katpalette[3]),
      ],
    };
  }

  // Tillkommande effektbehov (ebd) — MW
  function ebdSchema(kat, palette) {
    if (kat === "bostader") {
      return {
        titel: "Tillkommande effektbehov (MW)",
        base: "eb",
        format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(2)} MW`),
        bands: [
          band(0,             NY_BEBYGGELSE, "> 0",      palette[0]),
          band(-0.01,         0,        "-0,01 — 0",     palette[1]),
          band(-0.1,          -0.01,    "-0,1 — -0,01",  palette[2]),
          band(-Infinity,     -0.1,     "< -0,1",        palette[3]),
          band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"),
        ],
      };
    }
    const negativStil = (kat === "transport") ? null : "dot";
    const bands = [
      band(2.5,           NY_BEBYGGELSE, "> 2,5",    palette[0]),
      band(0.8,           2.5,      "0,8 — 2,5",     palette[1]),
      band(0.2,           0.8,      "0,2 — 0,8",     palette[2]),
      band(0,             0.2,      "0 — 0,2",       palette[3]),
    ];
    if (kat !== "transport") {
      bands.push(band(-Infinity, 0, "< 0", "dot"));
    }
    bands.push(band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"));
    return {
      titel: "Tillkommande effektbehov (MW)",
      base: "eb",
      format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(2)} MW`),
      bands,
    };
  }

  // Tillkommande effektbehov procent (ebp) — %
  function ebpSchema(kat, palette) {
    if (kat === "bostader") {
      return {
        titel: "Tillkommande effektbehov (%)",
        base: "eb",
        format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(1)} %`),
        bands: [
          band(0,             NY_BEBYGGELSE, "> 0 %",    palette[0]),
          band(-2,            0,        "-2 — 0 %",      palette[1]),
          band(-4,            -2,       "-4 — -2 %",     palette[2]),
          band(-Infinity,     -4,       "< -4 %",        palette[3]),
          band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"),
        ],
      };
    }
    // Industri har snävare skala (0/10/20/50), offentlig har 0/5/15/25
    let trosklar;
    if (kat === "industri_och_bygg") trosklar = [50, 20, 10, 0];
    else if (kat === "offentlig_och_privat_sektor") trosklar = [25, 15, 5, 0];
    else if (kat === "transport") trosklar = [1600, 800, 200, 0];
    else trosklar = [350, 50, 20, 0];  // total
    const bands = [
      band(trosklar[0],   NY_BEBYGGELSE, `> ${trosklar[0]} %`, palette[0]),
      band(trosklar[1],   trosklar[0],   `${trosklar[1]} — ${trosklar[0]} %`, palette[1]),
      band(trosklar[2],   trosklar[1],   `${trosklar[2]} — ${trosklar[1]} %`, palette[2]),
      band(trosklar[3],   trosklar[2],   `${trosklar[3]} — ${trosklar[2]} %`, palette[3]),
    ];
    if (kat !== "transport") {
      bands.push(band(-Infinity, 0, "< 0 %", "dot"));
    }
    bands.push(band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"));
    return {
      titel: "Tillkommande effektbehov (%)",
      base: "eb",
      format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(1)} %`),
      bands,
    };
  }

  // Tillkommande elanvändning (ead) — MWh
  function eadSchema(kat, palette) {
    if (kat === "bostader") {
      return {
        titel: "Tillkommande elanvändning (MWh)",
        base: "ea",
        format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${Math.round(v).toLocaleString("sv-SE")} MWh`),
        bands: [
          band(0,             NY_BEBYGGELSE, "> 0",       palette[0]),
          band(-25,           0,        "-25 — 0",        palette[1]),
          band(-50,           -25,      "-50 — -25",      palette[2]),
          band(-Infinity,     -50,      "< -50",          palette[3]),
          band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"),
        ],
      };
    }
    let trosklar;
    if (kat === "industri_och_bygg") trosklar = [50000, 5000, 20, 0];
    else trosklar = [10000, 1000, 50, 0];
    const bands = [
      band(trosklar[0],   NY_BEBYGGELSE, `> ${trosklar[0].toLocaleString("sv-SE")}`, palette[0]),
      band(trosklar[1],   trosklar[0],   `${trosklar[1].toLocaleString("sv-SE")} — ${trosklar[0].toLocaleString("sv-SE")}`, palette[1]),
      band(trosklar[2],   trosklar[1],   `${trosklar[2].toLocaleString("sv-SE")} — ${trosklar[1].toLocaleString("sv-SE")}`, palette[2]),
      band(trosklar[3],   trosklar[2],   `${trosklar[3].toLocaleString("sv-SE")} — ${trosklar[2].toLocaleString("sv-SE")}`, palette[3]),
    ];
    if (kat !== "transport") {
      bands.push(band(-Infinity, 0, "< 0", "dot"));
    }
    bands.push(band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"));
    return {
      titel: "Tillkommande elanvändning (MWh)",
      base: "ea",
      format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${Math.round(v).toLocaleString("sv-SE")} MWh`),
      bands,
    };
  }

  // Tillkommande elanvändning procent (eap) — %
  function eapSchema(kat, palette) {
    if (kat === "bostader") {
      return {
        titel: "Tillkommande elanvändning (%)",
        base: "ea",
        format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(1)} %`),
        bands: [
          band(0,             NY_BEBYGGELSE, "> 0 %",    palette[0]),
          band(-2,            0,        "-2 — 0 %",      palette[1]),
          band(-6,            -2,       "-6 — -2 %",     palette[2]),
          band(-Infinity,     -6,       "< -6 %",        palette[3]),
          band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"),
        ],
      };
    }
    let trosklar;
    if (kat === "transport") trosklar = [1600, 800, 200, 0];
    else trosklar = [350, 50, 20, 0];
    const bands = [
      band(trosklar[0],   NY_BEBYGGELSE, `> ${trosklar[0]} %`, palette[0]),
      band(trosklar[1],   trosklar[0],   `${trosklar[1]} — ${trosklar[0]} %`, palette[1]),
      band(trosklar[2],   trosklar[1],   `${trosklar[2]} — ${trosklar[1]} %`, palette[2]),
      band(trosklar[3],   trosklar[2],   `${trosklar[3]} — ${trosklar[2]} %`, palette[3]),
    ];
    if (kat !== "transport") {
      bands.push(band(-Infinity, 0, "< 0 %", "dot"));
    }
    bands.push(band(NY_BEBYGGELSE, Infinity, "Ny bebyggelse", "hatch"));
    return {
      titel: "Tillkommande elanvändning (%)",
      base: "ea",
      format: (v) => (v >= NY_BEBYGGELSE ? "Ny bebyggelse" : `${v >= 0 ? "+" : ""}${v.toFixed(1)} %`),
      bands,
    };
  }

  // Bygg fullt SCHEMA[prognos][kategori]
  const SCHEMA = { eb: {}, ebd: {}, ebp: {}, ead: {}, eap: {} };
  for (const kat of Object.keys(PALETTE)) {
    const p = PALETTE[kat];
    SCHEMA.eb[kat]  = ebSchema(p);
    SCHEMA.ebd[kat] = ebdSchema(kat, p);
    SCHEMA.ebp[kat] = ebpSchema(kat, p);
    SCHEMA.ead[kat] = eadSchema(kat, p);
    SCHEMA.eap[kat] = eapSchema(kat, p);
  }

  return {
    SCHEMA,
    PALETTE,
    NY_BEBYGGELSE,
    // Returnerar bandet ett värde tillhör (eller null om utanför allt).
    bandFor(value, bands) {
      for (const b of bands) {
        if (value >= b.min && value < b.max) return b;
      }
      // Edge-fall (t.ex. Infinity): flaggvärdet hör till hatch-bandet
      return bands.find((b) => b.style === "hatch") || null;
    },
    // För 'transport' i ebd: negativa värden ska behandlas som +0.1
    // (gamla appen gör detta — visar minskning som "lägsta positiva")
    fixTransportNegativ(value, kat, prognos) {
      if (kat !== "transport") return value;
      if (!["ebd", "ebp", "ead", "eap"].includes(prognos)) return value;
      return value < 0 ? 0.1 : value;
    },
  };
})();
