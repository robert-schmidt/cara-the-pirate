import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const motion = matchMedia('(prefers-reduced-motion: no-preference)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)];

/* ---------- punchline: pinned, scrubbed (created first so later triggers account for its pin spacing) ---------- */

if (motion) {
  const words = SplitText.create('.punch blockquote p', { type: 'words' }).words;
  gsap
    .timeline({ scrollTrigger: { trigger: '.punch', start: 'top top', end: '+=170%', pin: true, scrub: 0.6, anticipatePin: 1 } })
    .from('.eye-open', { scaleY: 0.05, transformOrigin: '50% 50%', duration: 1 })
    .from('.eye-closed', { autoAlpha: 0, duration: 0.6 }, 0.2)
    .from('.punch .l1', { autoAlpha: 0, y: 16, duration: 0.6 }, 0.8)
    .from('.punch .l2', { autoAlpha: 0, y: 16, duration: 0.6 }, 1.5)
    .from(words, { opacity: 0.12, duration: 0.3, stagger: 0.12 }, 2.2)
    .from('.punch .sig', { autoAlpha: 0, duration: 0.5 })
    .from('.punch .days', { autoAlpha: 0, duration: 0.5 })
    .to('.eye-open', { scaleY: 0.08, duration: 0.15, yoyo: true, repeat: 1 }, '+=0.2'); // and the blink
}

/* ---------- hero intro: the photo opens like an eye from her good one ---------- */

if (motion) {
  gsap.set(['.hero h1', '.hero .sub', '.hero .cue', '.hero .note', '.note-arrow'], { visibility: 'visible' });
  const chars = SplitText.create('.hero h1', { type: 'lines,chars', mask: 'lines' }).chars;
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero-photo .frame', { clipPath: 'circle(150% at 56% 35%)', duration: 1.6, ease: 'power2.inOut' }, 0)
    .from(chars, { yPercent: 110, duration: 0.9, stagger: 0.035 }, 0.25)
    .from('.hero .sub', { autoAlpha: 0, y: 14, duration: 0.7 }, 0.9)
    .from('.hero .note', { autoAlpha: 0, rotate: -12, duration: 0.6 }, 1.4)
    .from('.note-arrow', { autoAlpha: 0, duration: 0.4 }, 1.7)
    .from('.hero .cue', { autoAlpha: 0, duration: 0.6 }, 1.6);
}

/* ---------- photos open with an iris as they scroll in ---------- */

if (motion) {
  for (const shot of $$('.shot')) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: shot, start: 'top 85%', once: true } });
    tl.fromTo(
      $('.frame', shot),
      { clipPath: 'circle(0% at 50% 50%)' },
      { clipPath: 'circle(75% at 50% 50%)', duration: 1.1, ease: 'power2.out', clearProps: 'clipPath' },
    );
    const cap = shot.querySelector('figcaption');
    if (cap) tl.from(cap, { autoAlpha: 0, x: -8, duration: 0.5 }, 0.6);
  }
}

/* ---------- mood: page colour follows the story (CSS does the crossfade) ---------- */

for (const el of $$('main [data-mood]')) {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: (st) => st.isActive && (root.dataset.mood = el.dataset.mood),
  });
}

/* ---------- the paw-print trail: hero → every chapter → crew → X ---------- */

const NS = 'http://www.w3.org/2000/svg';
const main = $('main');
const svg = $<SVGSVGElement>('svg.trail');
const route = $<SVGPathElement>('.route', svg);
const xMark = $<SVGSVGElement>('.x-mark');
let prints: SVGUseElement[] = [];
let printY: number[] = [];
let nodes: [SVGCircleElement, number][] = [];
let xY = Infinity;
let shown = -1;

