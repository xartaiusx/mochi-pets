import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const paths = {
  sprites: join(root, 'public', 'spritesheets'),
  tiled: join(root, 'src', 'tiled')
};

const colors = {
  ink: [34, 30, 27, 255],
  softInk: [54, 45, 40, 255],
  shadow: [10, 20, 18, 72],
  deepShadow: [8, 14, 13, 110],
  grassTop: [67, 144, 91, 255],
  grassBottom: [42, 112, 77, 255],
  grassLight: [124, 199, 121, 255],
  grassDark: [34, 92, 66, 255],
  pathTop: [226, 193, 119, 255],
  pathBottom: [158, 112, 74, 255],
  pathEdge: [103, 75, 57, 255],
  waterTop: [75, 157, 197, 255],
  waterBottom: [31, 91, 139, 255],
  waterLight: [173, 229, 229, 255],
  timber: [115, 69, 48, 255],
  timberDark: [67, 43, 37, 255],
  timberLight: [184, 111, 64, 255],
  roof: [183, 61, 58, 255],
  roofDark: [111, 45, 47, 255],
  lantern: [255, 206, 103, 255],
  lanternLight: [255, 239, 160, 255],
  jade: [86, 144, 124, 255],
  jadeDark: [44, 95, 82, 255],
  jadeLight: [151, 207, 179, 255],
  parchment: [245, 224, 164, 255],
  gold: [239, 188, 78, 255],
  canary: [245, 225, 116, 255],
  violet: [119, 101, 177, 255],
  violetLight: [183, 166, 226, 255],
  blush: [241, 135, 169, 255],
  yuzu: [244, 191, 76, 255],
  sora: [112, 188, 224, 255]
};

function main() {
  mkdirSync(paths.sprites, { recursive: true });
  mkdirSync(paths.tiled, { recursive: true });

  writePng(join(paths.tiled, 'mochi-tiles.png'), drawTilesheet());
  writePng(
    join(paths.sprites, 'mochi.png'),
    drawCharacterSheet({
      robe: [228, 126, 89, 255],
      trim: [78, 116, 176, 255],
      accent: colors.gold,
      hair: [48, 36, 34, 255],
      skin: [255, 219, 183, 255]
    })
  );
  writePng(
    join(paths.sprites, 'friend.png'),
    drawCharacterSheet({
      robe: [93, 178, 139, 255],
      trim: [102, 83, 163, 255],
      accent: colors.lantern,
      hair: [51, 59, 54, 255],
      skin: [246, 212, 174, 255]
    })
  );
  writePng(join(paths.sprites, 'chest.png'), drawChestSheet());
  writePng(
    join(paths.sprites, 'spirit-momo.png'),
    drawSpiritSheet({
      body: colors.blush,
      light: [255, 222, 231, 255],
      trim: [255, 245, 248, 255],
      accent: [205, 78, 125, 255],
      variant: 'momo'
    })
  );
  writePng(
    join(paths.sprites, 'spirit-yuzu.png'),
    drawSpiritSheet({
      body: colors.yuzu,
      light: [255, 239, 157, 255],
      trim: [255, 250, 202, 255],
      accent: [187, 118, 44, 255],
      variant: 'yuzu'
    })
  );
  writePng(
    join(paths.sprites, 'spirit-sora.png'),
    drawSpiritSheet({
      body: colors.sora,
      light: [212, 245, 255, 255],
      trim: [240, 252, 255, 255],
      accent: [68, 126, 183, 255],
      variant: 'sora'
    })
  );
  writePng(
    join(paths.sprites, 'market-board.png'),
    drawBoardSheet({
      wood: [134, 84, 55, 255],
      roof: colors.roof,
      cloth: colors.parchment,
      accent: colors.gold,
      mode: 'market'
    })
  );
  writePng(
    join(paths.sprites, 'trade-post.png'),
    drawBoardSheet({
      wood: [78, 125, 112, 255],
      roof: [91, 139, 130, 255],
      cloth: [236, 231, 183, 255],
      accent: colors.jadeLight,
      mode: 'trade'
    })
  );
  writePng(join(paths.sprites, 'canary-shrine.png'), drawShrineSheet());
}

