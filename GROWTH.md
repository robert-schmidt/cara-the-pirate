# Reach: what runs itself, what's ready to post, what only you can do

## Running by itself

- **Search engines get told instantly.** Every deploy and every published post pings IndexNow
  (Bing, Yandex, Seznam, DuckDuckGo via Bing). No account, no cost. Google doesn't take pings, so
  it gets the sitemaps instead.
- **Two sitemaps**, both submitted and reading "Success" in Search Console: the site's own, and
  `/blog/sitemap.xml`, which regenerates itself every time you publish.
- **Structured data** on every page: the homepage is marked up as one Article about a named dog,
  each post as a BlogPosting with its photo, date and author. This is what gets you a picture next
  to your result instead of a grey line of text.
- **The homepage updates itself.** New posts appear in "Keep up with Cara" the moment you publish —
  no deploy needed.
- **Analytics tracks what converts**, not just visits: `donate_click` (card vs PayPal),
  `copy_details` (bank vs wallet), `share` (per channel), `social_click`, `blog_click`.

## Ready to post

Four videos in `tiktok/out/`, each with a cover frame, and each in two versions — `NAME.mp4` with
our music, `NAME-silent.mp4` for when you want a trending sound (trending audio reaches more people,
so prefer silent + a popular sound on TikTok).

| File | Length | The hook |
|---|---|---|
| `cara-tiktok` | 41s | The whole story. Best as a pinned profile video. |
| `short-day1` | 16s | Day 1 → Day 93. The transformation format that travels furthest. |
| `short-nurse` | 14s | "Her nurse was a cat." The detail people remember. |
| `short-chaos` | 14s | "Someone destroyed a pillow." The funny one; funny gets shared. |

Re-render any time with `node tiktok/make.mjs` and `node tiktok/shorts.mjs`. New hooks are a few
lines in `tiktok/shorts.mjs`.

## Two weeks of posts

One post a day beats seven on Sunday. TikTok rewards consistency far more than volume.

| Day | Post | Caption |
|---|---|---|
| 1 | `short-day1` | Someone took her eye. 93 days later she runs the backyard. 🏴‍☠️ Full story: cara.dog |
| 2 | X: photo of the wink + the quote | "I choose to keep the eye that sees the good in people." This is Cara. cara.dog |
| 3 | `short-nurse` | Her nurse was a cat. He kept that spot for a week. 🐈 cara.dog |
| 4 | Blog post: "What a month of food costs" | Honest numbers, photo of the bowls |
| 5 | `short-chaos` | She has one eye and zero alibis. 🛏️💥 cara.dog |
| 6 | X: before/after two-photo post | Day 1 vs Day 93. Same dog. |
| 7 | `cara-tiktok` (pin it) | The whole story, 41 seconds. cara.dog |
| 8 | Photo of the Tulcea shelter dogs | The fifteen you don't see on the site |
| 9 | Blog post: "Meet Zuba" | One crew member per post — a series gives people a reason to come back |
| 10 | Clip of the pack running (`surgery-back-home` footage) | Sound on. |
| 11 | X: reply-bait question | "What should we call the cat that nursed her?" |
| 12 | `short-day1` again, different sound | Re-posting a winner with new audio is normal on TikTok |
| 13 | Blog post: "Where the money went" | Receipts build trust and bring repeat donors |
| 14 | Behind the scenes: the vet visit | Tag Center of Hope |

**Hashtags** — three to five, mixing broad and specific: `#rescuedog #dogsoftiktok #adoptdontshop`
`#rescuestory #onedeyeddog #romania #caineiromania #adoptanuacumpara`

**Romanian vs English:** post Romanian captions for local donors (they're the ones who can send a
bank transfer) and English for reach. TikTok lets you pin one comment — pin the Romanian version
under an English post.

## The one thing that matters most

**Reply to every comment for the first hour after posting.** Comment velocity is the single biggest
lever on TikTok's algorithm, and it's free. Ten replies in the first hour beats any hashtag choice.

## Only you can do these

I can't log into your accounts, and I won't automate posting or following — both platforms ban it,
and losing the accounts would cost you the audience this whole project depends on.

1. **Pin the long video** on TikTok and X, and put `cara.dog` in both bios.
2. **Auto-post the blog to X, free:** the blog publishes RSS at `/blog/feed.xml`. Connect it at
   [ifttt.com](https://ifttt.com) (RSS → X) or [buffer.com](https://buffer.com) free tier. Five
   minutes, then every post you write goes out automatically.
3. **Reddit** — post the story, not the donation link, and read each sub's self-promo rules first:
   r/rescuedogs, r/dogpictures, r/aww, r/Romania. One post per sub, spaced out. Linking the site in
   a comment when asked works better than putting it in the post.
4. **Romanian Facebook groups** for animal rescue — where local donors actually are.
5. **Print the QR** (`public/qr-cara-dog.png`, also live at carathepirate.com/qr-cara-dog.png) for
   vet clinics, pet shops and the Tulcea shelter. It carries a UTM tag, so scans show up in
   Analytics as their own source.
6. **Ask Center of Hope to share it.** A vet clinic's audience is exactly the right audience, and
   you're already their client.

## Links that measure themselves

Use these instead of the bare domain, and Analytics will tell you which channel actually brings
donors:

```
TikTok bio    https://cara.dog/?utm_source=tiktok&utm_medium=bio
X bio         https://cara.dog/?utm_source=x&utm_medium=bio
X posts       https://cara.dog/?utm_source=x&utm_medium=post
Facebook      https://cara.dog/?utm_source=facebook&utm_medium=group
Printed QR    already tagged: utm_source=qr&utm_medium=print
```

## What I'd expect

Be patient with search: a new domain takes weeks to rank for anything, and "cara the pirate" is the
only term you'll own early. Social is where the first thousand visitors come from, and the videos
are the engine there. The site's job is to convert them once they arrive — which is why the money
went into the story, the speed and the donation section rather than into tricks.
