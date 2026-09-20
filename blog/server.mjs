// The blog behind carathepirate.com/blog — a small Node service, no dependencies.
// Posts are markdown files on disk (easy to back up, edit by hand, or move elsewhere later).
// nginx proxies /blog here; the page chrome comes from the Astro build, so the blog always
// matches the rest of the site.
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { join, basename, extname } from 'node:path';

const ROOT = process.env.BLOG_DIR ?? '/home/cara/blog';
const POSTS = join(ROOT, 'posts');
const UPLOADS = join(ROOT, 'uploads');
const SHELL = process.env.BLOG_SHELL ?? '/home/cara/web/carathepirate.com/public_html/blog-shell/index.html';
const ADMIN = new URL('./admin.html', import.meta.url);
const SITE = 'https://carathepirate.com';
const PORT = Number(process.env.PORT ?? 3060);
const MAX_UPLOAD = 6 * 1024 * 1024;

await mkdir(POSTS, { recursive: true });
await mkdir(UPLOADS, { recursive: true });
const config = JSON.parse(await readFile(join(ROOT, 'config.json'), 'utf8'));

/* ---------- helpers ---------- */

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'post';
const safeSlug = (s) => (/^[a-z0-9-]{1,60}$/.test(s) ? s : null);
const fmtDate = (iso, lang) =>
  new Date(iso).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Only ordinary links: no javascript: or data: URLs, even though only the author can post.