function drawTilesheet() {
  const image = makeImage(256, 96, [0, 0, 0, 0]);
  tile(image, 0, 0, paintGrass);
  tile(image, 1, 0, paintPath);
  tile(image, 2, 0, paintWater);
  tile(image, 3, 0, paintTimberWall);
  tile(image, 4, 0, paintFlowerGarden);
  tile(image, 5, 0, paintGuildSign);
  tile(image, 6, 0, paintMarketWall);
  tile(image, 7, 0, paintCanaryFloor);
  tile(image, 0, 1, paintLantern);
  tile(image, 1, 1, paintHabitatBed);
  tile(image, 2, 1, paintBridge);
  tile(image, 3, 1, paintRedAwning);
  tile(image, 4, 1, paintCanaryMarker);
  tile(image, 5, 1, paintSoftShadow);
  tile(image, 6, 1, paintBamboo);
  tile(image, 7, 1, paintTimberPlank);
  tile(image, 0, 2, paintShrineStone);
  tile(image, 1, 2, paintTradeCounter);
  tile(image, 2, 2, paintBlossomPatch);
  tile(image, 3, 2, paintWaterBank);
  tile(image, 4, 2, paintChestMarker);
  tile(image, 5, 2, paintCareShrine);
  tile(image, 6, 2, paintCanaryShrineTile);
  tile(image, 7, 2, paintTradePostTile);
  return image;
}

function paintGrass(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, colors.grassTop, colors.grassBottom);
  scatterGrass(image, ox, oy);
  fill(image, ox + 2, oy + 26, 5, 1, [91, 169, 105, 255]);
  fill(image, ox + 19, oy + 8, 4, 1, [29, 92, 61, 255]);
}

function paintPath(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, colors.pathTop, colors.pathBottom);
  fill(image, ox, oy + 5, 32, 2, [238, 211, 141, 255]);
  fill(image, ox, oy + 15, 32, 2, [184, 135, 84, 255]);
  fill(image, ox, oy + 25, 32, 2, [130, 91, 65, 255]);
  fill(image, ox + 3, oy + 7, 8, 1, [250, 226, 157, 255]);
  fill(image, ox + 17, oy + 21, 9, 1, colors.pathEdge);
  fill(image, ox + 12, oy + 3, 2, 24, [199, 154, 92, 150]);
}

function paintWater(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, colors.waterTop, colors.waterBottom);
  fill(image, ox + 1, oy + 8, 30, 2, colors.waterLight);
  fill(image, ox + 7, oy + 20, 20, 2, [45, 111, 160, 255]);
  fill(image, ox + 20, oy + 14, 7, 1, [223, 250, 247, 255]);
  fill(image, ox + 3, oy + 27, 24, 2, [21, 73, 118, 255]);
}

function paintTimberWall(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [120, 82, 61, 255], colors.timberDark);
  fill(image, ox, oy + 5, 32, 4, colors.timberLight);
  fill(image, ox + 6, oy, 4, 32, [54, 37, 34, 255]);
  fill(image, ox + 21, oy, 4, 32, [54, 37, 34, 255]);
  fill(image, ox + 2, oy + 15, 28, 2, [43, 32, 31, 255]);
  fill(image, ox + 3, oy + 23, 26, 1, [149, 93, 62, 255]);
}

function paintFlowerGarden(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 15, oy + 22, 10, 5, [37, 105, 66, 255]);
  flower(image, ox + 9, oy + 14, colors.blush);
  flower(image, ox + 17, oy + 12, colors.lantern);
  flower(image, ox + 23, oy + 17, [212, 140, 196, 255]);
  fill(image, ox + 13, oy + 18, 3, 8, [48, 120, 71, 255]);
}

function paintGuildSign(image, ox, oy) {
  paintGrass(image, ox, oy);
  fill(image, ox + 14, oy + 8, 4, 18, [95, 60, 42, 255]);
  fill(image, ox + 8, oy + 7, 16, 8, colors.parchment);
  outline(image, ox + 8, oy + 7, 16, 8, colors.softInk);
  fill(image, ox + 10, oy + 10, 12, 1, colors.roof);
  fill(image, ox + 10, oy + 13, 9, 1, colors.gold);
  fillEllipse(image, ox + 16, oy + 27, 14, 3, colors.shadow);
}

function paintMarketWall(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [128, 82, 56, 255], [62, 42, 37, 255]);
  fill(image, ox + 3, oy + 4, 26, 8, [178, 104, 62, 255]);
  fill(image, ox + 5, oy + 13, 22, 14, [80, 51, 42, 255]);
  fill(image, ox + 13, oy + 13, 6, 14, colors.gold);
  fill(image, ox + 9, oy + 20, 14, 2, [48, 35, 33, 255]);
  fill(image, ox + 8, oy + 9, 16, 2, [232, 166, 82, 255]);
}

