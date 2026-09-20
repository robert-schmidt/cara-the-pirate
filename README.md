# Cara the Pirate

The story of a rescued dog near Bucharest, told as a scroll down a treasure map — and a way for
people to help the family that took her in. Live at **[carathepirate.com](https://carathepirate.com)**
(**cara.dog** redirects there). English at `/`, Romanian at `/ro/`.

Astro, GSAP and plain CSS. The pages are static; a small Node service adds the blog.
The design and the original story plan are in `PLAN.md`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run media    # rebuild web photos, videos, crew portraits and the share image from media/
npm run deploy   # build, upload, restart the blog service, check the site answers
```

## Where things live

| What | File |
|---|---|
| Story chapters (one `.md` per chapter, per language, ordered by file name) | `src/content/chapters/en/`, `src/content/chapters/ro/` |
| All other words (hero, crew, family, donate, footer) | `src/i18n.ts` |
| Arrival date, social links, crew list, payment details | `src/site.ts` |
| Page · chapter · donate · shared header and footer | `src/components/` |
| Scroll animation (paw trail, photo reveals, punchline, background moods) | `src/scripts/story.ts` |
| Styles, colours, moods | `src/styles/global.css` |
| Photo and video processing (ffmpeg) | `scripts/media.sh` |
| Blog service and its admin page | `blog/` |

**New chapter:** add `09-something.md` to both language folders. Its `mood` sets the page colour
(`dawn`, `dusk`, `golden` or `summer`), and `media` lists photos from `src/assets/photos` or videos
from `public/video`, by name.

**Crew portraits** are square crops cut by `scripts/media.sh` (`crop=W:H:X:Y` per animal, chosen by
eye) so each one sits correctly inside its circle. Change a crop there and run `npm run media`.

**Raw originals** stay in `media/`, which is not in git — it's ~130 MB of full-resolution photos and
phone videos. `npm run media` turns them into the web-sized files the site actually ships.

## Payment details

Read from environment variables at build time; see `.env.example`. Copy it to `.env` for local
builds. Anything missing renders an obviously fake placeholder and the build prints a warning
listing what's unset — and a missing Stripe or PayPal link hides its button rather than publishing
a dead one.

## Deploying

Deployment is a plain `rsync` over SSH, on purpose: no CI, nothing to break between here and the
server.

```sh
cp .deploy.env.example .deploy.env   # once: where to publish
npm run deploy
```

`.deploy.env` and the full server runbook (`DEPLOY.local.md`) are deliberately kept out of git.

`npm run deploy` builds the site, rsyncs `dist/` with `--delete` (skipping `.well-known`, where
Let's Encrypt writes its renewal checks), fixes ownership and permissions, syncs the blog service
and restarts it, then checks the live URLs answer.

**Rolling back:** check out an older commit and deploy again.

## Blog

Write at `/blog/admin`: log in, "New post", type, Save. Each post has a title, date, language
(EN/RO), draft or published, a cover photo, and the story. Formatting is markdown — `**bold**`,
`*italic*`, `## heading`, `- list`, `> quote` — plus an "Add photo to story" button that inserts a
photo where the cursor is. Photos are resized in the browser before upload, so posting from a phone
works.

| | |
|---|---|
| Service | `blog/server.mjs` — plain Node, no dependencies, listening on localhost with nginx in front |
| Posts | Markdown files on disk, photos beside them. Back up that one folder and you have the blog. |
| Look | The page chrome comes from `src/pages/blog-shell.astro`, which Astro builds like any other page, so the blog always matches the site. There is no second copy of the header, footer or CSS. |
| Feed | `/blog/feed.xml` |

Security: scrypt password hash, signed HttpOnly session cookie, five failed logins per IP then a
15-minute lockout, image-only uploads with random filenames and a size cap, all post content
HTML-escaped, and the service sandboxed so it can only write its own folder.

Drafts are visible only while logged in. Blog posts aren't in `sitemap-index.xml` yet (that's
generated at build time, and posts aren't) — worth adding if the blog gets busy.

## Analytics

- **Google Analytics 4**, measurement id in `.env` as `PUBLIC_GA_ID`. Leave it empty and no
  analytics code is emitted at all.
- **No cookie banner, on purpose.** Consent Mode is set to *denied* by default, so the tag sets
  **no cookies** and cannot identify visitors. Traffic still reports; user counts are modelled
  rather than exact. Full data would need a real consent banner.
- **Google Search Console** verified through the GA tag — so removing that tag un-verifies it.
- **Sitemap** from `@astrojs/sitemap` at `/sitemap-index.xml`, listed in `robots.txt`.

## TikTok intro video

`node tiktok/make.mjs` renders `tiktok/out/cara-tiktok.mp4` (~41s, 1080×1920, with music), a
`-silent` version for adding a trending sound in the app, and `cover.jpg`. Shots, timing and
on-screen text are the `SHOTS` list at the top of the script.

Every shot of Cara is real photography or footage, only cropped and cut — for a fundraiser that
matters. `tiktok/assets/` holds the only generated parts, both made on fal.ai: the illustrated end
card (Nano Banana Pro → MiniMax H3 Max) and the music (ElevenLabs Music v2.5).

Needs ffmpeg and Google Chrome installed.