const safeUrl = (u) => (/^(https?:\/\/|\/|mailto:|#)/i.test(u) ? u : '#');

// Markdown: escape everything first, then allow a small, safe subset.
function markdown(src) {
  const inline = (t) =>
    t
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img src="${esc(safeUrl(u))}" alt="${esc(a)}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, u) => `<a href="${esc(safeUrl(u))}" rel="noopener">${a}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\W)\*([^*]+)\*/g, '$1<em>$2</em>');
  const out = [];
  let list = null;
  for (const raw of esc(src).split(/\r?\n/)) {
    const line = raw.trimEnd();
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!list) { list = true; out.push('<ul>'); }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    if (list) { out.push('</ul>'); list = null; }
    if (!line) continue;
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else if (line.startsWith('&gt; ')) out.push(`<blockquote><p>${inline(line.slice(5))}</p></blockquote>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

function parsePost(text, slug) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || new Date().toISOString(),
    lang: meta.lang === 'ro' ? 'ro' : 'en',
    draft: meta.draft === 'true',
    cover: meta.cover || '',
    body: m ? m[2] : text,
  };
}

const serialise = (p) =>
  `---\ntitle: ${p.title}\ndate: ${p.date}\nlang: ${p.lang}\ndraft: ${p.draft}\ncover: ${p.cover}\n---\n${p.body}`;

async function allPosts() {
  const files = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
  const posts = await Promise.all(
    files.map(async (f) => parsePost(await readFile(join(POSTS, f), 'utf8'), f.replace(/\.md$/, ''))),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

const excerpt = (body, n = 180) => {
  const t = body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[#*>\-]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t;
};

/* ---------- page shell (built by Astro, so the blog matches the site) ---------- */

let shellCache = { text: '', at: 0 };
async function shell() {
  if (Date.now() - shellCache.at > 30_000 || !shellCache.text) {
    shellCache = { text: await readFile(SHELL, 'utf8'), at: Date.now() };
  }
  return shellCache.text;
}

async function page({ title, description, content, lang = 'en', image = '', url = `${SITE}/blog` }) {
  const meta = [
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image || `${SITE}/og.jpg`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('');
  return (await shell())
    .replace('<!--TITLE-->', esc(title))
    .replace('<!--META-->', meta)
    .replace('<!--CONTENT-->', content)
    .replace('lang="en"', `lang="${lang}"`);
}

/* ---------- auth ---------- */

const sign = (value) => createHmac('sha256', config.secret).update(value).digest('base64url');
function newSession() {
  const payload = String(Date.now() + 30 * 24 * 3600 * 1000);
  return `${payload}.${sign(payload)}`;
}
function validSession(cookie = '') {
  const token = cookie.split(/;\s*/).find((c) => c.startsWith('blog_session='))?.slice(13);
  if (!token) return false;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(payload) > Date.now();
}
const attempts = new Map(); // ip → { n, until }
function checkPassword(ip, password) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.until > now && rec.n >= 5) return false;
  const hash = scryptSync(String(password), config.salt, 64).toString('hex');
  const ok = hash.length === config.hash.length && timingSafeEqual(Buffer.from(hash), Buffer.from(config.hash));
  if (!ok) attempts.set(ip, { n: (rec?.until > now ? rec.n : 0) + 1, until: now + 15 * 60 * 1000 });
  else attempts.delete(ip);
  return ok;
}

/* ---------- http ---------- */

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff', ...headers });
  res.end(body);
};
const json = (res, code, obj, headers = {}) =>
  send(res, code, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8', ...headers });

async function readBody(req, limit = MAX_UPLOAD + 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, SITE);
    const path = url.pathname.replace(/\/+$/, '') || '/blog';
    const ip = req.headers['x-real-ip'] ?? req.socket.remoteAddress ?? '';
    const authed = validSession(req.headers.cookie);

    /* --- api --- */
    if (path === '/blog/api/login' && req.method === 'POST') {
      const { password } = JSON.parse(await readBody(req, 4096));
      if (!checkPassword(ip, password)) return json(res, 401, { error: 'Wrong password' });
      return json(res, 200, { ok: true }, {
        'set-cookie': `blog_session=${newSession()}; Path=/blog; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
      });
    }
    if (path.startsWith('/blog/api/')) {
      if (!authed) return json(res, 401, { error: 'Not logged in' });

      if (path === '/blog/api/posts' && req.method === 'GET') return json(res, 200, await allPosts());

      if (path === '/blog/api/posts' && req.method === 'POST') {
        const p = JSON.parse(await readBody(req));
        const slug = safeSlug(p.slug) ?? slugify(p.title || '');
        const post = {
          slug,
          title: String(p.title || 'Untitled').slice(0, 200),
          date: p.date || new Date().toISOString(),
          lang: p.lang === 'ro' ? 'ro' : 'en',
          draft: Boolean(p.draft),
          cover: String(p.cover || '').slice(0, 300),
          body: String(p.body || ''),
        };
        await writeFile(join(POSTS, `${slug}.md`), serialise(post));
        return json(res, 200, post);
      }

      if (path.startsWith('/blog/api/posts/') && req.method === 'DELETE') {
        const slug = safeSlug(basename(path.slice(16)));
        if (!slug) return json(res, 400, { error: 'Bad slug' });
        await unlink(join(POSTS, `${slug}.md`)).catch(() => {});
        return json(res, 200, { ok: true });
      }

      if (path === '/blog/api/upload' && req.method === 'POST') {
        const { data, name } = JSON.parse(await readBody(req));
        const ext = (TYPES[extname(String(name || '')).toLowerCase()] ? extname(String(name)).toLowerCase() : '.jpg');
        const bytes = Buffer.from(String(data).replace(/^data:[^,]+,/, ''), 'base64');
        if (bytes.length > MAX_UPLOAD) return json(res, 413, { error: 'Image too large' });
        const file = `${randomUUID()}${ext}`;
        await writeFile(join(UPLOADS, file), bytes);
        return json(res, 200, { url: `/blog/uploads/${file}` });
      }
      return json(res, 404, { error: 'Unknown endpoint' });
    }

    /* --- admin --- */
    if (path === '/blog/admin') return send(res, 200, await readFile(ADMIN), { 'cache-control': 'no-store' });

    /* --- uploads --- */
    if (path.startsWith('/blog/uploads/')) {
      const file = basename(path);
      const type = TYPES[extname(file).toLowerCase()];
      if (!type) return send(res, 404, 'Not found');
      const bytes = await readFile(join(UPLOADS, file)).catch(() => null);
      if (!bytes) return send(res, 404, 'Not found');
      return send(res, 200, bytes, { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable' });
    }

    /* --- feed --- */
    if (path === '/blog/feed.xml') {
      const posts = (await allPosts()).filter((p) => !p.draft).slice(0, 20);
      const items = posts
        .map(
          (p) => `<item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.slug}</link>` +
            `<guid>${SITE}/blog/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate>` +
            `<description>${esc(excerpt(p.body, 300))}</description></item>`,
        )
        .join('');
      return send(
        res,
        200,
        `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cara the Pirate</title>` +
          `<link>${SITE}/blog</link><description>News from the pack near Bucharest.</description>${items}</channel></rss>`,
        { 'content-type': 'application/rss+xml; charset=utf-8' },
      );
    }

    /* --- index --- */
    if (path === '/blog') {
      const posts = (await allPosts()).filter((p) => !p.draft || authed);
      const list = posts.length
        ? posts
            .map(
              (p) => `<li class="post-card${p.draft ? ' is-draft' : ''}">` +
                (p.cover ? `<a class="thumb" href="/blog/${p.slug}"><img src="${esc(p.cover)}" alt="" loading="lazy"></a>` : '') +
                `<div><p class="date">${fmtDate(p.date, p.lang)}${p.draft ? ' · draft' : ''}</p>` +
                `<h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2>` +
                `<p>${esc(excerpt(p.body))}</p></div></li>`,
            )
            .join('')
        : '<li class="post-card"><div><p>No posts yet.</p></div></li>';
      return send(
        res,
        200,
        await page({
          title: 'Blog · Cara the Pirate',
          description: 'News from Cara and the rest of the pack near Bucharest.',
          content: `<section class="blog-wrap" data-mood="dawn"><div class="wrap"><h1>Blog</h1><ul class="post-list">${list}</ul></div></section>`,
        }),
        { 'cache-control': 'no-cache' },
      );
    }

    /* --- single post --- */
    const slug = safeSlug(path.slice(6));
    if (slug) {
      const text = await readFile(join(POSTS, `${slug}.md`), 'utf8').catch(() => null);
      if (text) {
        const p = parsePost(text, slug);
        if (p.draft && !authed) return send(res, 404, await page({ title: 'Not found', description: '', content: '<section class="blog-wrap"><div class="wrap"><h1>Not found</h1></div></section>' }));
        const content =
          `<section class="blog-wrap" data-mood="dawn"><div class="wrap"><article class="post">` +
          `<p class="date">${fmtDate(p.date, p.lang)}</p><h1>${esc(p.title)}</h1>` +
          (p.cover ? `<img class="cover" src="${esc(p.cover)}" alt="">` : '') +
          `${markdown(p.body)}<p class="back"><a href="/blog">← ${p.lang === 'ro' ? 'Toate poveștile' : 'All posts'}</a></p>` +
          `</article></div></section>`;
        return send(
          res,
          200,
          await page({
            title: `${p.title} · Cara the Pirate`,
            description: excerpt(p.body, 160),
            content,
            lang: p.lang,
            image: p.cover ? SITE + p.cover : '',
            url: `${SITE}/blog/${slug}`,
          }),
          { 'cache-control': 'no-cache' },
        );
      }
    }

    return send(res, 404, await page({ title: 'Not found · Cara the Pirate', description: '', content: '<section class="blog-wrap"><div class="wrap"><h1>Not found</h1><p><a href="/blog">Back to the blog</a></p></div></section>' }));
  } catch (err) {
    console.error(err);
    send(res, 500, 'Something went wrong');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`blog on 127.0.0.1:${PORT}, posts in ${POSTS}`));