function paintCanaryFloor(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [97, 94, 158, 255], [69, 70, 122, 255]);
  fill(image, ox + 4, oy + 4, 24, 24, [151, 145, 203, 255]);
  fill(image, ox + 8, oy + 8, 16, 16, colors.violetLight);
  fill(image, ox + 14, oy + 3, 4, 26, colors.canary);
  fill(image, ox + 3, oy + 14, 26, 4, [238, 215, 99, 220]);
  outline(image, ox + 4, oy + 4, 24, 24, [74, 62, 119, 255]);
}

function paintLantern(image, ox, oy) {
  paintGrass(image, ox, oy);
  fill(image, ox + 14, oy + 5, 4, 22, [84, 55, 42, 255]);
  fill(image, ox + 10, oy + 8, 12, 4, colors.roof);
  fillEllipse(image, ox + 16, oy + 18, 10, 12, colors.lantern);
  fill(image, ox + 12, oy + 15, 8, 10, colors.lanternLight);
  outline(image, ox + 12, oy + 13, 8, 12, [107, 56, 44, 255]);
  fillEllipse(image, ox + 16, oy + 25, 16, 4, [255, 189, 76, 70]);
}

function paintHabitatBed(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 23, 23, 8, [62, 125, 77, 255]);
  fill(image, ox + 6, oy + 18, 20, 8, [218, 178, 92, 255]);
  fill(image, ox + 9, oy + 13, 14, 10, [249, 233, 170, 255]);
  outline(image, ox + 8, oy + 13, 16, 11, [82, 66, 50, 255]);
  fill(image, ox + 12, oy + 17, 8, 2, colors.blush);
}

function paintBridge(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [181, 135, 80, 255], [126, 78, 54, 255]);
  fill(image, ox, oy + 16, 32, 5, [146, 89, 59, 255]);
  fill(image, ox + 2, oy + 4, 28, 3, [235, 190, 101, 255]);
  fill(image, ox + 5, oy + 23, 23, 3, [92, 62, 50, 255]);
  fill(image, ox + 4, oy + 8, 2, 16, [83, 54, 43, 255]);
  fill(image, ox + 25, oy + 8, 2, 16, [83, 54, 43, 255]);
}

function paintRedAwning(image, ox, oy) {
  paintGrass(image, ox, oy);
  fill(image, ox + 5, oy + 10, 22, 13, colors.timber);
  fill(image, ox + 3, oy + 8, 26, 5, colors.roof);
  fill(image, ox + 5, oy + 8, 22, 2, [235, 96, 79, 255]);
  fill(image, ox + 8, oy + 15, 16, 5, colors.parchment);
  fill(image, ox + 11, oy + 20, 10, 2, colors.gold);
  fillEllipse(image, ox + 16, oy + 26, 20, 4, colors.shadow);
}

function paintCanaryMarker(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 17, 21, 21, colors.violet);
  fillEllipse(image, ox + 16, oy + 17, 14, 14, colors.violetLight);
  fill(image, ox + 14, oy + 5, 4, 23, colors.canary);
  fill(image, ox + 9, oy + 15, 14, 3, colors.lanternLight);
  outline(image, ox + 8, oy + 8, 16, 16, [73, 58, 119, 255]);
}

function paintSoftShadow(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 17, 22, 19, [9, 19, 18, 96]);
  fillEllipse(image, ox + 16, oy + 17, 13, 10, [18, 32, 28, 68]);
}

function paintBamboo(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [57, 127, 80, 255], [38, 94, 67, 255]);
  fill(image, ox + 4, oy + 24, 24, 3, [29, 72, 53, 255]);
  bambooStalk(image, ox + 7, oy + 8, 16, [73, 132, 81, 255]);
  bambooStalk(image, ox + 14, oy + 5, 20, [91, 156, 86, 255]);
  bambooStalk(image, ox + 22, oy + 10, 15, [62, 115, 74, 255]);
  fill(image, ox + 5, oy + 12, 7, 2, [120, 183, 101, 255]);
  fill(image, ox + 18, oy + 7, 8, 2, [111, 174, 99, 255]);
}

