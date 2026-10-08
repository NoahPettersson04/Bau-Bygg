# BauBygg & Plåtslageri AB – webbplats

Webbplats för **BauBygg & Plåtslageri AB** (org.nr 559005-4556) i Upplands Väsby: byggnadsplåtslageri och takarbeten som underentreprenör åt plåtslagerier och byggföretag i Stockholms län. Publiceras på **https://bauplat.se**.

Sajten är statisk: vanlig HTML, CSS och lite JavaScript. Inga ramverk och inga paket att installera. Node (18 eller senare) används bara för att bygga sidorna från mallarna, så att företagsuppgifter och sidhuvud/sidfot finns på ett enda ställe.

## Struktur

```
  build.mjs          Bygger dist/. `node build.mjs --serve` startar förhandsvisning på http://localhost:4173/
  content/site.mjs   Företagsuppgifter och inställningar. Det här är filen man ändrar.
  src/
    index.html       Startsidan (hela sajten i praktiken)
    integritetspolicy.html
    404.html
    partials/        head, header, footer – delas av alla sidor
  assets/            Stilmall, skript, typsnitt, bilder, ikoner. Kopieras till dist/assets
  dist/              Den färdiga webbplatsen (byggs, ligger inte i git)
  .github/workflows/pages.yml   Bygger och publicerar till GitHub Pages vid push till main
  build-artifact.mjs            Enfilsversion i demoläge för förhandsvisning
```

## Ändra innehåll

- **Uppgifter** (telefon, e-post, ort, org.nr, länkar): `content/site.mjs`.
- **Texter**: `src/index.html`. Mallsyntaxen är enkel: `{{site.telefon.visning}}` skriver ett värde, `{{#demo}}…{{/demo}}` visas bara i demoläge, `{{^demo}}…{{/demo}}` bara i skarpt läge.
- **Bilder**: `assets/img/`. Behåll ungefär samma format vid byte: hero 16:9 (2000 px bred, plus en 1200 px-variant), tjänstebilder 4:5, Om oss 4:3, delningsbild `og.jpg` 1200×630.
- **Färger och typsnitt**: variablerna överst i `assets/css/style.css`.

Bygg om med `node build.mjs` och titta med `node build.mjs --serve`. Vid push till `main` bygger GitHub Actions och publicerar automatiskt.

## Att stämma av före lansering

Bygget skriver ut en lista om något av detta kvarstår:

1. **Telefonnumret** 072-371 25 17 kommer från bolagsregister (krafman.se, merinfo.se), inte från företaget. Bekräfta och sätt `telefon.bekraftas: false`.
2. **E-postadressen** info@bauplat.se är ett antagande utifrån domänen. Den måste finnas och läsas av någon. Bekräfta och sätt `epost.exempel: false`.
3. **Formuläret** skickar i dag via besökarens e-postprogram (mailto) eftersom `formEndpoint` är tomt. Det fungerar, men sämre på datorer utan e-postprogram. Rekommenderat: skaffa ett gratis konto hos Formspree eller Web3Forms, klistra in adressen i `formEndpoint`, så skickas förfrågan i bakgrunden och besökaren får en bekräftelse på sidan.

Övrigt som är beslutat i utkastet: gatuadressen visas inte (bara orten), fotona är fria bilder från Unsplash och bör bytas mot egna, kontaktperson namnges inte.

## Lansera på bauplat.se (GitHub Pages)

Engångsinställningar i GitHub-repot (Settings → Pages):

1. **Source**: välj *GitHub Actions*. Pusha till `main` (eller kör workflowen manuellt under Actions) så byggs och publiceras sajten. Den dyker först upp på `https://noahpettersson04.github.io/bau-bygg/`.
2. **Custom domain**: skriv `bauplat.se` och spara. Bocka i *Enforce HTTPS* när valet blir tillgängligt (kan dröja upp till ett dygn efter att DNS pekar rätt).

DNS hos den som har domänen bauplat.se (Loopia, One.com, Binero eller liknande):

| Typ | Namn | Värde |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | noahpettersson04.github.io |

Ta bort eventuella gamla A-poster eller "parkerad sida"-poster för @. Lägg gärna till `www.bauplat.se` som alternativ i Pages-inställningen också, så fungerar både med och utan www. Adresserna ovan är GitHubs i oktober 2026; kontrollera mot [GitHubs dokumentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) om något inte går igenom.

E-post på domänen (info@bauplat.se) påverkas inte av detta, den styrs av MX-posterna.

### Annat webbhotell

`dist/` är en vanlig statisk webbplats. Kör `node build.mjs` och ladda upp innehållet i `dist/` till webbhotellet, eller peka Netlify eller Cloudflare Pages på repot med byggkommandot `node build.mjs` och publiceringsmapp `dist`. På ett Apache-webbhotell läggs `ErrorDocument 404 /404.html` i en `.htaccess`.

## Demoläge

`demoMode: true` i `content/site.mjs` ger en demoremsa, gula etiketter på obekräftade uppgifter, ifyllda exempeluppgifter i formuläret och `noindex`. `DEMO=1 node build.mjs` bygger i demoläge utan att ändra inställningen. `node build-artifact.mjs` bygger en enfilsversion i demoläge för förhandsvisning.

## Bilder

Fotona är fria bilder från Unsplash (Unsplash License: fri att använda kommersiellt, ingen attribution krävs). Byt gärna mot företagets egna foton.

| Fil | Används | Fotograf | Källa |
|---|---|---|---|
| `hero-plattak.jpg`, `hero-plattak-1200.jpg`, `og.jpg` | Hero och delningsbild | Ryunosuke Kikuno | https://unsplash.com/photos/Mu9uo42SXEY |
| `falsat-tak.jpg` | Tjänst: byggnadsplåtslageri | Angelica Teran | https://unsplash.com/photos/BWzbJF9Sclw |
| `tatskikt.jpg` | Tjänst: tak och tätskikt | Yue WU | https://unsplash.com/photos/W6QocDKULQc |
| `koppar-zink.jpg` | Om oss | J A C K | https://unsplash.com/photos/s7L1cF7kl8E |

## Teknik

- Typsnitten Barlow och Barlow Condensed ligger på den egna servern. Inga anrop till Google eller andra tredjeparter, inga kakor. Därför behövs ingen kakbanner.
- Mobilmenyn och FAQ:n är byggda på `details`/`summary` och fungerar utan JavaScript och med tangentbord.
- Hopplänk till innehållet, synlig fokusmarkering, `prefers-reduced-motion` respekteras, strukturerad data (JSON-LD) på startsidan.
- Formuläret har ett dolt fält (`_gotcha`) som fångar enkla spamrobotar.

## Verifierade uppgifter

Bolagsnamn, org.nr, registreringsår 2015 (nuvarande namn sedan 2021), säte Upplands Väsby, F-skatt och moms, SNI 43411 Takarbeten av plåt och bolagsordningens verksamhetsbeskrivning är kontrollerade mot allabolag.se och hitta.se i oktober 2026. Medlemskapet i Plåt & Ventföretagen enligt uppgift från företaget och organisationens medlemsregister. Fördelningen 90 % plåtslageri / 10 % tak och tätskikt enligt uppgift från företaget.
