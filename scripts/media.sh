#!/bin/sh
# Regenerates web media from the raw originals in media/. Run: npm run media
set -e
cd "$(dirname "$0")/.."
mkdir -p src/assets/photos public/video

# Photos: the "Large" exports, renamed without spaces. Astro turns them into AVIF/WebP at build.
for f in media/*\ Large.jpeg; do
  n=$(basename "$f" " Large.jpeg")
  cp "$f" "src/assets/photos/$n.jpg"
done

# Videos: H.264 MP4, shorter side <=540px, no audio, plus a poster frame.
SCALE="scale='if(gt(iw,ih),-2,min(540,iw))':'if(gt(iw,ih),min(540,ih),-2)'"
enc() { # enc <src> <name> [extra ffmpeg input args]
  src=$1; name=$2; shift 2
  ffmpeg -v error -y "$@" -i "media/$src" -vf "$SCALE" -c:v libx264 -preset slow -crf ${CRF:-28} \
    -pix_fmt yuv420p -movflags +faststart -an "public/video/$name.mp4"
  ffmpeg -v error -y -ss ${POSTER_AT:-0.3} -i "public/video/$name.mp4" -frames:v 1 -q:v 4 "public/video/$name.jpg"
}
enc just-found-2.mp4 just-found-2
POSTER_AT=5 enc new-home-meet-the-gang.MOV meet-the-gang
POSTER_AT=2.5 enc new-home-meet-the-gang-2.MOV meet-the-gang-2
CRF=33 enc surgery-back-home.MOV garden -ss 18 -t 14   # ambient background, the dogs running across the lawn

# Crew portraits: square crops, so each one sits correctly inside its circle on the page.
# Numbers are ffmpeg crop=W:H:X:Y on the "Large" source, chosen by eye.
portrait() { ffmpeg -v error -y -i "media/$1" -vf "crop=$2,scale=520:520" "src/assets/photos/crew-$3.jpg"; }
portrait "cara-happy-2 Large.jpeg"       520:520:70:260  cara
portrait "zuba Large.jpeg"               520:520:70:210  zuba
portrait "cookie Large.jpeg"             560:560:320:220 cookie
portrait "oreo Large.jpeg"               380:380:210:660 oreo
portrait "cats Large.jpeg"               500:500:60:440  cats

# Homepage TikTok preview, made from the finished vertical cut (node tiktok/make.mjs first).
if [ -f tiktok/out/cara-tiktok.mp4 ]; then
  ffmpeg -v error -y -i tiktok/out/cara-tiktok.mp4 -vf "scale=540:960" -c:v libx264 -preset slow -crf 30 \
    -pix_fmt yuv420p -movflags +faststart -an public/video/tiktok-preview.mp4
  ffmpeg -v error -y -ss 0.2 -i public/video/tiktok-preview.mp4 -frames:v 1 -q:v 4 public/video/tiktok-preview.jpg
fi

# Share image (1200x630) cropped from the full-res original.
ffmpeg -v error -y -i media/cara-happy-1.JPG -vf "scale=1200:-2,crop=1200:630:0:ih*0.30" -q:v 3 public/og.jpg