function paintTimberPlank(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [115, 86, 65, 255], [74, 54, 49, 255]);
  fill(image, ox + 2, oy + 8, 28, 5, [154, 108, 72, 255]);
  fill(image, ox + 4, oy + 18, 24, 5, [82, 61, 54, 255]);
  fill(image, ox + 8, oy + 3, 1, 24, [51, 39, 37, 120]);
  fill(image, ox + 22, oy + 4, 1, 23, [51, 39, 37, 120]);
}

function paintShrineStone(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 24, 23, 6, colors.shadow);
  fill(image, ox + 5, oy + 9, 22, 17, [161, 149, 128, 255]);
  fill(image, ox + 8, oy + 11, 16, 12, [222, 214, 188, 255]);
  outline(image, ox + 5, oy + 9, 22, 17, [88, 78, 65, 255]);
  fill(image, ox + 12, oy + 15, 8, 3, colors.jade);
}

function paintTradeCounter(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 25, 21, 5, colors.shadow);
  fill(image, ox + 8, oy + 13, 16, 11, colors.timber);
  fill(image, ox + 10, oy + 9, 12, 5, colors.parchment);
  fill(image, ox + 15, oy + 6, 2, 17, colors.softInk);
  fill(image, ox + 9, oy + 16, 14, 3, colors.jadeLight);
  fill(image, ox + 12, oy + 20, 3, 2, colors.gold);
  fill(image, ox + 18, oy + 20, 3, 2, colors.canary);
}

function paintBlossomPatch(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [65, 133, 86, 255], [42, 103, 72, 255]);
  fillEllipse(image, ox + 16, oy + 24, 23, 6, [34, 82, 59, 255]);
  fill(image, ox + 6, oy + 15, 20, 8, [199, 86, 122, 255]);
  fill(image, ox + 10, oy + 10, 12, 6, [255, 223, 145, 255]);
  flower(image, ox + 8, oy + 14, colors.blush);
  flower(image, ox + 22, oy + 16, [236, 155, 190, 255]);
}

function paintWaterBank(image, ox, oy) {
  fillGradient(image, ox, oy, 32, 32, [62, 137, 184, 255], [36, 96, 148, 255]);
  fill(image, ox, oy, 32, 7, [66, 116, 84, 255]);
  fill(image, ox + 2, oy + 7, 28, 3, [213, 181, 108, 255]);
  fill(image, ox + 5, oy + 18, 20, 2, colors.waterLight);
  fill(image, ox + 1, oy + 28, 26, 2, [24, 76, 122, 255]);
}

function paintChestMarker(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 25, 19, 5, colors.shadow);
  fill(image, ox + 7, oy + 13, 18, 11, [119, 70, 47, 255]);
  fill(image, ox + 8, oy + 10, 16, 6, [211, 124, 63, 255]);
  outline(image, ox + 7, oy + 13, 18, 11, colors.softInk);
  fill(image, ox + 15, oy + 10, 3, 14, colors.gold);
  fill(image, ox + 11, oy + 18, 10, 2, [69, 45, 39, 255]);
}

function paintCareShrine(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 25, 20, 5, colors.shadow);
  fill(image, ox + 9, oy + 8, 14, 16, colors.roof);
  fill(image, ox + 12, oy + 11, 8, 8, colors.lanternLight);
  fill(image, ox + 10, oy + 19, 12, 4, colors.gold);
  outline(image, ox + 9, oy + 8, 14, 16, [102, 46, 43, 255]);
  fillEllipse(image, ox + 16, oy + 17, 18, 16, [255, 202, 86, 44]);
}

function paintCanaryShrineTile(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 25, 21, 5, colors.shadow);
  fill(image, ox + 5, oy + 8, 22, 18, [93, 80, 145, 255]);
  fill(image, ox + 9, oy + 11, 14, 10, colors.violetLight);
  fill(image, ox + 13, oy + 4, 6, 23, colors.canary);
  fill(image, ox + 8, oy + 18, 16, 3, colors.lanternLight);
  outline(image, ox + 5, oy + 8, 22, 18, [64, 53, 103, 255]);
}

function paintTradePostTile(image, ox, oy) {
  paintGrass(image, ox, oy);
  fillEllipse(image, ox + 16, oy + 26, 21, 5, colors.shadow);
  fill(image, ox + 5, oy + 20, 22, 6, [76, 52, 42, 255]);
  fill(image, ox + 4, oy + 12, 24, 10, [79, 132, 123, 255]);
  fill(image, ox + 8, oy + 15, 16, 3, [244, 237, 184, 255]);
  fill(image, ox + 11, oy + 20, 3, 2, colors.gold);
  fill(image, ox + 19, oy + 20, 3, 2, colors.jadeLight);
}

