export const MOCHI_SPIRITS = [
  {
    id: 'momo',
    name: 'Momo',
    title: 'Blush Mochi Spirit',
    sprite: 'spirit-momo',
    habitat: 'Lantern Garden',
    temperament: 'gentle',
    certificateEligible: true
  },
  {
    id: 'yuzu',
    name: 'Yuzu',
    title: 'Citrus Mochi Spirit',
    sprite: 'spirit-yuzu',
    habitat: 'Lantern Garden',
    temperament: 'bright',
    certificateEligible: false
  },
  {
    id: 'sora',
    name: 'Sora',
    title: 'Sky Mochi Spirit',
    sprite: 'spirit-sora',
    habitat: 'Lantern Garden',
    temperament: 'curious',
    certificateEligible: false
  }
] as const;

export const ALPHA_ITEMS = {
  token: {
    id: 'mochi-token',
    name: 'Mochi Token',
    description: 'A tiny proof that you visited the first Mochi Social town.'
  },
  charm: {
    id: 'lantern-charm',
    name: 'Lantern Charm',
    description: 'A no-real-value alpha market item for fixed-price and trade testing.'
  },
  certificate: {
    id: 'momo-canary-certificate',
    name: 'Momo Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
} as const;

export function growthStageFromBond(bond: number) {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
}
