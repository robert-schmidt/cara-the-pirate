// Builds the TikTok intro: node tiktok/make.mjs
// → tiktok/out/cara-tiktok.mp4 (with music) and cara-tiktok-silent.mp4 (add a trending sound in the TikTok app).
// Real photos/footage come from media/; the illustrated end card + music were generated on fal.ai (tiktok/assets/).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const ROOT = new URL('..', import.meta.url).pathname;
const MEDIA = ROOT + 'media/';
const ASSETS = ROOT + 'tiktok/assets/';
const OUT = ROOT + 'tiktok/out/';
const TMP = OUT + 'tmp/';
const FONTS = ROOT + 'node_modules/@fontsource-variable/';
const W = 1080;
const H = 1920;
const FPS = 30;

// Text safe zone: TikTok's UI covers the top ~200px, the bottom ~420px and a column on the right.
// photo: zoom = [from, to], cx = horizontal centre of the 9:16 crop (0..1), focus = point the zoom moves towards.
// photo: pan = [from, to] horizontal centres. video: ss = start second, speed < 1 = slow motion, cx = crop centre for landscape clips.
const SHOTS = [
  { photo: 'just-found-1.jpg', d: 3.2, zoom: [1, 1.14], cx: 0.48, focus: [0.45, 0.42],
    text: [{ at: 0, big: 'Someone took her eye.' }, { at: 1.3, sub: "Here's what happened next." }] },
  { video: 'just-found-2.mp4', ss: 1.0, d: 3.0,
    text: [{ at: 0.1, big: 'Day 1.' }, { at: 0.5, sub: "She didn't know what hands were for." }] },
  { photo: 'just-found-3-new-home.jpeg', d: 2.4, pan: [0.4, 0.6],
    text: [{ at: 0.1, big: 'By evening, she did.' }] },
  { video: 'new-home-meet-the-gang.MOV', ss: 4.75, d: 2.6, speed: 0.8, cx: 0.75,
    text: [{ at: 0.1, big: 'Then she met the crew.' }, { at: 0.9, sub: 'Oreo did the nose check.' }] },
  { photo: 'surgery-1.jpeg', d: 3.0, zoom: [1, 1.1], cx: 0.35, focus: [0.4, 0.55],
    text: [{ at: 0.1, big: 'One week later: surgery.' }, { at: 0.9, sub: "The eye couldn't be saved. The pain could." }] },
  { photo: 'surgery-3.jpeg', d: 2.6, zoom: [1, 1.08], cx: 0.6, focus: [0.5, 0.25], low: true,
    text: [{ at: 0.1, big: 'She was never alone.' }, { at: 0.9, sub: 'Nurse on duty. Unpaid.' }] },
  { photo: 'surgery-2.jpeg', d: 2.2, pan: [0.36, 0.62],
    text: [{ at: 0.1, sub: 'Oreo, on lookout duty.' }] },
  { photo: 'surgery-healing.jpeg', d: 2.6, zoom: [1, 1.1], cx: 0.58, focus: [0.6, 0.55],
    text: [{ at: 0.1, big: 'Stitches out. Cone off.' }, { at: 1.0, sub: 'Sun on.' }] },
  { photo: 'after-surgery-chilling.jpeg', d: 2.6, pan: [0.3, 0.7],
    text: [{ at: 0.1, big: "Now she's one of the pile." }] },
  { video: 'new-home-meet-the-gang-2.MOV', ss: 2.0, d: 2.6,
    text: [{ at: 0.1, big: 'And then… the chaos.' }] },
  { photo: 'late-after-surgery-making-a-mess.jpeg', d: 2.8, zoom: [1, 1.15], cx: 0.45, focus: [0.45, 0.8],
    text: [{ at: 0.3, sub: 'RIP, whatever this was.' }] },
  { photo: 'cara-happy-2.JPG', d: 2.6, zoom: [1, 1.12], cx: 0.42, focus: [0.5, 0.6],
    text: [{ at: 0.1, big: 'Today.' }, { at: 0.8, sub: 'Captain of the backyard.' }] },
  { photo: 'cara-happy-1.JPG', d: 4.0, zoom: [1, 1.08], cx: 0.79, focus: [0.5, 0.4], fadeOut: true,
    text: [{ at: 0.3, quote: 'I choose to keep the eye that sees the good in people.' }, { at: 1.8, sig: '— Cara' }] },
  { video: ASSETS + 'end-raw.mp4', ss: 0, d: 5.0, end: true, fadeIn: true,
    text: [
      { at: 0.2, title: 'Cara the Pirate' },
      { at: 0.9, line: 'Follow her story and help keep the bowls full.' },
      { at: 1.6, cta: 'cara.dog · link in bio' },
    ] },
];

