import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = resolve(appRoot, '..', '..');

const paths = {
  sprites: join(appRoot, 'public', 'spritesheets'),
  tiled: join(appRoot, 'src', 'tiled'),
  source: join(repoRoot, 'assets', 'source', 'game', 'hd')
};

const sourceCardGeneratedAt = '2026-06-13T00:00:00.000Z';

const spriteSpecs = [
  {
    id: 'wayfarer',
    role: 'Player avatar',
    prompt: 'Mochirii Wayfarer in layered silk travel robes, jade sash, lacquer trim, soft wuxia lighting, transparent background, smooth illustrated 2D sprite sheet, original project-authored alpha asset.',
    kind: 'humanoid',
    palette: { robe: '#d85f4d', trim: '#4d7fa3', accent: '#f3c05f', hair: '#2f2528', skin: '#f5cda6' }
  },
  {
    id: 'sifu-narao',
    role: 'Welcome NPC and care shrine mentor',
    prompt: 'Sifu Narao, calm Mochirii guild mentor in jade and ivory robes with lacquered shoulder cords, warm lantern light, transparent background, smooth illustrated 2D sprite sheet.',
    kind: 'humanoid',
    palette: { robe: '#4f9b7c', trim: '#7a5a9e', accent: '#f6d47b', hair: '#273330', skin: '#ebc198' }
  },
  {
    id: 'spirit-lirabao',
    role: 'Mochi Spirit, certificate-eligible companion',
    prompt: 'Lirabao Mochi Spirit, blush cloud guardian with jade forehead mark, silk ribbon wisp, soft glow, gentle temperament, transparent background, smooth illustrated 2D sprite sheet.',
    kind: 'spirit',
    palette: { body: '#ee86aa', light: '#ffe6ef', accent: '#c64d79', trim: '#fff7f4' }
  },
  {
    id: 'spirit-jintari',
    role: 'Mochi Spirit, guild market affinity companion',
    prompt: 'Jintari Mochi Spirit, warm goldleaf guardian with lacquer ear-fins and lucky cord tail, bright temperament, transparent background, smooth illustrated 2D sprite sheet.',
    kind: 'spirit',
    palette: { body: '#eebd48', light: '#fff2ad', accent: '#b86f32', trim: '#fff7cc' }
  },
  {
    id: 'spirit-aozhen',
    role: 'Mochi Spirit, sky-jade scout companion',
    prompt: 'Aozhen Mochi Spirit, sky-jade guardian with mist crest and flowing tail, curious temperament, transparent background, smooth illustrated 2D sprite sheet.',
    kind: 'spirit',
    palette: { body: '#74bfde', light: '#d8f6ff', accent: '#4c83bb', trim: '#f3feff' }
  },
  {
    id: 'chest',
    role: 'Guild seal chest',
    prompt: 'Lacquered Mochirii guild seal chest with jade clasp, gold cord, soft contact shadow, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'chest',
    palette: { wood: '#8c4636', lid: '#c0653e', accent: '#f2c65f', jade: '#75b99e' }
  },
  {
    id: 'market-board',
    role: 'Fixed-price market board',
    prompt: 'Mochirii guild market board with lacquer posts, parchment tags, jade pins, warm lantern accent, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'board',
    palette: { wood: '#8d5639', roof: '#bf5148', cloth: '#f0dfb2', accent: '#f4c46f' }
  },
  {
    id: 'trade-post',
    role: 'Direct trade post',
    prompt: 'Mochirii trade post with jade cloth canopy, paired exchange charms, lacquer wood, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'board',
    palette: { wood: '#4f806f', roof: '#5d9a88', cloth: '#efe8b6', accent: '#9ed7b7' }
  },
  {
    id: 'training-ring',
    role: 'No-injury spirit training ring',
    prompt: 'Mochirii no-injury spirit training ring with jade floor circle, silk sparring ribbons, lacquer posts, warm lantern accents, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'ring',
    palette: { wood: '#5f4c45', floor: '#67a98d', ribbon: '#d85f4d', accent: '#f4c46f', light: '#fff0b6' }
  },
  {
    id: 'quest-board',
    role: 'Roleplay quest board',
    prompt: 'Mochirii roleplay quest board with layered parchment slips, jade pins, guild ribbons, lacquer frame, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'board',
    palette: { wood: '#78543f', roof: '#5c8f77', cloth: '#f4e7bd', accent: '#d85f4d' }
  },
  {
    id: 'canary-shrine',
    role: 'Enjin Canary preview-stub shrine',
    prompt: 'Canary preview shrine with violet lacquer base, gold crystal, no-real-value staging aura, transparent background, smooth illustrated 2D prop sprite sheet.',
    kind: 'shrine',
    palette: { base: '#665ba0', light: '#f6de66', accent: '#bca8e6', trim: '#fff4af' }
  }
];

