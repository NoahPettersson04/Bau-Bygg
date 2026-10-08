// Företagsuppgifter och inställningar för webbplatsen. Det här är filen man ändrar.
//
// Uppgifter märkta med en kommentar "BEKRÄFTA" kommer från offentliga register eller är
// antaganden, och ska stämmas av med BauBygg innan domänen pekas om.

export const site = {
  namn: 'BauBygg & Plåtslageri AB',
  kortnamn: 'BauBygg',
  tagline: 'Plåtslageri som underentreprenör i Stockholm',

  // Webbplatsens publika adress. Används för canonical-länkar, sitemap och delningsbild.
  url: 'https://bauplat.se',
  // Skrivs till dist/CNAME. Används bara vid publicering från en gren eller på annat webbhotell;
  // på GitHub Pages via Actions styrs domänen av Settings → Pages → Custom domain.
  domain: 'bauplat.se',
  // Sökväg under domänen om webbplatsen inte ligger i roten, t.ex. '/sajt/'. Annars '/'.
  basePath: '/',

  // Demoläge: visar en remsa högst upp, gula etiketter på obekräftade uppgifter och ber
  // sökmotorer att inte indexera. false = skarp webbplats.
  demoMode: false,

  // Formulär. Ange en tjänst som tar emot POST, t.ex. Formspree ('https://formspree.io/f/xxxxxxxx')
  // eller Web3Forms ('https://api.web3forms.com/submit'), och leverantörens namn i formTjanst
  // (nämns i integritetspolicyn). Lämnas formEndpoint tomt öppnar formuläret besökarens
  // e-postprogram med uppgifterna ifyllda, adresserat till epost.adress.
  formEndpoint: '',
  formTjanst: '',

  // BEKRÄFTA: numret kommer från bolagsregister (krafman.se, merinfo.se), inte från företaget.
  telefon: { visning: '072-371 25 17', lank: '+46723712517', bekraftas: true },
  // BEKRÄFTA: adressen är ett antagande utifrån domänen. Måste finnas och läsas av någon.
  epost: { adress: 'info@bauplat.se', exempel: true },

  ort: 'Upplands Väsby',
  lan: 'Stockholms län',
  orgnr: '559005-4556',
  // Momsregistreringsnummer: svenskt format SE + org.nr + 01 (bolaget är momsregistrerat enligt allabolag.se).
  momsnr: 'SE559005455601',
  // Bolaget registrerades 2015. Nuvarande namn sedan 2021. BEKRÄFTA när plåtslageriverksamheten startade.
  grundat: 2015,
  // Datum då integritetspolicyn senast ändrades. Uppdatera vid ändring.
  policyDatum: '8 oktober 2026',

  bransch: { namn: 'Plåt & Ventföretagen', url: 'https://www.pvforetagen.se/' },

  // Foton: fria bilder från Unsplash (Unsplash License). Byt gärna mot egna foton.
  foton: [
    { fil: 'hero-plattak.jpg', plats: 'Hero', fotograf: 'Ryunosuke Kikuno', kalla: 'https://unsplash.com/photos/Mu9uo42SXEY' },
    { fil: 'falsat-tak.jpg', plats: 'Tjänst: byggnadsplåtslageri', fotograf: 'Angelica Teran', kalla: 'https://unsplash.com/photos/BWzbJF9Sclw' },
    { fil: 'tatskikt.jpg', plats: 'Tjänst: tak och tätskikt', fotograf: 'Yue WU', kalla: 'https://unsplash.com/photos/W6QocDKULQc' },
    { fil: 'koppar-zink.jpg', plats: 'Om oss', fotograf: 'J A C K', kalla: 'https://unsplash.com/photos/s7L1cF7kl8E' }
  ]
};
