# Ändringslogg

Versionsnumret motsvarar `?v=` i `index.html`.

## 1.4

- Rutor som saknar värde i basåret markeras med `null` i datafilerna i stället
  för ett sentinelvärde (10 000 000). Det gamla formatet läses fortfarande.
  Se `DATAFORMAT.md`.
- Tredjepartsbiblioteken (Leaflet 1.9.4, MapLibre GL 4.7.1,
  maplibre-gl-leaflet 0.1.4) ligger lokalt i `vendor/` i stället för att
  hämtas från en CDN.
- Datafilerna versionsmärks på samma sätt som css och js, så att en
  datauppdatering inte serveras ur webbläsarens cache.
- Streckade och prickade rutor får samma slags kant som färgade: en mörkare
  ton av den synliga färgen.
- Ny specifikation av dataformatet, `DATAFORMAT.md`.

## 1.3

- Ortnamn från OpenStreetMap ritas ovanpå rutorna, med krockhantering och
  visning efter zoomnivå. Bakgrundskartans egna ortnamn släcks.
- Transportsektorns rutor utan basvärde heter "Ny laddinfra" i legenden och
  ritas streckade som i övriga sektorer. Tidigare ritades de i hel basfärg och
  gick inte att skilja från det lägsta intervallet.
- Zoomknappar synliga uppe till höger. De låg tidigare dolda bakom
  kontrollpanelen.
- Lagret "Områdeskoncessioner" heter "Nätområden" i lagerväljaren.
- Ortnamnen ritas om vid fönsterändring.

## 1.2

- Klickbar legend som filtrerar kartan på ett eller flera intervall, med
  "Visa alla"-knapp och räknare i statusraden. Tangentbordsstöd.
- Färger enligt Region Värmlands grafiska profil, med toner 100/80/60/40 %
  per sektor. Logotyper för Region Värmland och RISE.
- Nytt valbart lager med nätområden (Energimarknadsinspektionens
  områdeskoncessioner via Svenska kraftnäts karttjänst), klippta vid
  länsgränsen och ritade som ett sammanslaget linjenät.
- Rutorna ritas täckande med genomskinligheten på hela lagret, vilket tar bort
  de mörkare skarvar som uppstod när kanter ritades ovanpå varandra.
  Rutkant i en mörkare ton av rutans egen färg från zoomnivå 10.
- Ingen popup på rutorna.
- Legenden för Effektbehov visar inte längre "Ny bebyggelse", som aldrig kunde
  förekomma där. I de tillkommande vyerna ligger raden sist.
- Sektorn jordbruk och skogsbruk visas inte som eget lager (ingår i Total).
  Länvalet är borttaget.
- Versionsmärkning av css och js via `?v=`.
- Fix: snabba byten av år eller sektor under pågående laddning kunde lämna ett
  gammalt lager kvar ovanpå det nya.

## 1.1

- Utgångsversion, baserad på Erik Lindvalls Effektprognoser.se.
