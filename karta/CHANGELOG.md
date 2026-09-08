# Ändringslogg

## v1.2
- Legenden är klickbar och fungerar som filter: klick på ett intervall visar bara det. Fler klick lägger till eller tar bort intervall ur urvalet; när det sista tas bort visas allt igen.
- "Visa alla"-knapp i legenden när ett urval är aktivt. Statusraden visar hur många rutor som visas.
- Bortfiltrerade rutor är varken synliga eller klickbara. Urvalet behålls när man byter år, men nollställs vid byte av prognos eller kategori.
- Legendrader kan nås med tangentbord (Tab, Enter/Mellanslag).
- CSS- och JS-filerna har versionsmärkning i länkarna (`?v=1.2.1`) så att webbläsare inte kör gammal kod ur cachen efter en uppdatering. Bumpa numret vid varje ändring.
- Rutornas genomskinlighet läggs på hela lagret i stället för på varje ruta. Med genomskinlighet per ruta lade sig kantens färg ovanpå fyllningen, och grannrutors kanter ovanpå varandra, vilket gav en synlig mörkare ram runt varje ruta. Opacitetsreglaget blev samtidigt direkt, eftersom det nu ändrar en CSS-egenskap i stället för att räkna om stilen för 8 000 rutor.
- Biblioteken (Leaflet 1.9.4, MapLibre GL 4.7.1, maplibre-gl-leaflet 0.1.4) ligger nu lokalt i `vendor/` i stället för att hämtas från unpkg. Kartan är därmed oberoende av att CDN:en är uppe, och ingen tredje part kan byta ut koden i efterhand. Filerna verifierades byte-identiska mellan unpkg och jsdelivr. Se `vendor/README.md` för hur man uppdaterar.
- Datafilerna får samma versionsmärkning som css och js. Tidigare kunde webbläsaren servera gamla datafiler ur cachen efter en datauppdatering, eftersom bara css och js var versionsmärkta. Bumpa `?v=` i index.html vid varje data- eller kodändring.
- Rutor som saknar värde mot basåret markeras med `null` i datafilerna i stället för talet 10 000 000. Sentinelvärdet var inte säkert: den största verkliga procentsiffran i datat (278 152 % i en transportruta i Årjäng 2040) ligger bara 36 gånger under det, och en kollision hade tyst ritat rutan som "Ny bebyggelse" i stället för som den kraftigaste ökningen. Appen läser båda formaten, så äldre datafiler fungerar fortfarande.
- Transportlagrets flaggade rutor heter "Ny laddinfra" i legenden, inte "Ny bebyggelse" — samma begrepp som originalappen använder. Flaggan betyder att rutan saknade värde basåret 2023, vilket för transport är nytillkommen laddinfrastruktur.
- Transportrutor med flaggan ritas streckade som övriga kategorier. Tidigare ritades de i hel basfärg, vilket gjorde 4 500 av 6 319 rutor identiska med bandet "0 — 0,2" samtidigt som legenden visade en streckad ruta.
- Ortnamn ritas ovanpå rutorna. Rutlagret täckte tidigare bakgrundskartans ortnamn. Namnen kommer från OpenStreetMap (`karta/data/ortnamn.js`, 1 985 orter i Värmland) och ritas som HTML-etiketter med vit kontur i en egen pane ovanför rutorna, med enkel krockhantering så att namn inte skrivs över varandra. Bakgrundskartans egna ortnamn släcks samtidigt, men först när våra syns. Visas efter zoomnivå: stad från 7, tätort 8, by 10, stadsdel 11, småort 12.
- Zoomknapparna (+ och –) flyttade till övre högra hörnet och något förstorade. De låg tidigare kvar på Leaflets standardplats uppe till vänster, dolda bakom kontrollpanelen, så kartan gick bara att zooma med mushjul eller pekskärm.
- Lagret "Områdeskoncessioner" heter "Nätområden" i menyn (samma data: EI:s koncessionsområden via SVK).
- Kolon borttaget efter rubrikerna i kontrollpanelen.
- Rutkanten är 2 px bred. Rutnätet är ritat i SWEREF99 och ligger 0,5–2,8° snett mot skärmens axlar, så varje kant är en svagt lutande linje. En tunnare linje delas då av kantutjämningen över två pixelrader och tappar styrka på sina ställen; uppmätt når en 2 px-kant full kantfärg längs hela sin längd medan en 1 px-kant gör det bara delvis.
- Rutkanten ritas i en mörkare ton av rutans egen färg och är nu exakt lika på alla fyra sidor. Tidigare ritades kanten genomskinlig, och en kant som delas med en granne ritades två gånger och blev mörkare än en kant utan granne. Kanten syns från zoom 10; under det är rutorna bara några pixlar breda och ritas sömlöst.
- Ingen popup på rutorna i den här versionen. Rutorna är inte klickbara.
- Logotyper för Region Värmland och RISE nere till höger, hämtade som SVG från respektive organisations webbplats.
- Färger enligt Region Värmlands grafiska profil: mörkblå (total), gul (bostäder), röd (industri och bygg), lila (offentlig och privat sektor) och grön (transport), med toner 100/80/60/40 % för de fyra intervallen. Reglage och knappar i mörkblått.
- Nytt valbart lager "Områdeskoncessioner" (streckad linje) i lagerväljaren, med eget opacitetsreglage. Energimarknadsinspektionens koncessionsområden via Svenska kraftnäts karttjänst, filtrerade till Värmland och klippta vid länsgränsen. Av som standard, laddas först när det tänds. (SVK:s egna nätområden valdes bort eftersom nätägarnas polygoner överlappar varandra och ger dubbla linjer.)
- Valet "Län: Värmland" är borttaget ur panelen (bara ett alternativ fanns).
- Kategorin "Jordbruk och skogsbruk" är borttagen som eget lager (ingår i Total). Datafilerna för kategorin är borttagna ur v1.2.
- Fix: legenden för Effektbehov (MW) hade en rad "Ny bebyggelse" som aldrig kunde tändas (flaggvärdet finns bara i de tillkommande fälten). Raden är borttagen. I de tillkommande vyerna ligger "Ny bebyggelse" nu sist, efter "< 0", som i gamla appen.
- Fix: byter man år/kategori medan data fortfarande laddas kunde det gamla lagret läggas ovanpå det nya. Nu vinner alltid det senaste valet.

## v1.1
- Utgångsversion.