const run = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const probe = (file) =>
  execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])
    .toString().trim().split(',').map(Number);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

/* ---------- 1. text overlays: transparent PNGs, one per text item, rendered in the site's fonts ---------- */

const css = `
@font-face { font-family: Lit; src: url(${FONTS}literata/files/literata-latin-opsz-normal.woff2); font-weight: 200 900; }
@font-face { font-family: Lit; src: url(${FONTS}literata/files/literata-latin-opsz-italic.woff2); font-weight: 200 900; font-style: italic; }
@font-face { font-family: Hand; src: url(${FONTS}shantell-sans/files/shantell-sans-latin-full-normal.woff2); font-weight: 300 800; }
html, body { margin: 0; width: ${W}px; height: ${H}px; background: transparent; }
.box { position: absolute; left: 64px; right: 60px; top: 250px; }
.box.low { top: auto; bottom: 480px; right: 150px; } /* clear of the like/comment column */
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

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H });
for (const [si, shot] of SHOTS.entries()) {
  for (const ti of shot.text.keys()) {
    const file = `${TMP}o${si}-${ti}.html`;
    writeFileSync(file, html(shot, ti));
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${TMP}o${si}-${ti}.png`, omitBackground: true });
  }
}
await browser.close();

/* ---------- 2. one clip per shot: motion + overlays ---------- */

const N = (d) => Math.round(d * FPS);
const clips = [];
for (const [si, shot] of SHOTS.entries()) {
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
      // scale up 2x first so the moving crop steps in half-pixels
      const k = (2 * H) / ih;
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
    const landscape = vw > vh && !src.endsWith('meet-the-gang-2.MOV'); // that one is rotated to portrait on decode
    bg = (shot.speed ? `setpts=PTS/${shot.speed},` : '') + (landscape
      ? `crop=ih*9/16:ih:(iw-ih*9/16)*${shot.cx ?? 0.5}:0,scale=${W}:${H}:flags=lanczos,unsharp=5:5:0.5`
      : `scale=${W}:-2:flags=lanczos,crop=${W}:${H}`);
    // end card: slide the illustration down and extend its blank paper upward, so the title clears her hat
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
  console.log(`clip ${si + 1}/${SHOTS.length}`);
}

/* ---------- 3. join, then add music ---------- */

writeFileSync(TMP + 'list.txt', clips.map((c) => `file '${c}'`).join('\n'));
const silent = OUT + 'cara-tiktok-silent.mp4';
run(['-f', 'concat', '-safe', '0', '-i', TMP + 'list.txt', '-c', 'copy', '-movflags', '+faststart', silent]);

const total = SHOTS.reduce((s, x) => s + N(x.d), 0) / FPS;
run(['-i', silent, '-i', ASSETS + 'music.mp3', '-filter_complex',
  `[1:a]atrim=start=0.35,asetpts=PTS-STARTPTS,apad,atrim=0:${total},afade=t=in:d=0.2,afade=t=out:st=${total - 2}:d=2,loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', OUT + 'cara-tiktok.mp4']);
run(['-ss', '0.2', '-i', silent, '-frames:v', '1', '-q:v', '2', OUT + 'cover.jpg']);

rmSync(TMP, { recursive: true, force: true });
console.log(`done: ${OUT}cara-tiktok.mp4 (${total.toFixed(1)}s)`);
