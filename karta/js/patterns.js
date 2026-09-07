"use strict";

// SVG-patterns för Leaflet-kartan: hatch (diagonalt streck) för "Ny bebyggelse"
// och dot (prickigt) för negativa värden. Speglar gamla appens patterns.js.

window.MAP_PATTERNS = (function () {
  const ns = "http://www.w3.org/2000/svg";
  const cache = new Set();

  function colorToId(c) {
    return (c || "transparent").replace(/[^a-zA-Z0-9]/g, "_");
  }

  function getDefs() {
    // Leaflet SVG-renderer skapar en <svg> inom .leaflet-container.
    const svg = document.querySelector(".leaflet-container svg");
    if (!svg) return null;
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(ns, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    return defs;
  }

  function buildHatchPattern(baseColor, id) {
    const pat = document.createElementNS(ns, "pattern");
    pat.setAttribute("id", id);
    pat.setAttribute("width", "10");
    pat.setAttribute("height", "10");
    pat.setAttribute("patternUnits", "userSpaceOnUse");
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("width", "10");
    rect.setAttribute("height", "10");
    rect.setAttribute("fill", baseColor || "transparent");
    const line = document.createElementNS(ns, "path");
    line.setAttribute("d", "M0,0 L10,10");
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "0.75");
    pat.appendChild(rect);
    pat.appendChild(line);
    return pat;
  }

  function buildDotPattern(baseColor, id) {
    const pat = document.createElementNS(ns, "pattern");
    pat.setAttribute("id", id);
    pat.setAttribute("width", "8");
    pat.setAttribute("height", "8");
    pat.setAttribute("patternUnits", "userSpaceOnUse");
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("width", "8");
    rect.setAttribute("height", "8");
    rect.setAttribute("fill", baseColor || "transparent");
    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", "3");
    circle.setAttribute("cy", "3");
    circle.setAttribute("r", "1.05");
    circle.setAttribute("fill", "black");
    pat.appendChild(rect);
    pat.appendChild(circle);
    return pat;
  }

  // Returnerar en SVG-fill-string (typ "url(#hatch-_296633)").
  // Skapar pattern i Leaflets SVG <defs> om det inte finns redan.
  function fill(type, baseColor) {
    const id = `${type}-${colorToId(baseColor)}`;
    if (cache.has(id)) return `url(#${id})`;
    const defs = getDefs();
    if (!defs) {
      // SVG inte skapad än — fall tillbaka på basfärgen.
      return baseColor || "transparent";
    }
    const builder = type === "hatch" ? buildHatchPattern : buildDotPattern;
    defs.appendChild(builder(baseColor, id));
    cache.add(id);
    return `url(#${id})`;
  }

  function reset() {
    cache.clear();
  }

  return { fill, reset };
})();