await main();

async function main() {
  await mkdir(paths.sprites, { recursive: true });
  await mkdir(paths.tiled, { recursive: true });
  await mkdir(paths.source, { recursive: true });

  const runtimeSpriteFiles = new Set(spriteSpecs.map((spec) => `${spec.id}.png`));
  const existingSpriteFiles = await readdir(paths.sprites).catch(() => []);
  for (const file of existingSpriteFiles) {
    if (file.endsWith('.png') && !runtimeSpriteFiles.has(file)) {
      await rm(join(paths.sprites, file), { force: true });
    }
  }

  await exportTilesheet();
  for (const spec of spriteSpecs) {
    await exportSprite(spec);
  }
}

async function exportTilesheet() {
  const id = 'mochi-tiles';
  const masterPath = join(paths.source, `${id}-master.png`);
  const runtimePath = join(paths.tiled, `${id}.png`);
  const svg = tilesheetSvg();

  await sharp(Buffer.from(svg)).png().toFile(masterPath);
  await sharp(masterPath).resize(512, 192, { fit: 'fill' }).png().toFile(runtimePath);
  await writeSourceCard({
    id,
    role: 'Jade Lantern Court town tilesheet',
    runtimePath: 'apps/game/src/tiled/mochi-tiles.png',
    masterPath: 'assets/source/game/hd/mochi-tiles-master.png',
    masterDimensions: '1024x384',
    runtimeDimensions: '512x192',
    frameLayout: '8x3 tiles, 64x64 runtime tiles',
    prompt: 'Mochirii High-Fidelity Wuxia town tilesheet for Jade Lantern Court: jade grass, lacquer paths, silk-paper lanterns, guild garden, market, trade, and Canary shrine landmarks, smooth illustrated 2D, original generated-for-project world art.',
    exportStatus: 'project-authored/generated-for-project'
  });
}

async function exportSprite(spec) {
  const masterPath = join(paths.source, `${spec.id}-master.png`);
  const runtimePath = join(paths.sprites, `${spec.id}.png`);
  const svg = spriteSheetSvg(spec);

  await sharp(Buffer.from(svg)).png().toFile(masterPath);
  await sharp(masterPath).resize(384, 768, { fit: 'fill' }).png().toFile(runtimePath);
  await writeSourceCard({
    id: spec.id,
    role: spec.role,
    runtimePath: `apps/game/public/spritesheets/${spec.id}.png`,
    masterPath: `assets/source/game/hd/${spec.id}-master.png`,
    masterDimensions: '768x1536',
    runtimeDimensions: '384x768',
    frameLayout: '3x4 frames, 128x192 runtime frames',
    prompt: spec.prompt,
    exportStatus: 'project-authored/generated-for-project'
  });
}

async function writeSourceCard(card) {
  await writeFile(
    join(paths.source, `${card.id}.source.json`),
    `${JSON.stringify({ ...card, tool: 'sharp svg-to-png source-master export', generatedAt: sourceCardGeneratedAt }, null, 2)}\n`,
    'utf8'
  );
}

function spriteSheetSvg(spec) {
  const frameWidth = 256;
  const frameHeight = 384;
  const frames = [];

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      frames.push(`<g transform="translate(${col * frameWidth} ${row * frameHeight})">${drawSpriteFrame(spec, row, col)}</g>`);
    }
  }

  return svgWrap(768, 1536, `
    <defs>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
      <linearGradient id="silk-${spec.id}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${spec.palette.light || spec.palette.roof || spec.palette.lid || spec.palette.trim || '#fff0c0'}"/>
        <stop offset="58%" stop-color="${spec.palette.robe || spec.palette.body || spec.palette.wood || spec.palette.base || '#75b99e'}"/>
        <stop offset="100%" stop-color="#2a2828"/>
      </linearGradient>
      <radialGradient id="aura-${spec.id}" cx="50%" cy="44%" r="58%">
        <stop offset="0%" stop-color="${spec.palette.light || spec.palette.accent || '#fff1a8'}" stop-opacity="0.78"/>
        <stop offset="100%" stop-color="${spec.palette.accent || '#f0c36b'}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${frames.join('\n')}
  `);
}

function drawSpriteFrame(spec, row, col) {
  const bob = col === 1 ? -8 : col === 2 ? 5 : 0;
  if (spec.kind === 'humanoid') return humanoidFrame(spec, row, col, bob);
  if (spec.kind === 'spirit') return spiritFrame(spec, row, col, bob);
  if (spec.kind === 'chest') return chestFrame(spec, row, col, bob);
  if (spec.kind === 'board') return boardFrame(spec, row, col, bob);
  if (spec.kind === 'ring') return trainingRingFrame(spec, row, col, bob);
  return shrineFrame(spec, row, col, bob);
}

