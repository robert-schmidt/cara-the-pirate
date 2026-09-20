// Three short cuts (~15s each) for TikTok, Reels and Shorts.   node tiktok/shorts.mjs
// Same footage as the long cut, different hooks. Each renders with music and silent —
// post the silent one when you want to use a trending sound.
import { render, ASSETS } from './render.mjs';

const endCard = (d = 3.5) => ({
  video: ASSETS + 'end-raw.mp4',
  ss: 0,
  d,
  end: true,
  fadeIn: true,
  text: [
    { at: 0.15, title: 'Cara the Pirate' },
    { at: 0.9, cta: 'cara.dog' },
  ],
});

// 1. The transformation. The strongest format there is: same dog, ninety days apart.
const DAY1 = [
  { video: 'just-found-2.mp4', ss: 1.0, d: 2.8,
    text: [{ at: 0, big: 'Day 1.' }, { at: 0.6, sub: 'Rescued off the street that morning.' }] },
  { photo: 'just-found-3-new-home.jpeg', d: 2.2, pan: [0.4, 0.6],
    text: [{ at: 0, big: 'Day 1, evening.' }, { at: 0.7, sub: 'She worked out what hands are for.' }] },
  { photo: 'surgery-1.jpeg', d: 2.4, zoom: [1, 1.1], cx: 0.35, focus: [0.4, 0.55],
    text: [{ at: 0, big: 'Week 1.' }, { at: 0.6, sub: "The eye couldn't be saved." }] },
  { photo: 'surgery-healing.jpeg', d: 2.2, zoom: [1, 1.1], cx: 0.58, focus: [0.6, 0.55],
    text: [{ at: 0, big: 'Week 4.' }, { at: 0.6, sub: 'Cone off. Sun on.' }] },
  { photo: 'cara-happy-2.JPG', d: 2.8, zoom: [1, 1.12], cx: 0.42, focus: [0.5, 0.6], fadeOut: true,
    text: [{ at: 0, big: 'Day 93.' }, { at: 0.7, sub: 'Captain of the backyard.' }] },
  endCard(),
];

// 2. The detail people remember: the cat that moved in next to her.
const NURSE = [
  { photo: 'surgery-3.jpeg', d: 3.2, zoom: [1, 1.08], cx: 0.6, focus: [0.5, 0.25], low: true,
    text: [{ at: 0, big: 'Her nurse was a cat.' }, { at: 1.4, sub: 'He kept that spot for a week.' }] },
  { photo: 'surgery-2.jpeg', d: 2.4, pan: [0.36, 0.62],
    text: [{ at: 0.1, sub: 'Oreo took the day shift.' }] },
  { photo: 'surgery-healing.jpeg', d: 2.2, zoom: [1, 1.1], cx: 0.58, focus: [0.6, 0.55],
    text: [{ at: 0.1, big: 'Stitches out. Cone off.' }] },
  { photo: 'after-surgery-chilling.jpeg', d: 2.6, pan: [0.3, 0.7], fadeOut: true,
    text: [{ at: 0.1, big: "Now she's one of the pile." }] },
  endCard(),
];

// 3. The funny one. People share what makes them laugh.
const CHAOS = [
  { photo: 'late-after-surgery-making-a-mess.jpeg', d: 3.0, zoom: [1, 1.15], cx: 0.45, focus: [0.45, 0.8],
    text: [{ at: 0, big: 'Someone destroyed a pillow.' }, { at: 1.3, sub: "We're still finding it in the grass." }] },
  { photo: 'cara-happy-1.JPG', d: 2.6, zoom: [1, 1.08], cx: 0.79, focus: [0.5, 0.4],
    text: [{ at: 0.1, sub: 'She has one eye and zero alibis.' }] },
  { video: 'new-home-meet-the-gang-2.MOV', ss: 2.0, d: 2.6,
    text: [{ at: 0.1, big: 'The accomplices.' }] },
  { photo: 'cara-happy-2.JPG', d: 2.6, zoom: [1, 1.12], cx: 0.42, focus: [0.5, 0.6], fadeOut: true,
    text: [{ at: 0.1, big: 'Worth every mess.' }] },
  endCard(),
];

for (const [name, shots] of [
  ['short-day1', DAY1],
  ['short-nurse', NURSE],
  ['short-chaos', CHAOS],
]) {
  await render({ name, shots });
}