function drawCharacterSheet(theme) {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      drawCharacterFrame(image, ox, oy, row, col, theme);
    }
  }
  return image;
}

function drawCharacterFrame(image, ox, oy, row, col, theme) {
  const step = col === 0 ? -1 : col === 2 ? 1 : 0;
  const bob = col === 1 ? -1 : 0;
  const side = row === 1 ? -1 : row === 2 ? 1 : 0;
  const facingUp = row === 3;

  fillEllipse(image, ox + 16, oy + 40, 19, 5, colors.shadow);
  fill(image, ox + 10 + step, oy + 32, 5, 9, theme.trim);
  fill(image, ox + 18 - step, oy + 32, 5, 9, theme.trim);
  fill(image, ox + 9, oy + 21 + bob, 14, 18, colors.softInk);
  fill(image, ox + 10, oy + 20 + bob, 12, 18, theme.robe);
  fill(image, ox + 11, oy + 24 + bob, 10, 3, [255, 231, 187, 255]);
  fill(image, ox + 8, oy + 22 + bob, 4, 12, theme.trim);
  fill(image, ox + 21, oy + 22 + bob, 4, 12, theme.trim);
  fill(image, ox + 12, oy + 28 + bob, 8, 2, theme.accent);
  fill(image, ox + 11 + step, oy + 36, 4, 5, colors.ink);
  fill(image, ox + 18 - step, oy + 36, 4, 5, colors.ink);

  fillEllipse(image, ox + 16 + side, oy + 16 + bob, 13, 12, theme.skin);
  fill(image, ox + 10 + side, oy + 8 + bob, 12, 7, theme.hair);
  fill(image, ox + 11 + side, oy + 7 + bob, 10, 3, theme.trim);
  fill(image, ox + 13 + side, oy + 6 + bob, 6, 2, theme.accent);

  if (facingUp) {
    fill(image, ox + 10, oy + 15 + bob, 12, 6, theme.hair);
    fill(image, ox + 12, oy + 21 + bob, 8, 2, theme.trim);
  } else if (side) {
    fill(image, ox + 16 + side * 3, oy + 16 + bob, 2, 2, colors.ink);
    fill(image, ox + 14 + side * 2, oy + 20 + bob, 4, 1, [116, 56, 50, 255]);
  } else {
    fill(image, ox + 12, oy + 17 + bob, 2, 2, colors.ink);
    fill(image, ox + 18, oy + 17 + bob, 2, 2, colors.ink);
    fill(image, ox + 14, oy + 20 + bob, 4, 1, [116, 56, 50, 255]);
  }

  fill(image, ox + 9, oy + 21 + bob, 1, 17, colors.ink);
  fill(image, ox + 22, oy + 21 + bob, 1, 17, colors.ink);
  fill(image, ox + 11, oy + 39, 11, 1, colors.ink);
}

function drawSpiritSheet(theme) {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      drawSpiritFrame(image, ox, oy, row, col, theme);
    }
  }
  return image;
}

