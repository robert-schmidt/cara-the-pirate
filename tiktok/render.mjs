// Shared renderer for the vertical cuts. make.mjs (the long story) and shorts.mjs (short hooks)
// both describe their shots and hand them to render() below.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

export const ROOT = new URL('..', import.meta.url).pathname;
export const MEDIA = ROOT + 'media/';
export const ASSETS = ROOT + 'tiktok/assets/';
export const OUT = ROOT + 'tiktok/out/';
export const W = 1080;
export const H = 1920;
export const FPS = 30;

const run = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const probe = (file) =>
  execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])
    .toString().trim().split(',').map(Number);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const N = (d) => Math.round(d * FPS);

const FONTS = ROOT + 'node_modules/@fontsource-variable/';
const css = `
@font-face { font-family: Lit; src: url(${FONTS}literata/files/literata-latin-opsz-normal.woff2); font-weight: 200 900; }
@font-face { font-family: Lit; src: url(${FONTS}literata/files/literata-latin-opsz-italic.woff2); font-weight: 200 900; font-style: italic; }
@font-face { font-family: Hand; src: url(${FONTS}shantell-sans/files/shantell-sans-latin-full-normal.woff2); font-weight: 300 800; }
html, body { margin: 0; width: ${W}px; height: ${H}px; background: transparent; }
.box { position: absolute; left: 64px; right: 60px; top: 250px; }
.box.low { top: auto; bottom: 480px; right: 150px; }
.big, .sub, .quote, .line { text-wrap: balance; }
.item { display: block; }
.off { visibility: hidden; }
.big { font: 800 78px/1.34 Lit; letter-spacing: -0.02em; color: #1c2b36; }
.sub { margin-top: 14px; font: 600 50px/1.5 Hand; color: #b52a6c; }
.big span, .sub span {
  background: #edf2f1; padding: 2px 22px 8px; border-radius: 14px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  box-shadow: 0 8px 26px rgb(0 0 0 / 0.28);
}
.scrim { position: absolute; inset: 0 0 auto; height: 860px; background: linear-gradient(rgb(28 43 54 / 0.85), rgb(28 43 54 / 0.55) 60%, transparent); }
.quote { font: italic 800 86px/1.1 Lit; letter-spacing: -0.02em; color: #fff; text-shadow: 0 4px 24px rgb(0 0 0 / 0.5); }
.sig { margin-top: 22px; font: 600 54px/1.2 Hand; color: #f2b27c; text-shadow: 0 3px 16px rgb(0 0 0 / 0.5); }
.endbox { position: absolute; left: 70px; right: 70px; top: 190px; text-align: center; color: #1c2b36; }
.title { font: 800 116px/1 Lit; letter-spacing: -0.035em; }
.line { margin: 26px auto 0; max-width: 16em; font: 500 50px/1.3 Lit; }
.cta { margin-top: 26px; font: 700 54px/1.2 Hand; color: #b52a6c; }
`;

function html(shot, visible) {
  const items = shot.text.map((t, i) => {
    const cls = i === visible ? '' : ' off';
    if (t.big) return `<div class="item big${cls}"><span>${esc(t.big)}</span></div>`;
    if (t.sub) return `<div class="item sub${cls}"><span>${esc(t.sub)}</span></div>`;
    if (t.quote) return `<div class="item quote${cls}">“${esc(t.quote)}”</div>`;
    if (t.sig) return `<div class="item sig${cls}">${esc(t.sig)}</div>`;
    if (t.title) return `<div class="item title${cls}">${esc(t.title)}</div>`;
    if (t.line) return `<div class="item line${cls}">${esc(t.line)}</div>`;
    if (t.cta) return `<div class="item cta${cls}">${esc(t.cta)}</div>`;
  });
  const scrim = shot.text[visible].quote ? '<div class="scrim"></div>' : '';
  const box = shot.end ? `<div class="endbox">${items.join('')}</div>` : `<div class="box${shot.low ? ' low' : ''}">${items.join('')}</div>`;
  return `<!doctype html><meta charset="utf-8"><style>${css}</style>${scrim}${box}`;
}

