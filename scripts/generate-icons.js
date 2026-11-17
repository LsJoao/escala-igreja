import fs from 'fs';
import zlib from 'zlib';

function createPNG(size, bgHex, circleHex) {
  const width = size;
  const height = size;

  const parseHex = (hex) => {
    const c = parseInt(hex.replace('#', ''), 16);
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  };

  const [bgR, bgG, bgB] = parseHex(bgHex);
  const [fgR, fgG, fgB] = parseHex(circleHex);

  const rowLength = 1 + width * 4;
  const rawBuffer = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.22;
  const coreRadius = width * 0.09;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawBuffer[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle background with rounded corner (radius)
      // Check rounded rect
      const cornerR = width * 0.24;
      const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);
      const inBg = cornerDist <= cornerR;

      if (!inBg) {
        // Transparent outside squircle
        rawBuffer[pxOffset] = 0;
        rawBuffer[pxOffset + 1] = 0;
        rawBuffer[pxOffset + 2] = 0;
        rawBuffer[pxOffset + 3] = 0;
        continue;
      }

      // Draw inside icon
      // Ring & Lens
      const inRing = Math.abs(dist - radius * 0.65) < width * 0.025;
      const inCore = dist < coreRadius;
      const inAperture = dist < innerRadius && dist > innerRadius * 0.7;

      // Camera rectangle
      const inCamRect = Math.abs(dx + width * 0.05) < width * 0.18 && Math.abs(dy) < width * 0.14;
      // Camera trapezoid lens
      const inTrapezoid = dx > width * 0.13 && dx < width * 0.28 && Math.abs(dy) < (dx - width * 0.1) * 0.8;

      if (inCore || inRing || inAperture || inCamRect || inTrapezoid) {
        rawBuffer[pxOffset] = fgR;
        rawBuffer[pxOffset + 1] = fgG;
        rawBuffer[pxOffset + 2] = fgB;
        rawBuffer[pxOffset + 3] = 255;
      } else {
        // Gradient background
        const t = (y / height);
        rawBuffer[pxOffset] = Math.round(bgR * (1 - t * 0.2));
        rawBuffer[pxOffset + 1] = Math.round(bgG * (1 - t * 0.15));
        rawBuffer[pxOffset + 2] = Math.round(bgB * (1 - t * 0.1));
        rawBuffer[pxOffset + 3] = 255;
      }
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawBuffer);

  // Helper CRC32
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    buf.writeUInt32BE(crc32(typeAndData), 8 + len);
    return buf;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, '#0071E3', '#FFFFFF'));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, '#0071E3', '#FFFFFF'));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, '#0071E3', '#FFFFFF'));
fs.writeFileSync('public/favicon.ico', createPNG(64, '#0071E3', '#FFFFFF'));
console.log('PWA icons created successfully');