function humanoidFrame(spec, row, col, bob) {
  const side = row === 1 ? -12 : row === 2 ? 12 : 0;
  const back = row === 3;
  const step = col === 0 ? -9 : col === 2 ? 9 : 0;
  return `
    <ellipse cx="128" cy="316" rx="70" ry="22" fill="#071413" opacity="0.32" filter="url(#softShadow)"/>
    <path d="M80 150 C92 112 112 94 134 96 C166 100 184 122 190 160 L202 280 C175 302 90 302 61 280 Z" fill="#1c2222" opacity="0.9"/>
    <path d="M88 154 C102 120 118 108 134 108 C158 112 176 130 181 160 L190 275 C164 294 96 294 70 275 Z" fill="url(#silk-${spec.id})"/>
    <path d="M91 160 L71 257 C84 268 103 269 117 259 L126 169 Z" fill="${spec.palette.trim}" opacity="0.92"/>
    <path d="M166 162 L186 257 C173 268 154 269 140 259 L130 169 Z" fill="${spec.palette.trim}" opacity="0.92"/>
    <path d="M104 198 C126 209 146 209 166 198 L161 224 C139 235 117 235 96 224 Z" fill="#f8e7b8" opacity="0.94"/>
    <path d="M106 238 C124 251 145 251 162 238 L166 257 C142 271 118 271 94 257 Z" fill="${spec.palette.accent}" opacity="0.98"/>
    <path d="M120 154 L136 154 L139 282 L118 282 Z" fill="${spec.palette.accent}" opacity="0.75"/>
    <ellipse cx="${128 + side}" cy="${104 + bob}" rx="47" ry="52" fill="#151617"/>
    <ellipse cx="${128 + side}" cy="${112 + bob}" rx="40" ry="43" fill="${spec.palette.skin}"/>
    <path d="M88 ${104 + bob} C94 ${60 + bob} 115 ${50 + bob} 139 ${59 + bob} C165 ${69 + bob} 178 ${88 + bob} 169 ${114 + bob} C149 ${98 + bob} 120 ${94 + bob} 88 ${104 + bob} Z" fill="${spec.palette.hair}"/>
    <path d="M106 ${62 + bob} C118 ${41 + bob} 143 ${41 + bob} 155 ${62 + bob} L151 ${76 + bob} C135 ${67 + bob} 121 ${67 + bob} 110 ${76 + bob} Z" fill="${spec.palette.trim}"/>
    <path d="M111 ${72 + bob} C123 ${62 + bob} 141 ${62 + bob} 153 ${72 + bob}" stroke="${spec.palette.accent}" stroke-width="8" stroke-linecap="round" fill="none"/>
    ${back ? `<path d="M92 ${112 + bob} C112 ${138 + bob} 148 ${138 + bob} 168 ${112 + bob} L167 ${151 + bob} C139 ${164 + bob} 113 ${164 + bob} 88 ${151 + bob} Z" fill="${spec.palette.hair}"/>` : `
      <ellipse cx="${111 + side}" cy="${119 + bob}" rx="5" ry="7" fill="#1d1f20"/>
      <ellipse cx="${145 + side}" cy="${119 + bob}" rx="5" ry="7" fill="#1d1f20"/>
      <path d="M118 ${145 + bob} C127 ${152 + bob} 137 ${152 + bob} 146 ${145 + bob}" stroke="#7b3f3e" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="${113 + side}" cy="${116 + bob}" r="2" fill="#fff8d8"/>
      <circle cx="${147 + side}" cy="${116 + bob}" r="2" fill="#fff8d8"/>
    `}
    <path d="M74 286 C91 ${300 + step} 108 ${300 + step} 119 286 L113 331 C94 338 76 334 62 320 Z" fill="#181818"/>
    <path d="M182 286 C165 ${300 - step} 148 ${300 - step} 137 286 L143 331 C162 338 180 334 194 320 Z" fill="#181818"/>
    <path d="M70 274 C104 300 152 300 190 274" stroke="#fff4cf" stroke-opacity="0.28" stroke-width="7" stroke-linecap="round"/>
  `;
}

