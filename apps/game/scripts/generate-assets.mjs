import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const paths = {
  sprites: join(root, 'public', 'spritesheets'),
  tiled: join(root, 'src', 'tiled')
};

function main() {
  mkdirSync(paths.sprites, { recursive: true });
  mkdirSync(paths.tiled, { recursive: true });

  writePng(join(paths.tiled, 'mochi-tiles.png'), drawTilesheet());
  writePng(join(paths.sprites, 'mochi.png'), drawCharacterSheet({ body: [247, 145, 100, 255], trim: [91, 121, 184, 255] }));
  writePng(join(paths.sprites, 'friend.png'), drawCharacterSheet({ body: [116, 201, 157, 255], trim: [98, 87, 164, 255] }));
  writePng(join(paths.sprites, 'chest.png'), drawChestSheet());
}

function drawTilesheet() {
  const image = makeImage(128, 64, [0, 0, 0, 0]);
  tile(image, 0, 0, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [87, 168, 93, 255]);
    fill(img, ox + 5, oy + 7, 3, 2, [122, 198, 116, 255]);
    fill(img, ox + 19, oy + 20, 4, 2, [63, 132, 75, 255]);
  });
  tile(image, 1, 0, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [203, 176, 112, 255]);
    fill(img, ox, oy + 13, 32, 6, [189, 159, 96, 255]);
  });
  tile(image, 2, 0, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [67, 147, 189, 255]);
    fill(img, ox + 2, oy + 9, 28, 3, [116, 196, 218, 255]);
    fill(img, ox + 8, oy + 22, 18, 2, [45, 105, 157, 255]);
  });
  tile(image, 3, 0, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [106, 91, 75, 255]);
    fill(img, ox, oy + 5, 32, 4, [132, 111, 87, 255]);
    fill(img, ox + 6, oy, 4, 32, [75, 64, 58, 255]);
    fill(img, ox + 21, oy, 4, 32, [75, 64, 58, 255]);
  });
  tile(image, 0, 1, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [87, 168, 93, 255]);
    fill(img, ox + 13, oy + 18, 4, 8, [53, 119, 67, 255]);
    fill(img, ox + 9, oy + 12, 6, 6, [241, 105, 152, 255]);
    fill(img, ox + 16, oy + 10, 6, 6, [255, 221, 112, 255]);
  });
  tile(image, 1, 1, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [87, 168, 93, 255]);
    fill(img, ox + 13, oy + 8, 6, 18, [126, 79, 53, 255]);
    fill(img, ox + 8, oy + 6, 16, 8, [244, 232, 175, 255]);
    outline(img, ox + 8, oy + 6, 16, 8, [81, 70, 52, 255]);
  });
  tile(image, 2, 1, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [118, 83, 58, 255]);
    fill(img, ox + 3, oy + 4, 26, 8, [158, 110, 68, 255]);
    fill(img, ox + 5, oy + 13, 22, 14, [86, 58, 46, 255]);
  });
  tile(image, 3, 1, (img, ox, oy) => {
    fill(img, ox, oy, 32, 32, [119, 111, 180, 255]);
    fill(img, ox + 4, oy + 4, 24, 24, [157, 147, 207, 255]);
  });
  return image;
}

function drawCharacterSheet(colors) {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      fill(image, ox + 8, oy + 39, 16, 4, [0, 0, 0, 55]);
      fill(image, ox + 10, oy + 13, 12, 10, colors.body);
      fill(image, ox + 8, oy + 22, 16, 18, colors.body);
      fill(image, ox + 9, oy + 31, 5, 10, colors.trim);
      fill(image, ox + 18, oy + 31, 5, 10, colors.trim);
      fill(image, ox + 12, oy + 17, 2, 2, [33, 36, 39, 255]);
      fill(image, ox + 18, oy + 17, 2, 2, [33, 36, 39, 255]);
      fill(image, ox + 13 + col, oy + 24, 6, 2, [255, 236, 202, 255]);
    }
  }
  return image;
}

function drawChestSheet() {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      fill(image, ox + 6, oy + 35, 20, 4, [0, 0, 0, 50]);
      fill(image, ox + 7, oy + 20, 18, 15, [126, 75, 47, 255]);
      fill(image, ox + 7, oy + 17, 18, 8, [175, 102, 57, 255]);
      fill(image, ox + 15, oy + 17, 3, 18, [237, 188, 92, 255]);
      fill(image, ox + 13, oy + 25, 7, 5, [77, 52, 42, 255]);
    }
  }
  return image;
}

function makeImage(width, height, color) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  }
  return { width, height, data };
}

function tile(image, col, row, painter) {
  painter(image, col * 32, row * 32);
}

function fill(image, x, y, width, height, color) {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      setPixel(image, xx, yy, color);
    }
  }
}

function outline(image, x, y, width, height, color) {
  fill(image, x, y, width, 1, color);
  fill(image, x, y + height - 1, width, 1, color);
  fill(image, x, y, 1, height, color);
  fill(image, x + width - 1, y, 1, height, color);
}

function setPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const index = (y * image.width + x) * 4;
  image.data[index] = color[0];
  image.data[index + 1] = color[1];
  image.data[index + 2] = color[2];
  image.data[index + 3] = color[3];
}

function writePng(path, image) {
  writeFileSync(path, encodePng(image.width, image.height, image.data));
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', Buffer.concat([uint32(width), uint32(height), Buffer.from([8, 6, 0, 0, 0])])),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([uint32(data.length), typeBuffer, data, uint32(crc32(Buffer.concat([typeBuffer, data])))]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

main();
