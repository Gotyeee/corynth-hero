#!/usr/bin/env node
/**
 * Corynth deploy:
 *   1. Bump cache-busting `?v=…` query strings on every JS/CSS reference in HTML
 *   2. Run `wrangler deploy`
 *   3. Optionally purge the Cloudflare CDN cache (if CF_API_TOKEN + CF_ZONE_ID
 *      are set in the env)
 *
 * Why: every visitor's browser and the CDN cache JS/CSS aggressively. Bumping
 * the query string changes the URL, so caches treat it as a brand-new file.
 * No more "why is the old version still showing".
 */

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const ROOT = __dirname;

// Files we treat as cache-busted assets. Every <script src="…"> and
// <link href="…"> that points at one of these gets a fresh ?v= each deploy.
const BUSTED = [
  'assets/cart.js',
  'assets/styles.css',
  'assets/colors_and_type.css',
  'product.js',
];

function timestamp() {
  // YYYYMMDD-HHMMSS in UTC. Sortable, monotonic, no special chars.
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) +
         '-' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds());
}

function bumpHtml(version) {
  const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  let touched = 0;
  for (const file of htmls) {
    const p = path.join(ROOT, file);
    let html = fs.readFileSync(p, 'utf8');
    const before = html;
    for (const asset of BUSTED) {
      // Match the asset path + optional existing ?v=… in src/href attrs.
      // Captures: 1=attr, 2=quote, 3=optional ./ prefix
      const re = new RegExp(
        '(src|href)=(["\\\'])(\\.\\/)?' + asset.replace(/[.]/g, '\\.') +
        '(\\?v=[^"\\\']*)?\\2',
        'g'
      );
      html = html.replace(re, (_, attr, q, dot) => {
        return `${attr}=${q}${dot || ''}${asset}?v=${version}${q}`;
      });
    }
    if (html !== before) {
      fs.writeFileSync(p, html);
      touched++;
    }
  }
  return touched;
}

async function purgeCloudflareCache() {
  const token  = process.env.CF_API_TOKEN;
  const zoneId = process.env.CF_ZONE_ID;
  if (!token || !zoneId) {
    console.log('• Skipping CDN purge — set CF_API_TOKEN and CF_ZONE_ID to enable.');
    return;
  }
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
    }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) {
    console.error('✗ CDN purge failed:', JSON.stringify(j));
    process.exit(1);
  }
  console.log('✓ CDN cache purged.');
}

(async () => {
  const version = timestamp();
  console.log(`• Deploy version: ${version}`);

  const touched = bumpHtml(version);
  console.log(`• Bumped ?v= in ${touched} HTML file(s).`);

  console.log('• Running wrangler deploy…');
  cp.execSync('npx wrangler deploy', { stdio: 'inherit', cwd: ROOT });

  await purgeCloudflareCache();

  console.log('✓ Deploy complete.');
})().catch((err) => {
  console.error('✗ Deploy failed:', err.message || err);
  process.exit(1);
});