function drawSpiritFrame(image, ox, oy, row, col, theme) {
  const bob = col === 1 ? -2 : col === 2 ? 1 : 0;
  const side = row === 1 ? -1 : row === 2 ? 1 : 0;
  const facingUp = row === 3;

  fillEllipse(image, ox + 16, oy + 39, 17, 4, colors.shadow);
  fillEllipse(image, ox + 16, oy + 25 + bob, 24, 22, [...theme.body.slice(0, 3), 44]);
  fillEllipse(image, ox + 16 + side, oy + 24 + bob, 20, 18, theme.body);
  fillEllipse(image, ox + 16 + side, oy + 20 + bob, 13, 9, theme.light);
  fillEllipse(image, ox + 16 + side, oy + 28 + bob, 15, 7, [255, 255, 255, 52]);

  if (theme.variant === 'momo') {
    fillEllipse(image, ox + 8 + side, oy + 18 + bob, 6, 8, theme.trim);
    fillEllipse(image, ox + 24 + side, oy + 18 + bob, 6, 8, theme.trim);
    flower(image, ox + 21 + side, oy + 15 + bob, theme.accent);
  }
  if (theme.variant === 'yuzu') {
    fillTri(image, ox + 9 + side, oy + 19 + bob, ox + 14 + side, oy + 10 + bob, ox + 16 + side, oy + 20 + bob, theme.trim);
    fillTri(image, ox + 23 + side, oy + 19 + bob, ox + 18 + side, oy + 10 + bob, ox + 16 + side, oy + 20 + bob, theme.trim);
    fill(image, ox + 15 + side, oy + 12 + bob, 3, 5, theme.accent);
  }
  if (theme.variant === 'sora') {
    fillTri(image, ox + 12 + side, oy + 18 + bob, ox + 16 + side, oy + 9 + bob, ox + 20 + side, oy + 18 + bob, theme.trim);
    fill(image, ox + 10 + side, oy + 16 + bob, 12, 2, theme.accent);
    fillEllipse(image, ox + 24 + side, oy + 25 + bob, 6, 4, theme.trim);
  }

  if (!facingUp) {
    fill(image, ox + 12 + side, oy + 24 + bob, 2, 2, colors.ink);
    fill(image, ox + 19 + side, oy + 24 + bob, 2, 2, colors.ink);
    fill(image, ox + 14 + side, oy + 30 + bob, 5, 2, theme.trim);
  } else {
    fill(image, ox + 11 + side, oy + 22 + bob, 10, 4, theme.accent);
  }

  fillEllipse(image, ox + 16 + side, oy + 33 + bob, 8, 3, theme.accent);
}

function drawChestSheet() {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      const glow = col === 1 ? 24 : 0;
      fillEllipse(image, ox + 16, oy + 37, 21, 5, colors.shadow);
      fillEllipse(image, ox + 16, oy + 27, 24, 19, [255, 203, 93, glow]);
      fill(image, ox + 6, oy + 22, 20, 13, [102, 62, 43, 255]);
      fill(image, ox + 7, oy + 17, 18, 8, [184, 103, 56, 255]);
      fill(image, ox + 8, oy + 20, 16, 3, [224, 143, 68, 255]);
      fill(image, ox + 15, oy + 17, 3, 18, colors.gold);
      fill(image, ox + 11, oy + 25, 10, 5, colors.softInk);
      fill(image, ox + 14, oy + 26, 4, 2, colors.lanternLight);
      outline(image, ox + 6, oy + 22, 20, 13, colors.ink);
      fill(image, ox + 8, oy + 33, 16, 2, [58, 39, 35, 255]);
    }
  }
  return image;
}

function drawBoardSheet(theme) {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      const bob = col === 1 ? -1 : 0;
      fillEllipse(image, ox + 16, oy + 39, 20, 5, colors.shadow);
      fill(image, ox + 9, oy + 20 + bob, 3, 18, theme.wood);
      fill(image, ox + 20, oy + 20 + bob, 3, 18, theme.wood);
      fill(image, ox + 7, oy + 17 + bob, 18, 18, theme.wood);
      fill(image, ox + 5, oy + 14 + bob, 22, 5, theme.roof);
      fill(image, ox + 9, oy + 21 + bob, 14, 9, theme.cloth);
      outline(image, ox + 7, oy + 17 + bob, 18, 18, colors.ink);
      fill(image, ox + 11, oy + 23 + bob, 10, 1, [255, 255, 255, 165]);
      fill(image, ox + 11, oy + 27 + bob, 10, 1, [102, 77, 55, 145]);
      fill(image, ox + 11, oy + 31 + bob, 8, 1, theme.accent);
      if (theme.mode === 'market') {
        fillEllipse(image, ox + 24, oy + 20 + bob, 4, 6, colors.lantern);
        fill(image, ox + 23, oy + 18 + bob, 3, 1, colors.roofDark);
      } else {
        fill(image, ox + 11, oy + 33 + bob, 4, 2, colors.gold);
        fill(image, ox + 17, oy + 33 + bob, 4, 2, colors.jadeLight);
      }
    }
  }
  return image;
}