function spiritFrame(spec, row, col, bob) {
  const side = row === 1 ? -10 : row === 2 ? 10 : 0;
  const back = row === 3;
  return `
    <ellipse cx="128" cy="316" rx="55" ry="17" fill="#071413" opacity="0.24" filter="url(#softShadow)"/>
    <ellipse cx="${128 + side}" cy="${176 + bob}" rx="98" ry="92" fill="url(#aura-${spec.id})"/>
    <path d="M54 ${166 + bob} C64 ${99 + bob} 95 ${68 + bob} 131 ${73 + bob} C172 ${79 + bob} 203 ${111 + bob} 202 ${164 + bob} C202 ${229 + bob} 165 ${263 + bob} 124 ${260 + bob} C85 ${257 + bob} 52 ${224 + bob} 54 ${166 + bob} Z" fill="#202021" opacity="0.86"/>
    <path d="M64 ${167 + bob} C73 ${110 + bob} 100 ${83 + bob} 132 ${88 + bob} C167 ${93 + bob} 193 ${120 + bob} 192 ${165 + bob} C192 ${219 + bob} 160 ${248 + bob} 126 ${246 + bob} C92 ${244 + bob} 63 ${216 + bob} 64 ${167 + bob} Z" fill="url(#silk-${spec.id})"/>
    <ellipse cx="${113 + side}" cy="${136 + bob}" rx="32" ry="18" fill="${spec.palette.light}" opacity="0.72"/>
    <ellipse cx="${146 + side}" cy="${212 + bob}" rx="44" ry="24" fill="#fffdf1" opacity="0.16"/>
    ${spiritCrest(spec, side, bob)}
    ${back ? `<path d="M92 ${156 + bob} C114 ${137 + bob} 148 ${137 + bob} 169 ${156 + bob}" stroke="${spec.palette.accent}" stroke-width="14" stroke-linecap="round" fill="none"/>` : `
      <ellipse cx="${108 + side}" cy="${171 + bob}" rx="7" ry="10" fill="#1c1d1d"/>
      <ellipse cx="${150 + side}" cy="${171 + bob}" rx="7" ry="10" fill="#1c1d1d"/>
      <path d="M115 ${205 + bob} C126 ${214 + bob} 139 ${214 + bob} 150 ${205 + bob}" stroke="${spec.palette.accent}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="${111 + side}" cy="${167 + bob}" r="3" fill="#fffbe4"/>
      <circle cx="${153 + side}" cy="${167 + bob}" r="3" fill="#fffbe4"/>
    `}
    <path d="M86 ${230 + bob} C109 ${252 + bob} 148 ${252 + bob} 172 ${230 + bob}" stroke="${spec.palette.trim}" stroke-width="10" stroke-linecap="round" opacity="0.9" fill="none"/>
    <path d="M74 ${202 + bob} C42 ${213 + bob} 38 ${248 + bob} 67 ${260 + bob}" stroke="${spec.palette.trim}" stroke-width="18" stroke-linecap="round" opacity="0.68" fill="none"/>
    <path d="M182 ${202 + bob} C214 ${213 + bob} 218 ${248 + bob} 189 ${260 + bob}" stroke="${spec.palette.trim}" stroke-width="18" stroke-linecap="round" opacity="0.68" fill="none"/>
    <circle cx="${91 + side}" cy="${208 + bob}" r="9" fill="${spec.palette.light}" opacity="0.46"/>
    <circle cx="${166 + side}" cy="${206 + bob}" r="7" fill="${spec.palette.light}" opacity="0.42"/>
  `;
}

function spiritCrest(spec, side, bob) {
  if (spec.id === 'spirit-lirabao') {
    return `
      <path d="M72 ${145 + bob} C39 ${114 + bob} 53 ${76 + bob} 94 ${103 + bob}" fill="#202021"/>
      <path d="M184 ${145 + bob} C217 ${114 + bob} 203 ${76 + bob} 162 ${103 + bob}" fill="#202021"/>
      <path d="M80 ${143 + bob} C55 ${116 + bob} 67 ${91 + bob} 98 ${111 + bob}" fill="${spec.palette.trim}"/>
      <path d="M176 ${143 + bob} C201 ${116 + bob} 189 ${91 + bob} 158 ${111 + bob}" fill="${spec.palette.trim}"/>
      <path d="M127 ${107 + bob} L142 ${130 + bob} L128 ${145 + bob} L113 ${130 + bob} Z" fill="${spec.palette.accent}"/>
    `;
  }
  if (spec.id === 'spirit-jintari') {
    return `
      <path d="M78 ${151 + bob} L110 ${78 + bob} L134 ${143 + bob} Z" fill="#202021"/>
      <path d="M178 ${151 + bob} L146 ${78 + bob} L122 ${143 + bob} Z" fill="#202021"/>
      <path d="M86 ${147 + bob} L111 ${91 + bob} L127 ${141 + bob} Z" fill="${spec.palette.trim}"/>
      <path d="M170 ${147 + bob} L145 ${91 + bob} L129 ${141 + bob} Z" fill="${spec.palette.trim}"/>
      <path d="M126 ${103 + bob} C145 ${96 + bob} 158 ${111 + bob} 154 ${131 + bob}" stroke="${spec.palette.accent}" stroke-width="8" stroke-linecap="round" fill="none"/>
    `;
  }
  return `
    <path d="M104 ${139 + bob} L128 ${70 + bob} L152 ${139 + bob} Z" fill="#202021"/>
    <path d="M111 ${137 + bob} L128 ${85 + bob} L145 ${137 + bob} Z" fill="${spec.palette.trim}"/>
    <path d="M83 ${153 + bob} C65 ${126 + bob} 78 ${103 + bob} 108 ${122 + bob}" fill="${spec.palette.accent}" opacity="0.88"/>
    <path d="M173 ${153 + bob} C191 ${126 + bob} 178 ${103 + bob} 148 ${122 + bob}" fill="${spec.palette.accent}" opacity="0.88"/>
  `;
}

