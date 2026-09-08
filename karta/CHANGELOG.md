# Ändringslogg

## v1.2
- Legenden är klickbar och fungerar som filter: klick på ett intervall visar bara det. Fler klick lägger till eller tar bort intervall ur urvalet; när det sista tas bort visas allt igen.
- "Visa alla"-knapp i legenden när ett urval är aktivt. Statusraden visar hur många rutor som visas.
- Bortfiltrerade rutor är varken synliga eller klickbara. Urvalet behålls när man byter år, men nollställs vid byte av prognos eller kategori.
- Legendrader kan nås med tangentbord (Tab, Enter/Mellanslag).
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