function drawShrineSheet() {
  const image = makeImage(96, 192, [0, 0, 0, 0]);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const ox = col * 32;
      const oy = row * 48;
      const pulse = col === 1 ? 28 : 12;
      fillEllipse(image, ox + 16, oy + 39, 20, 5, colors.shadow);
      fillEllipse(image, ox + 16, oy + 24, 24, 25, [255, 231, 107, pulse]);
      fill(image, ox + 7, oy + 31, 18, 7, [82, 72, 134, 255]);
      fill(image, ox + 9, oy + 24, 14, 8, colors.violet);
      fill(image, ox + 10, oy + 19, 12, 5, colors.gold);
      fill(image, ox + 14, oy + 10, 4, 12, colors.lanternLight);
      fill(image, ox + 12, oy + 13, 8, 8, colors.canary);
      fill(image, ox + 7, oy + 27, 18, 4, [61, 51, 101, 255]);
      fill(image, ox + 9, oy + 17, 14, 2, colors.lanternLight);
      outline(image, ox + 7, oy + 31, 18, 7, colors.ink);
    }
  }
  return image;
}

function tile(image, col, row, painter) {
  painter(image, col * 32, row * 32);
}

function scatterGrass(image, ox, oy) {
  fill(image, ox + 4, oy + 6, 4, 2, colors.grassLight);
  fill(image, ox + 17, oy + 5, 3, 2, colors.grassDark);
  fill(image, ox + 23, oy + 15, 5, 2, colors.grassLight);
  fill(image, ox + 8, oy + 21, 4, 2, colors.grassDark);
  fill(image, ox + 15, oy + 26, 6, 2, colors.grassLight);
}

function flower(image, x, y, color) {
  fill(image, x, y + 1, 1, 1, color);
  fill(image, x + 1, y, 1, 1, color);
  fill(image, x + 1, y + 1, 1, 1, colors.lanternLight);
  fill(image, x + 2, y + 1, 1, 1, color);
  fill(image, x + 1, y + 2, 1, 1, color);
}

function bambooStalk(image, x, y, height, color) {
  fill(image, x, y, 4, height, color);
  for (let offset = 5; offset < height; offset += 6) {
    fill(image, x, y + offset, 4, 1, [38, 91, 57, 255]);
  }
  fill(image, x + 1, y, 1, height, [146, 198, 105, 120]);
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

function fill(image, x, y, width, height, color) {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      setPixel(image, xx, yy, color);
    }
  }
}

function fillGradient(image, x, y, width, height, top, bottom) {
  for (let yy = 0; yy < height; yy += 1) {
    const amount = height <= 1 ? 0 : yy / (height - 1);
    fill(image, x, y + yy, width, 1, mix(top, bottom, amount));
  }
}

function fillEllipse(image, cx, cy, width, height, color) {
  const rx = Math.max(1, width / 2);
  const ry = Math.max(1, height / 2);
  const minX = Math.floor(cx - rx);
  const maxX = Math.ceil(cx + rx);
  const minY = Math.floor(cy - ry);
  const maxY = Math.ceil(cy + ry);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        setPixel(image, x, y, color);
      }
    }
  }
}

function fillTri(image, x1, y1, x2, y2, x3, y3, color) {
  const minX = Math.floor(Math.min(x1, x2, x3));
  const maxX = Math.ceil(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3));
  const maxY = Math.ceil(Math.max(y1, y2, y3));
  const area = edge(x1, y1, x2, y2, x3, y3);
  if (area === 0) return;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const w0 = edge(x2, y2, x3, y3, x, y);
      const w1 = edge(x3, y3, x1, y1, x, y);
      const w2 = edge(x1, y1, x2, y2, x, y);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
        setPixel(image, x, y, color);
      }
    }
  }
}

function edge(x1, y1, x2, y2, x, y) {
  return (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
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
  const alpha = color[3] ?? 255;
  if (alpha >= 255) {
    image.data[index] = color[0];
    image.data[index + 1] = color[1];
    image.data[index + 2] = color[2];
    image.data[index + 3] = 255;
    return;
  }

  const existingAlpha = image.data[index + 3] / 255;
  const nextAlpha = alpha / 255;
  const outAlpha = nextAlpha + existingAlpha * (1 - nextAlpha);
  if (outAlpha <= 0) return;

  image.data[index] = Math.round((color[0] * nextAlpha + image.data[index] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  image.data[index + 1] = Math.round((color[1] * nextAlpha + image.data[index + 1] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  image.data[index + 2] = Math.round((color[2] * nextAlpha + image.data[index + 2] * existingAlpha * (1 - nextAlpha)) / outAlpha);
  image.data[index + 3] = Math.round(outAlpha * 255);
}

function mix(a, b, amount) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount),
    Math.round((a[3] ?? 255) + ((b[3] ?? 255) - (a[3] ?? 255)) * amount)
  ];
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