function chestFrame(spec, _row, col, _bob) {
  const open = col === 1;
  return `
    <ellipse cx="128" cy="318" rx="82" ry="22" fill="#071413" opacity="0.32" filter="url(#softShadow)"/>
    <ellipse cx="128" cy="218" rx="112" ry="92" fill="${spec.palette.accent}" opacity="${open ? '0.28' : '0.12'}"/>
    <path d="M52 184 L204 184 L218 299 L38 299 Z" fill="#231d1c"/>
    <path d="M61 190 L195 190 L206 289 L50 289 Z" fill="url(#silk-${spec.id})"/>
    <path d="M51 ${open ? 142 : 153} C66 98 190 98 205 ${open ? 142 : 153} L200 188 L56 188 Z" fill="#231d1c"/>
    <path d="M62 ${open ? 151 : 160} C78 117 178 117 194 ${open ? 151 : 160} L189 184 L67 184 Z" fill="${spec.palette.lid}"/>
    <path d="M123 150 L136 150 L139 296 L119 296 Z" fill="${spec.palette.accent}"/>
    <rect x="100" y="214" width="56" height="48" rx="12" fill="#211d1c"/>
    <rect x="111" y="218" width="34" height="30" rx="8" fill="${spec.palette.jade}"/>
    <path d="M76 201 C109 215 147 215 184 201" stroke="#fff0b6" stroke-width="8" stroke-opacity="0.36" fill="none"/>
    <path d="M78 268 C112 284 150 284 184 268" stroke="#1b1414" stroke-width="9" stroke-opacity="0.44" fill="none"/>
  `;
}

function boardFrame(spec, _row, _col, _bob) {
  const market = spec.id === 'market-board';
  return `
    <ellipse cx="128" cy="318" rx="76" ry="20" fill="#071413" opacity="0.32" filter="url(#softShadow)"/>
    <rect x="63" y="142" width="24" height="170" rx="9" fill="#221f1e"/>
    <rect x="169" y="142" width="24" height="170" rx="9" fill="#221f1e"/>
    <rect x="69" y="146" width="14" height="159" rx="6" fill="${spec.palette.wood}"/>
    <rect x="173" y="146" width="14" height="159" rx="6" fill="${spec.palette.wood}"/>
    <path d="M43 116 L213 116 L196 158 L60 158 Z" fill="#221f1e"/>
    <path d="M55 121 L201 121 L190 151 L66 151 Z" fill="${spec.palette.roof}"/>
    <rect x="58" y="154" width="140" height="118" rx="16" fill="#221f1e"/>
    <rect x="70" y="164" width="116" height="96" rx="13" fill="url(#silk-${spec.id})"/>
    <rect x="88" y="184" width="80" height="42" rx="8" fill="${spec.palette.cloth}"/>
    <path d="M96 197 H159 M96 211 H148 M96 224 H139" stroke="#8b6947" stroke-width="7" stroke-linecap="round" opacity="0.72"/>
    ${market ? `
      <ellipse cx="194" cy="179" rx="17" ry="25" fill="#221f1e"/>
      <ellipse cx="194" cy="179" rx="12" ry="20" fill="${spec.palette.accent}"/>
      <path d="M191 165 H197 V193 H191 Z" fill="#fff1b8" opacity="0.52"/>
    ` : `
      <circle cx="111" cy="242" r="13" fill="${spec.palette.accent}"/>
      <circle cx="148" cy="242" r="13" fill="#f0d26f"/>
      <path d="M122 242 H137" stroke="#fff6cf" stroke-width="8" stroke-linecap="round"/>
    `}
    <path d="M69 160 C100 173 154 173 187 160" stroke="#fff1b8" stroke-width="8" stroke-opacity="0.26" fill="none"/>
  `;
}

