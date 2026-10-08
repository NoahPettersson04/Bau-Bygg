#!/usr/bin/env node
// Bygger en enfilsversion av startsidan i demoläge för förhandsvisning (t.ex. som Claude-artefakt):
// kör build.mjs med DEMO=1, bäddar in CSS och JS, byter de självhostade typsnitten mot Google Fonts
// och tar bort dokumentskalet eftersom mottagaren lägger på ett eget.
//
//   node build-artifact.mjs [utfil]      standard: artifact.html

import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(root, 'artifact.html');

execFileSync(process.execPath, [path.join(root, 'build.mjs')], { env: { ...process.env, DEMO: '1' }, stdio: 'inherit' });

const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
let css = await readFile(path.join(root, 'assets/css/style.css'), 'utf8');
const js = await readFile(path.join(root, 'assets/js/site.js'), 'utf8');
css = css.replace(/^@font-face \{.*\}\n/gm, '');

const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/<script src="assets\/js\/site\.js" defer><\/script>/, `<script>\n${js}\n</script>`)
  .replace(/href="integritetspolicy\/"/g, 'href="#kontakt"');

const page = `<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">
<style>
${css}
</style>
${body}`;

await writeFile(out, page);
console.log(`Skrev ${path.relative(process.cwd(), out)} (${(page.length / 1024).toFixed(1)} kB)`);