// shots: see make.mjs for the shape. music: add the generated track (shorts leave it off so a
// trending sound can be added in the app).
export async function render({ name, shots, music = true }) {
  const TMP = `${OUT}tmp-${name}/`;
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  /* ---------- 1. text overlays, drawn in the site's fonts ---------- */
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });
  for (const [si, shot] of shots.entries()) {
    for (const ti of shot.text.keys()) {
      const file = `${TMP}o${si}-${ti}.html`;
      writeFileSync(file, html(shot, ti));
      await page.goto('file://' + file);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${TMP}o${si}-${ti}.png`, omitBackground: true });
    }
  }
  await browser.close();

  /* ---------- 2. one clip per shot ---------- */
  const clips = [];
  for (const [si, shot] of shots.entries()) {
    const src = shot.photo ? MEDIA + shot.photo : shot.video.startsWith('/') ? shot.video : MEDIA + shot.video;
    const input = shot.photo
      ? ['-loop', '1', '-framerate', String(FPS), '-t', String(shot.d), '-i', src]
      : ['-ss', String(shot.ss), '-t', String(shot.d * (shot.speed ?? 1)), '-i', src];
    let bg;
    if (shot.photo) {
      const [iw, ih] = probe(src);
      const cw = Math.round((ih * 9) / 16);
      const clampX = (c) => Math.max(0, Math.min(iw - cw, Math.round(c * iw - cw / 2)));
      if (shot.pan) {
        const k = (2 * H) / ih; // scale up first so the moving crop steps in half-pixels
        const [x0, x1] = shot.pan.map((c) => Math.round(clampX(c) * k));
        const p = `(t/${shot.d})`;
        bg = `scale=-2:${2 * H},crop=${2 * W}:${2 * H}:x='${x0}+(${x1 - x0})*(3*${p}*${p}-2*${p}*${p}*${p})':y=0,scale=${W}:${H}`;
      } else {
        const [z0, z1] = shot.zoom;
        const [fx, fy] = shot.focus;
        const n = N(shot.d) - 1;
        bg = `crop=${cw}:${ih}:${clampX(shot.cx)}:0,scale=${2 * W}:${2 * H},` +
          `zoompan=z='${z0}+${z1 - z0}*on/${n}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=1:s=${W}x${H}:fps=${FPS}`;
      }
    } else {
      const [vw, vh] = probe(src);
      const landscape = vw > vh && !src.endsWith('meet-the-gang-2.MOV'); // that one decodes to portrait
      bg = (shot.speed ? `setpts=PTS/${shot.speed},` : '') + (landscape
        ? `crop=ih*9/16:ih:(iw-ih*9/16)*${shot.cx ?? 0.5}:0,scale=${W}:${H}:flags=lanczos,unsharp=5:5:0.5`
        : `scale=${W}:-2:flags=lanczos,crop=${W}:${H}`);
      // end card: slide the illustration down, extend its blank paper upward, so the title clears her hat
      if (shot.end) bg += `,crop=${W}:${H - 300}:0:0,pad=${W}:${H}:0:300:color=0xfbf6ec`;
      bg += `,fps=${FPS}`;
    }
    bg += ',setsar=1,format=yuv420p';
    if (shot.fadeIn) bg += `,fade=t=in:st=0:d=0.35:color=white`;
    if (shot.fadeOut) bg += `,fade=t=out:st=${shot.d - 0.35}:d=0.35:color=white`;

    const overlays = shot.text.flatMap((_, ti) => ['-loop', '1', '-t', String(shot.d), '-i', `${TMP}o${si}-${ti}.png`]);
    let graph = `[0:v]${bg}[v0]`;
    shot.text.forEach((t, ti) => {
      const fade = t.at > 0 ? `,fade=t=in:st=${t.at}:d=0.25:alpha=1` : '';
      const out = shot.fadeOut ? `,fade=t=out:st=${shot.d - 0.35}:d=0.35:alpha=1` : '';
      graph += `;[${ti + 1}:v]format=rgba${fade}${out}[t${ti}];[v${ti}][t${ti}]overlay=0:0:format=auto[v${ti + 1}]`;
    });
    const clip = `${TMP}clip${String(si).padStart(2, '0')}.mp4`;
    run([...input, ...overlays, '-filter_complex', graph, '-map', `[v${shot.text.length}]`, '-frames:v', String(N(shot.d)),
      '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), clip]);
    clips.push(clip);
    process.stdout.write(`\r${name}: clip ${si + 1}/${shots.length}   `);
  }

  /* ---------- 3. join, add music, grab a cover ---------- */
  writeFileSync(TMP + 'list.txt', clips.map((c) => `file '${c}'`).join('\n'));
  const silent = `${OUT}${name}-silent.mp4`;
  run(['-f', 'concat', '-safe', '0', '-i', TMP + 'list.txt', '-c', 'copy', '-movflags', '+faststart', silent]);

  const total = shots.reduce((s, x) => s + N(x.d), 0) / FPS;
  if (music) {
    run(['-i', silent, '-i', ASSETS + 'music.mp3', '-filter_complex',
      `[1:a]atrim=start=0.35,asetpts=PTS-STARTPTS,apad,atrim=0:${total},afade=t=in:d=0.2,afade=t=out:st=${Math.max(0, total - 2)}:d=2,loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', `${OUT}${name}.mp4`]);
  }
  run(['-ss', '0.2', '-i', silent, '-frames:v', '1', '-q:v', '2', `${OUT}${name}-cover.jpg`]);
  rmSync(TMP, { recursive: true, force: true });
  console.log(`\r${name}: done (${total.toFixed(1)}s)          `);
  return total;
}