function trainingRingFrame(spec, _row, col, _bob) {
  const pulse = col === 1 ? 0.34 : 0.2;
  return `
    <ellipse cx="128" cy="318" rx="88" ry="22" fill="#071413" opacity="0.32" filter="url(#softShadow)"/>
    <ellipse cx="128" cy="218" rx="104" ry="66" fill="${spec.palette.light}" opacity="${pulse}"/>
    <ellipse cx="128" cy="232" rx="88" ry="48" fill="#201d1c"/>
    <ellipse cx="128" cy="226" rx="76" ry="40" fill="${spec.palette.floor}"/>
    <ellipse cx="128" cy="226" rx="52" ry="25" fill="none" stroke="#fff4cf" stroke-width="9" stroke-opacity="0.56"/>
    <path d="M65 205 C94 189 162 189 191 205" stroke="${spec.palette.accent}" stroke-width="10" stroke-linecap="round" opacity="0.84" fill="none"/>
    <path d="M68 249 C96 269 160 269 188 249" stroke="#2f6b5b" stroke-width="8" stroke-linecap="round" opacity="0.74" fill="none"/>
    <rect x="54" y="122" width="20" height="166" rx="8" fill="#221f1e"/>
    <rect x="59" y="130" width="10" height="149" rx="5" fill="${spec.palette.wood}"/>
    <rect x="182" y="122" width="20" height="166" rx="8" fill="#221f1e"/>
    <rect x="187" y="130" width="10" height="149" rx="5" fill="${spec.palette.wood}"/>
    <path d="M64 140 C92 164 164 164 192 140" stroke="${spec.palette.ribbon}" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path d="M70 158 C99 177 157 177 186 158" stroke="#fff3d0" stroke-width="6" stroke-linecap="round" opacity="0.42" fill="none"/>
    <circle cx="64" cy="126" r="16" fill="#221f1e"/>
    <circle cx="64" cy="126" r="10" fill="${spec.palette.accent}"/>
    <circle cx="192" cy="126" r="16" fill="#221f1e"/>
    <circle cx="192" cy="126" r="10" fill="${spec.palette.accent}"/>
    <path d="M102 207 L119 221 L102 235 M154 207 L137 221 L154 235" stroke="#fff7d4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.78" fill="none"/>
  `;
}

function shrineFrame(spec, _row, col, _bob) {
  const pulse = col === 1 ? 0.55 : 0.32;
  return `
    <ellipse cx="128" cy="318" rx="76" ry="20" fill="#071413" opacity="0.32" filter="url(#softShadow)"/>
    <ellipse cx="128" cy="176" rx="104" ry="122" fill="${spec.palette.light}" opacity="${pulse}"/>
    <path d="M62 253 L194 253 L211 306 L45 306 Z" fill="#221f1e"/>
    <path d="M73 257 L183 257 L197 295 L59 295 Z" fill="${spec.palette.base}"/>
    <path d="M70 183 L186 183 L197 259 L59 259 Z" fill="#221f1e"/>
    <path d="M83 192 L173 192 L181 249 L75 249 Z" fill="url(#silk-${spec.id})"/>
    <path d="M77 143 L179 143 L188 191 L68 191 Z" fill="#221f1e"/>
    <path d="M91 150 L165 150 L174 181 L82 181 Z" fill="${spec.palette.accent}"/>
    <path d="M128 68 L166 152 L128 205 L90 152 Z" fill="#221f1e"/>
    <path d="M128 85 L154 151 L128 190 L102 151 Z" fill="${spec.palette.light}"/>
    <path d="M125 101 H132 V174 H125 Z" fill="${spec.palette.trim}" opacity="0.92"/>
    <path d="M96 208 H160 M88 232 H168" stroke="#fff4bb" stroke-width="10" stroke-linecap="round" opacity="0.32"/>
    <circle cx="128" cy="155" r="16" fill="#fffbe0" opacity="0.48"/>
  `;
}

function tilesheetSvg() {
  const tileSize = 128;
  const materials = [
    ['jade-grass', '#4c9366', '#2e704f', 'grass'],
    ['lacquer-path', '#e4b670', '#8c6247', 'path'],
    ['court-water', '#5198bd', '#215f91', 'water'],
    ['timber-wall', '#8b5a3d', '#3f2e2b', 'wall'],
    ['silk-garden', '#579562', '#2e704f', 'garden'],
    ['guild-marker', '#6c8f79', '#3f6255', 'sign'],
    ['market-roof', '#b64d45', '#6a3735', 'market'],
    ['canary-floor', '#6a609f', '#3f3a72', 'canary'],
    ['paper-lantern', '#4d9363', '#2e704f', 'lantern'],
    ['spirit-habitat', '#659c74', '#42684f', 'habitat'],
    ['moon-bridge', '#b78650', '#6f4e39', 'bridge'],
    ['red-awning', '#a64d45', '#512f2f', 'awning'],
    ['canary-marker', '#766ab0', '#4b417f', 'marker'],
    ['soft-shadow', '#4b9365', '#2d634b', 'shadow'],
    ['bamboo', '#4d9962', '#2d6a49', 'bamboo'],
    ['lacquer-plank', '#7d5a42', '#45352f', 'plank'],
    ['shrine-stone', '#cfc4a4', '#827970', 'stone'],
    ['trade-counter', '#5c8d78', '#385f55', 'counter'],
    ['blossom-bed', '#8d5171', '#3d754e', 'blossom'],
    ['water-bank', '#4c91b6', '#285f84', 'bank'],
    ['guild-seal-cue', '#8c4937', '#4d2f2c', 'chest'],
    ['care-shrine', '#c7574d', '#623a39', 'care'],
    ['canary-shrine', '#665ba0', '#3b356a', 'shrine'],
    ['trade-post-cue', '#5a9a88', '#365e55', 'trade']
  ];

  const tiles = materials.map(([name, top, bottom, kind], index) => {
    const x = (index % 8) * tileSize;
    const y = Math.floor(index / 8) * tileSize;
    return `<g transform="translate(${x} ${y})">${tileSvg(name, top, bottom, kind)}</g>`;
  });

  return svgWrap(1024, 384, `
    <defs>
      <filter id="tileSoft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
    </defs>
    ${tiles.join('\n')}
  `);
}

