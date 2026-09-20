// The long cut: Cara's whole story in ~41 seconds.   node tiktok/make.mjs
// Real photos and footage from media/; only the end card and the music were generated (see README).
// Text safe zone: TikTok's UI covers the top ~200px, the bottom ~420px and a column on the right.
// photo: zoom = [from, to], cx = horizontal centre of the 9:16 crop (0..1), focus = point the zoom moves towards.
// photo: pan = [from, to] horizontal centres. video: ss = start second, speed < 1 = slow motion, cx = crop centre.
import { render, ASSETS } from './render.mjs';

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

await render({ name: 'cara-tiktok', shots: SHOTS });