function build() {
  const base = main.getBoundingClientRect();
  const box = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  };
  const narrow = innerWidth < 900;
  const lane = narrow ? 20 : 36; // distance from the .wrap edge, inside its padding

  const cue = box($('.cue'));
  const pts: [x: number, y: number, node: boolean][] = [[cue.x + cue.w - 9, cue.y + cue.h + 12, false]];
  for (const sec of $$('main [data-trail]')) {
    const wrap = box($('.wrap', sec));
    const s = box(sec);
    const n = box($('[data-node]', sec));
    const x = !narrow && sec.dataset.trail === 'right' ? wrap.x + wrap.w - lane : wrap.x + lane;
    pts.push([x, n.y + n.h / 2, true], [x, s.y + s.h - 30, false]);
  }
  const xm = box(xMark);
  xY = xm.y + xm.h / 2;
  pts.push([xm.x + xm.w / 2, xY, false]);

  // Vertical tangents at every point: straight runs down the gutter, S-bends between chapters.
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const k = (y2 - y1) / 2;
    d += ` C${x1},${y1 + k} ${x2},${y2 - k} ${x2},${y2}`;
  }
  svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
  route.setAttribute('d', d);

  // Paw prints, alternating left/right of the route, facing the way she walks.
  const len = route.getTotalLength();
  const step = narrow ? 26 : 32;
  const size = narrow ? 11 : 13;
  prints = [];
  printY = [];
  for (let l = step, i = 0; l < len - 24; l += step, i++) {
    const p = route.getPointAtLength(l);
    const q = route.getPointAtLength(l + 2);
    const a = Math.atan2(q.y - p.y, q.x - p.x);
    const off = (i % 2 ? 1 : -1) * (narrow ? 4 : 5);
    const x = p.x - Math.sin(a) * off;
    const y = p.y + Math.cos(a) * off;
    const u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#paw');
    u.setAttribute('class', 'paw');
    u.setAttribute('x', String(-size / 2));
    u.setAttribute('y', String(-size / 2));
    u.setAttribute('width', String(size));
    u.setAttribute('height', String(size));
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${Math.round((a * 180) / Math.PI + 90)})`);
    g.append(u);
    prints.push(u);
    printY.push(y);
  }
  $('.prints', svg).replaceChildren(...prints.map((u) => u.parentNode!));

  nodes = pts
    .filter((p) => p[2])
    .map(([x, y]) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', narrow ? '5' : '6');
      return [c, y];
    });
  $('.nodes', svg).replaceChildren(...nodes.map((n) => n[0]));

  shown = -1;
  update();
}

// The trail's head sits a little below the middle of the screen, so prints appear where you're reading.
function update() {
  const head = motion ? innerHeight * 0.72 - main.getBoundingClientRect().top : Infinity;
  let lo = 0;
  let hi = printY.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (printY[m] < head) lo = m + 1;
    else hi = m;
  }
  if (lo !== shown) {
    const from = shown < 0 ? 0 : Math.min(lo, shown);
    const to = shown < 0 ? prints.length : Math.max(lo, shown);
    for (let i = from; i < to; i++) prints[i].classList.toggle('on', i < lo);
    shown = lo;
  }
  for (const [c, y] of nodes) c.classList.toggle('on', y < head);
  xMark.classList.toggle('found', head > xY);
}

let raf = 0;
addEventListener('scroll', () => (raf ||= requestAnimationFrame(() => ((raf = 0), update()))), { passive: true });
ScrollTrigger.addEventListener('refresh', build);
document.fonts.ready.then(() => ScrollTrigger.refresh());

/* ---------- videos: play only while on screen ---------- */

const videos = $$<HTMLVideoElement>('video[data-autoplay]');
if (motion) {
  // iOS autoplays only muted, inline videos, and wants both set on the element itself rather than
  // just as HTML attributes. If it still refuses (Low Power Mode does), fall back to showing controls.
  const start = (v: HTMLVideoElement) => {
    v.muted = true;
    v.playsInline = true;
    v.play().catch(() => {
      if (!v.classList.contains('ambient')) v.controls = true;
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) start(v);
        else v.pause();
      }
    },
    { threshold: 0.35 },
  );
  videos.forEach((v) => io.observe(v));

  // A tap counts as user activation, so retry whatever was refused before it.
  const retryVisible = () => {
    for (const v of videos) {
      const r = v.getBoundingClientRect();
      if (v.paused && r.top < innerHeight && r.bottom > 0) start(v);
    }
  };
  addEventListener('touchstart', retryVisible, { once: true, passive: true });
  addEventListener('click', retryVisible, { once: true });
} else {
  videos.filter((v) => !v.classList.contains('ambient')).forEach((v) => (v.controls = true));
}

/* ---------- latest blog posts, fetched from the blog service ---------- */

const latest = document.querySelector<HTMLElement>('[data-latest]');
if (latest) {
  fetch('/blog/api/recent')
    .then((r) => (r.ok ? r.json() : []))
    .then((posts: { slug: string; title: string; lang: string; dateText: string; image: string; excerpt: string }[]) => {
      if (!Array.isArray(posts) || posts.length === 0) return;
      const lang = latest.dataset.lang ?? 'en';
      const mine = posts.filter((p) => p.lang === lang);
      const list = $('.latest-list', latest);
      for (const p of (mine.length ? mine : posts).slice(0, 3)) {
        const li = document.createElement('li');
        li.className = p.image ? 'latest-card' : 'latest-card no-image';
        li.innerHTML = `${p.image ? '<img alt="" loading="lazy">' : ''}<div><p class="date"></p><h3><a></a></h3><p class="excerpt"></p></div>`;
        if (p.image) li.querySelector('img')!.src = p.image;
        li.querySelector('.date')!.textContent = p.dateText;
        const link = li.querySelector('a')!;
        link.href = `/blog/${p.slug}`;
        link.textContent = p.title;
        li.querySelector('.excerpt')!.textContent = p.excerpt;
        list.append(li);
      }
      latest.hidden = false;
      ScrollTrigger.refresh(); // the page got taller, so the paw trail needs remeasuring
    })
    .catch(() => {}); // blog unreachable: the section simply stays hidden
}

/* ---------- analytics: which links and buttons actually get used ---------- */

const track = (name: string, params: Record<string, string>) => {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params);
};
document.addEventListener(
  'click',
  (e) => {
    const el = (e.target as Element).closest('a, button');
    if (!el) return;
    const href = el.getAttribute('href') ?? '';
    if (href.includes('buy.stripe.com')) track('donate_click', { method: 'card' });
    else if (href.includes('paypal.me')) track('donate_click', { method: 'paypal' });
    else if (el.matches('[data-copy]')) track('copy_details', { method: el.closest('.wallets') ? 'wallet' : 'bank' });
    else if (el.matches('.share-btn')) track('share', { method: el.textContent?.trim() ?? 'link' });
    else if (el.matches('[data-share]')) track('share', { method: 'native' });
    else if (href.includes('x.com/carathepirate')) track('social_click', { method: 'x' });
    else if (href.includes('tiktok.com/@cara')) track('social_click', { method: 'tiktok' });
    else if (href.startsWith('/blog')) track('blog_click', { method: 'site' });
  },
  { capture: true },
);

/* ---------- copy, share, day counter ---------- */

document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-copy], [data-share]');
  if (!btn) return;
  const url = location.origin + location.pathname;
  if (btn.hasAttribute('data-share') && navigator.share) {
    navigator.share({ title: document.title, url }).catch(() => {});
    return;
  }
  try {
    await navigator.clipboard.writeText(btn.dataset.copy ?? url);
  } catch {
    return; // clipboard blocked: leave the label alone rather than claim success
  }
  const label = btn.textContent;
  btn.textContent = btn.dataset.done!;
  setTimeout(() => (btn.textContent = label), 1800);
});

for (const el of $$('[data-since]')) {
  el.textContent = String(Math.floor((Date.now() - Date.parse(el.dataset.since!)) / 864e5) + 1);
}