function tileSvg(name, top, bottom, kind) {
  return `
    <defs>
      <linearGradient id="${name}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${top}"/>
        <stop offset="100%" stop-color="${bottom}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="0" fill="url(#${name})"/>
    <path d="M0 3 H128 M0 124 H128 M125 0 V128" stroke="#fff7cf" stroke-opacity="0.08" stroke-width="4"/>
    ${tileMarks(kind)}
  `;
}

function tileMarks(kind) {
  const commonShadow = `<ellipse cx="64" cy="99" rx="43" ry="12" fill="#071413" opacity="0.18" filter="url(#tileSoft)"/>`;
  const marks = {
    grass: `<path d="M18 31 H48 M76 24 H104 M23 82 H52 M82 89 H112" stroke="#b9d88e" stroke-width="5" stroke-linecap="round" opacity="0.42"/>`,
    path: `<path d="M0 42 H128 M0 84 H128 M44 0 V42 M89 43 V84 M31 84 V128" stroke="#76573f" stroke-width="5" opacity="0.36"/><path d="M13 19 H44 M72 64 H105 M50 106 H91" stroke="#fff0bc" stroke-width="5" opacity="0.36"/>`,
    water: `<path d="M11 31 C29 21 46 41 65 31 C84 21 99 41 117 31 M6 72 C24 62 42 82 62 72 C83 62 101 82 123 72" stroke="#d3f4ee" stroke-width="8" stroke-linecap="round" opacity="0.58"/>`,
    wall: `<path d="M0 29 H128 M0 64 H128 M0 98 H128 M36 0 V128 M91 0 V128" stroke="#2b2220" stroke-width="7" opacity="0.55"/><path d="M14 15 H50 M70 49 H112 M12 84 H47" stroke="#d79b65" stroke-width="5" opacity="0.34"/>`,
    garden: `${commonShadow}<circle cx="38" cy="45" r="13" fill="#f29ab3"/><circle cx="73" cy="39" r="12" fill="#f2cc67"/><circle cx="94" cy="68" r="11" fill="#c993df"/><path d="M28 81 C58 67 87 69 112 86" stroke="#2b6b48" stroke-width="10" fill="none"/>`,
    sign: `${commonShadow}<rect x="58" y="28" width="13" height="72" rx="5" fill="#432d29"/><rect x="30" y="22" width="68" height="37" rx="9" fill="#f0dca4" stroke="#322927" stroke-width="7"/><path d="M42 41 H85" stroke="#ba584d" stroke-width="7" stroke-linecap="round"/>`,
    market: `${commonShadow}<path d="M19 40 L109 40 L94 78 L34 78 Z" fill="#d76354" stroke="#2c2322" stroke-width="7"/><rect x="34" y="78" width="60" height="32" fill="#633a33"/><path d="M50 91 H78" stroke="#f5cf77" stroke-width="7"/>`,
    canary: `<circle cx="64" cy="64" r="45" fill="#bdaee9" opacity="0.48"/><path d="M64 20 L96 64 L64 108 L32 64 Z" fill="#f7df6d" opacity="0.9"/><path d="M64 10 V118 M10 64 H118" stroke="#fff7ba" stroke-width="7" opacity="0.45"/>`,
    lantern: `${commonShadow}<rect x="58" y="18" width="13" height="78" rx="6" fill="#55372f"/><ellipse cx="64" cy="70" rx="24" ry="31" fill="#f3c95e" stroke="#3a2927" stroke-width="6"/><path d="M52 60 H76 M52 78 H76" stroke="#fff0ad" stroke-width="5" opacity="0.72"/>`,
    habitat: `${commonShadow}<ellipse cx="64" cy="80" rx="47" ry="27" fill="#d6a35d" stroke="#332827" stroke-width="7"/><ellipse cx="64" cy="67" rx="31" ry="17" fill="#fff0b8"/><path d="M47 80 H82" stroke="#ef87a5" stroke-width="8" stroke-linecap="round"/>`,
    bridge: `<rect x="10" y="35" width="108" height="62" rx="12" fill="#b17d4e" stroke="#2d2423" stroke-width="7"/><path d="M13 55 H115 M13 77 H115 M42 35 V97 M84 35 V97" stroke="#5f4035" stroke-width="7" opacity="0.58"/>`,
    awning: `${commonShadow}<path d="M19 36 L109 36 L97 67 L31 67 Z" fill="#d55d4f" stroke="#2c2322" stroke-width="7"/><rect x="33" y="68" width="62" height="40" fill="#704237"/><rect x="45" y="78" width="38" height="18" fill="#ead8a9"/>`,
    marker: `${commonShadow}<circle cx="64" cy="62" r="39" fill="#8a7bc6" stroke="#372e59" stroke-width="8"/><path d="M64 28 L83 64 L64 101 L45 64 Z" fill="#f7df6d"/><circle cx="64" cy="64" r="13" fill="#fff8c9" opacity="0.68"/>`,
    shadow: `<ellipse cx="64" cy="64" rx="51" ry="33" fill="#071413" opacity="0.38" filter="url(#tileSoft)"/><ellipse cx="64" cy="64" rx="31" ry="18" fill="#0d221f" opacity="0.25"/>`,
    bamboo: `<path d="M34 25 V105 M63 16 V110 M91 30 V104" stroke="#a1c76d" stroke-width="12" stroke-linecap="round"/><path d="M23 45 H54 M50 66 H82 M77 50 H112" stroke="#2f734e" stroke-width="8" stroke-linecap="round"/>`,
    plank: `<path d="M0 33 H128 M0 70 H128 M0 103 H128 M33 0 V128 M88 0 V128" stroke="#2f2927" stroke-width="7" opacity="0.54"/><path d="M20 19 H67 M52 55 H114 M15 91 H66" stroke="#d59a64" stroke-width="5" opacity="0.32"/>`,
    stone: `${commonShadow}<rect x="26" y="34" width="76" height="65" rx="12" fill="#d7ccb0" stroke="#514a42" stroke-width="7"/><path d="M38 56 H88 M44 74 H78" stroke="#8c806e" stroke-width="6" stroke-linecap="round"/>`,
    counter: `${commonShadow}<rect x="30" y="54" width="68" height="48" rx="9" fill="#6e4435" stroke="#2a2221" stroke-width="7"/><circle cx="51" cy="80" r="10" fill="#efc75d"/><circle cx="78" cy="80" r="10" fill="#95d1b2"/>`,
    blossom: `${commonShadow}<ellipse cx="64" cy="73" rx="47" ry="24" fill="#d789aa" stroke="#2e2428" stroke-width="7"/><circle cx="46" cy="57" r="10" fill="#ffd6e3"/><circle cx="83" cy="61" r="11" fill="#ffd16d"/>`,
    bank: `<rect y="0" width="128" height="36" fill="#4e9164"/><path d="M0 39 C32 30 58 49 89 38 C106 32 118 34 128 41" stroke="#e5bd7c" stroke-width="13" fill="none"/><path d="M8 74 C32 62 48 82 72 70 C95 59 108 77 122 70" stroke="#d4f3ef" stroke-width="7" fill="none" opacity="0.56"/>`,
    chest: `${commonShadow}<rect x="34" y="59" width="60" height="42" rx="8" fill="#8c4937" stroke="#271f1e" stroke-width="7"/><path d="M38 59 C44 33 84 33 90 59" fill="#bf653f" stroke="#271f1e" stroke-width="7"/><rect x="58" y="58" width="13" height="44" fill="#f2c65f"/>`,
    care: `${commonShadow}<rect x="37" y="42" width="54" height="66" rx="13" fill="#c7574d" stroke="#2c2322" stroke-width="7"/><path d="M64 54 L82 78 L64 101 L46 78 Z" fill="#fff0b4"/><path d="M50 94 H78" stroke="#f0c462" stroke-width="8" stroke-linecap="round"/>`,
    shrine: `${commonShadow}<rect x="34" y="66" width="60" height="44" rx="9" fill="#665ba0" stroke="#2c2544" stroke-width="7"/><path d="M64 20 L91 66 L64 96 L37 66 Z" fill="#f6de66" stroke="#2c2544" stroke-width="7"/><path d="M64 31 V84" stroke="#fff6bd" stroke-width="7"/>`,
    trade: `${commonShadow}<path d="M22 45 L106 45 L95 75 L33 75 Z" fill="#5a9a88" stroke="#2a2422" stroke-width="7"/><rect x="35" y="75" width="58" height="31" fill="#61473a"/><circle cx="54" cy="91" r="8" fill="#f0c462"/><circle cx="75" cy="91" r="8" fill="#9ed7b7"/>`
  };
  return marks[kind] || marks.grass;
}

function svgWrap(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}
