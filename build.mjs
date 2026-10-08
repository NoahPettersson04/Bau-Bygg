#!/usr/bin/env node
// Bygger webbplatsen till dist/. Kräver bara Node 18 eller senare, inga paket.
//
//   node build.mjs           bygger dist/
//   node build.mjs --serve   bygger och startar förhandsvisning på http://localhost:4173
//   DEMO=1 node build.mjs    bygger i demoläge oavsett inställningen i content/site.mjs
//
// Mallspråk i src/: {{> namn}} tar in src/partials/namn.html, {{site.a.b}} skriver ett värde
// (HTML-escapat), {{{site.a.b}}} skriver det oescapat, {{#demo}}…{{/demo}} visas bara i demoläge,
// {{^demo}}…{{/demo}} bara i skarpt läge, {{#if site.a.b}}…{{/if}} visas när värdet är sant och
// {{^if site.a.b}}…{{/if}} när det är tomt, och {{tag site.epost.exempel Exempel}} skriver en gul
// etikett i demoläge när värdet är sant.

import { cp, mkdir, rm, writeFile, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site as config } from './content/site.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const site = { ...config, demoMode: process.env.DEMO === '1' ? true : config.demoMode };

const pages = [
  { src: 'index.html', out: 'index.html', path: '', nav: 'start',
    title: `Plåtslageri som underentreprenör i Stockholm – ${site.kortnamn}`,
    description: `Byggnadsplåtslagare i ${site.ort}. Underentreprenör åt plåtslagerier och byggföretag i Stockholm: falsade tak, bandtäckning, takavvattning och tätskikt. Medlem i ${site.bransch.namn}.` },
  { src: 'integritetspolicy.html', out: 'integritetspolicy/index.html', path: 'integritetspolicy/', nav: 'integritet',
    title: `Integritetspolicy – ${site.namn}`,
    description: `Så behandlar ${site.namn} personuppgifter som lämnas via formuläret på webbplatsen.` },
  { src: '404.html', out: '404.html', path: '404.html', absolute: true, noSitemap: true,
    title: `Sidan finns inte – ${site.namn}`,
    description: 'Sidan du letade efter finns inte.' }
];

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lookup = (ctx, keyPath) => keyPath.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);

const partials = {};
async function partial(name) {
  if (!partials[name]) partials[name] = await readFile(path.join(src, 'partials', name + '.html'), 'utf8');
  return partials[name];
}

async function render(template, ctx) {
  let out = template;
  // Partials (kan själva innehålla mallkod)
  for (const m of out.matchAll(/\{\{>\s*([\w-]+)\s*\}\}/g)) out = out.replace(m[0], await partial(m[1]));
  // Villkor för demoläge
  out = out.replace(/\{\{#demo\}\}([\s\S]*?)\{\{\/demo\}\}/g, (_, inner) => (ctx.demo ? inner : ''));
  out = out.replace(/\{\{\^demo\}\}([\s\S]*?)\{\{\/demo\}\}/g, (_, inner) => (ctx.demo ? '' : inner));
  // Allmänna villkor på ett värde
  out = out.replace(/\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, keyPath, inner) => (lookup(ctx, keyPath) ? inner : ''));
  out = out.replace(/\{\{\^if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, keyPath, inner) => (lookup(ctx, keyPath) ? '' : inner));
  // Etiketter: {{tag site.epost.exempel Exempel}}
  out = out.replace(/\{\{tag\s+([\w.]+)\s+([^}]+?)\s*\}\}/g, (_, keyPath, label) => (
    ctx.demo && lookup(ctx, keyPath) ? ` <span class="tag">${esc(label)}</span>` : ''
  ));
  // Värden
  out = out.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, keyPath) => String(lookup(ctx, keyPath) ?? ''));
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, keyPath) => {
    const v = lookup(ctx, keyPath);
    if (v === undefined) throw new Error(`Okänt värde i mallen: {{${keyPath}}}`);
    return esc(v);
  });
  return out;
}

