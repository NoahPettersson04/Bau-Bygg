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

Utan Node och utan att installera något: öppna filen på github.com, klicka på pennan, ändra, välj *Commit changes* direkt till `main`. Fliken *Actions* visar en grön bock när ändringen ligger ute (tar ungefär en minut).

- **Uppgifter** (telefon, e-post, ort, org.nr, länkar): `content/site.mjs`.
- **Texter**: `src/index.html`. Mallsyntaxen är enkel: `{{site.telefon.visning}}` skriver ett värde, `{{#demo}}…{{/demo}}` visas bara i demoläge, `{{^demo}}…{{/demo}}` bara i skarpt läge.
- **Bilder**: `assets/img/`. Behåll ungefär samma format vid byte: hero 16:9 (2000 px bred, plus en 1200 px-variant), tjänstebilder 4:5, Om oss 4:3, delningsbild `og.jpg` 1200×630.
- **Färger och typsnitt**: variablerna överst i `assets/css/style.css`.

Bygg om med `node build.mjs` och titta med `node build.mjs --serve`. Vid push till `main` bygger GitHub Actions och publicerar automatiskt.

## Att stämma av före lansering

**Publiceringen i GitHub Actions stoppar medvetet** tills punkt 1 och 2 är klara, så att inga obekräftade kontaktuppgifter går live av misstag. Bygget skriver ut vad som återstår. (Nödbroms: variabeln `TILLAT_OBEKRAFTAT=1` i workflowen släpper igenom bygget ändå.)

1. **Telefonnumret** 072-371 25 17 kommer från bolagsregister (krafman.se, merinfo.se), inte från företaget. Ring numret, bekräfta med BauBygg och sätt `telefon.bekraftas: false` i `content/site.mjs`.
2. **E-postadressen** info@bauplat.se är ett antagande utifrån domänen. Domänen bauplat.se har i dag (oktober 2026) **inga MX-poster**, alltså ingen e-post alls. Innan lansering måste e-post sättas upp hos Loopia (eller Google Workspace/Microsoft 365) och adressen skapas och läsas av någon. Skicka ett testmejl, bekräfta och sätt `epost.exempel: false`.
3. **Formuläret** skickar i dag via besökarens e-postprogram (mailto) eftersom `formEndpoint` är tomt. Det fungerar, men sämre på datorer utan e-postprogram. Rekommenderat: skaffa ett gratis konto hos Formspree eller Web3Forms, klistra in adressen i `formEndpoint` och leverantörens namn i `formTjanst` (nämns i integritetspolicyn), så skickas förfrågan i bakgrunden och besökaren får en bekräftelse på sidan. Detta stoppar inte bygget.

Övrigt som är beslutat i utkastet: gatuadressen visas inte (bara orten), fotona är fria bilder från Unsplash och bör bytas mot egna, kontaktperson namnges inte. Observera att e-handelslagen (8 §) förväntar sig att ett företag anger geografisk adress på sin webbplats; vill BauBygg följa det fullt ut behöver en post- eller besöksadress läggas till i sidfoten och integritetspolicyn.

## Lansera på bauplat.se (GitHub Pages)

Engångsinställningar i GitHub-repot (Settings → Pages):

1. **Source**: välj *GitHub Actions*. Workflowen som kördes vid första pushen misslyckas i steget *deploy* tills detta är gjort; kör om den under Actions (*Re-run all jobs*) eller pusha igen. Sajten dyker först upp på `https://noahpettersson04.github.io/bau-bygg/` (där ser 404-sidan ostylad ut eftersom den använder absoluta sökvägar för bauplat.se; det rättar sig när domänen är kopplad).
2. **Verifiera domänen** (skyddar mot att någon annan kopplar bauplat.se till sin sida): github.com → Settings → Pages → *Add a domain* → `bauplat.se`. GitHub visar en TXT-post (`_github-pages-challenge-noahpettersson04`) som läggs in hos Loopia. Klicka *Verify* när den slagit igenom.
3. **Custom domain** i repots Settings → Pages: skriv `bauplat.se` (ett enda fält; www behöver inte läggas till, GitHub skickar www.bauplat.se vidare till bauplat.se så snart CNAME-posten nedan finns). Bocka i *Enforce HTTPS* när valet blir tillgängligt (kan dröja upp till ett dygn efter att DNS pekar rätt).

DNS hos Loopia (Kundzon → bauplat.se → DNS-inställningar). Domänen ligger i dag på Loopias namnservrar, och både `@` och `www` har A-poster till Loopias parkeringssida (194.9.94.85 och 194.9.94.86). **Ta bort dem först**, för både `@` och `www`, och lägg sedan in:

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

Adresserna ovan är GitHubs i oktober 2026; kontrollera mot [GitHubs dokumentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) om något inte går igenom. DNS-ändringar slår igenom inom någon timme.

E-post på domänen (info@bauplat.se) påverkas inte av webbplatsens A-poster, den styrs av MX-posterna. I dag finns inga MX-poster alls, se punkt 2 under *Att stämma av före lansering*.

### Annat webbhotell

`dist/` är en vanlig statisk webbplats. Kör `node build.mjs` och ladda upp innehållet i `dist/` till webbhotellet, eller peka Netlify eller Cloudflare Pages på repot med byggkommandot `node build.mjs` och publiceringsmapp `dist`. På ett Apache-webbhotell läggs `ErrorDocument 404 /404.html` i en `.htaccess`. Filen `dist/CNAME` (från `domain` i `content/site.mjs`) används bara vid publicering från en gren eller på annat webbhotell; GitHub Pages via Actions ignorerar den och tar domänen från inställningarna.

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
