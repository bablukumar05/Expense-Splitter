import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const GRADIENT = `
<linearGradient id="g" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#6d4aff"/>
  <stop offset="0.5" stop-color="#4f46e5"/>
  <stop offset="1" stop-color="#2563eb"/>
</linearGradient>`;

const GLYPH = `
<rect x="136" y="132" width="240" height="64" rx="26" fill="#ffffff" fill-opacity="0.55"/>
<rect x="112" y="168" width="288" height="196" rx="40" fill="#ffffff"/>
<rect x="290" y="232" width="110" height="68" rx="34" fill="#4f46e5"/>
<circle cx="330" cy="266" r="15" fill="#ffffff"/>`;

const icon = ({ rounded, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs>${GRADIENT}</defs>
<rect width="512" height="512" ${rounded ? 'rx="112"' : ""} fill="url(#g)"/>
<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${GLYPH}</g>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  ${GRADIENT}
  <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#050816"/>
    <stop offset="1" stop-color="#0b1026"/>
  </linearGradient>
  <radialGradient id="glow1" cx="0.1" cy="0" r="0.8">
    <stop offset="0" stop-color="#7c5cff" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#7c5cff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow2" cx="1" cy="0" r="0.7">
    <stop offset="0" stop-color="#22d3ee" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<rect width="1200" height="630" fill="url(#glow1)"/>
<rect width="1200" height="630" fill="url(#glow2)"/>
<g transform="translate(96 120) scale(0.5)">
  <rect width="512" height="512" rx="112" fill="url(#g)"/>${GLYPH}
</g>
<text x="96" y="450" font-family="Inter, Arial, Helvetica, sans-serif" font-size="104" font-weight="700" fill="#e8ebf8">Splitly</text>
<text x="96" y="520" font-family="Inter, Arial, Helvetica, sans-serif" font-size="40" fill="#8f98ba">Split expenses. Settle up smart.</text>
</svg>`;

const render = (svg, size, file) => sharp(Buffer.from(svg), { density: 144 }).resize(size, size).png().toFile(file);

await mkdir("public/icons", { recursive: true });
const normal = icon({ rounded: true, scale: 1 });
await writeFile("public/favicon.svg", normal);
await render(normal, 192, "public/icons/icon-192.png");
await render(normal, 512, "public/icons/icon-512.png");
await render(icon({ rounded: false, scale: 0.8 }), 512, "public/icons/maskable-512.png");
await render(icon({ rounded: false, scale: 0.9 }), 180, "public/icons/apple-touch-icon.png");
await sharp(Buffer.from(og), { density: 72 }).png().toFile("public/og.png");
console.log("Icons and OG image written to public/");