function relFrom(pagePath) {
  const depth = pagePath.split('/').filter(Boolean).length;
  return depth ? '../'.repeat(depth) : '';
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

  const base = site.url.replace(/\/$/, '') + site.basePath;
  const year = new Date().getFullYear();
  const ogImage = base + 'assets/img/og.jpg';
  // Strukturerad data för startsidan, byggd som riktig JSON så att inga HTML-entiteter smyger in.
  const ldJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: site.namn,
    url: base,
    image: ogImage,
    telephone: site.telefon.lank,
    email: site.epost.adress,
    vatID: site.momsnr,
    address: { '@type': 'PostalAddress', addressLocality: site.ort, addressRegion: site.lan, addressCountry: 'SE' },
    foundingDate: String(site.grundat),
    areaServed: { '@type': 'AdministrativeArea', name: site.lan },
    memberOf: { '@type': 'Organization', name: site.bransch.namn, url: site.bransch.url },
    knowsAbout: ['Byggnadsplåtslageri', 'Falsade plåttak', 'Bandtäckning', 'Takavvattning', 'Tätskikt']
  }).replace(/<\//g, '<\\/');

  for (const page of pages) {
    const rel = page.absolute ? site.basePath : relFrom(page.path);
    const canonical = base + (page.absolute ? '' : page.path);
    const ctx = {
      site, page, rel, year, base, ogImage, ldJson, canonical,
      demo: site.demoMode,
      demoAttr: site.demoMode ? 'true' : 'false',
      // Felsidan ska inte indexeras och har ingen egen adress, därför noindex i stället för canonical.
      canonicalTag: page.noSitemap
        ? '<meta name="robots" content="noindex">'
        : `<link rel="canonical" href="${canonical}">`,
      // Utan JavaScript postas formuläret hit: formulärtjänsten om en är angiven, annars e-post.
      formAction: site.formEndpoint || 'mailto:' + site.epost.adress
    };
    const html = await render(await readFile(path.join(src, page.src), 'utf8'), ctx);
    const full = path.join(dist, page.out);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, html);
  }

  const urls = pages.filter((p) => !p.noSitemap).map((p) => `  <url><loc>${base}${p.path}</loc></url>`);
  await writeFile(path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  await writeFile(path.join(dist, 'robots.txt'),
    site.demoMode ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
  await writeFile(path.join(dist, '.nojekyll'), '');
  if (site.domain) await writeFile(path.join(dist, 'CNAME'), site.domain + '\n');

  console.log(`Byggde ${pages.length} sidor till ${path.relative(process.cwd(), dist) || '.'}/ (${site.demoMode ? 'DEMOLÄGE' : 'skarpt läge'})`);
  if (!site.demoMode) {
    const kvar = [];
    if (site.telefon.bekraftas) kvar.push(`Telefonnumret ${site.telefon.visning} är inte bekräftat av företaget (telefon.bekraftas)`);
    if (site.epost.exempel) kvar.push(`E-postadressen ${site.epost.adress} är ett antagande (epost.exempel)`);
    if (!site.formEndpoint) kvar.push('Ingen formEndpoint: formuläret öppnar besökarens e-postprogram (mailto)');
    if (kvar.length) { console.warn('\nATT STÄMMA AV FÖRE LANSERING:'); kvar.forEach((k) => console.warn('  - ' + k)); console.warn(''); }
    // I GitHub Actions stoppas publiceringen tills telefon och e-post är bekräftade, så att inga
    // obekräftade kontaktuppgifter går live av misstag. Sätt TILLAT_OBEKRAFTAT=1 för att tvinga igenom.
    const stoppar = kvar.filter((k) => !k.startsWith('Ingen formEndpoint'));
    if (stoppar.length && process.env.GITHUB_ACTIONS && !process.env.TILLAT_OBEKRAFTAT) {
      console.error('Publiceringen stoppas tills uppgifterna ovan är bekräftade (telefon.bekraftas och epost.exempel satta till false i content/site.mjs).');
      process.exitCode = 1;
    }
  }
}

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json'
};

function serve(port = 4173) {
  createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.normalize(path.join(dist, pathname));
    if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
    let status = 200;
    try {
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }); res.end(); return; }
        file = path.join(file, 'index.html'); await stat(file);
      }
    } catch { file = path.join(dist, '404.html'); status = 404; }
    try {
      res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); }
  }).listen(port, () => console.log(`Förhandsvisning: http://localhost:${port}/`));
}

await build();
if (process.argv.includes('--serve')) serve();
