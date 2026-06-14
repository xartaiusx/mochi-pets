export const ALPHA_FEATURES = {
  alpha: {
    allowlistRequired: true,
    termsRequired: true,
    noRealValue: true,
    testerAge: '18+',
    access: 'signed-in-allowlist',
    stopPoint: 'alpha-rc-ready'
  },
  economy: {
    mode: 'test-soft-currency',
    hotLedger: 'supabase-postgres',
    coldInventory: 'enjin-managed-wallet',
    realValue: false
  },
  chain: {
    provider: 'enjin',
    network: 'CANARY',
    custody: 'managed-hot-cold',
    finalityRequired: true
  },
  market: {
    fixedPrice: true,
    directTrade: true,
    auctions: false,
    cashout: false
  },
  gameplay: {
    spiritCapture: true,
    spiritCaptureRites: true,
    spiritAttunement: true,
    routeInvitations: true,
    routeMastery: true,
    habitatBonds: true,
    spiritSanctuaryRites: true,
    spiritResearch: true,
    spiritCompendium: true,
    spiritRosterArchives: true,
    spiritCareCycles: true,
    spiritTemperamentConcords: true,
    spiritFieldAlmanacs: true,
    routeEcologySurveys: true,
    spiritEncounterAtlases: true,
    spiritCraftWrits: true,
    tradeExchangeAccords: true,
    routeWaystones: true,
    spiritNurtureRites: true,
    spiritRecoveryTeas: true,
    spiritKinshipAlbums: true,
    spiritNurseryGroves: true,
    partyFormation: true,
    partyHarmony: true,
    harmonyTrials: true,
    teamSparMatches: true,
    mentorChallenges: true,
    spiritTournamentBrackets: true,
    spiritRivalCircles: true,
    spiritStoryChapters: true,
    battleRoundTranscripts: true,
    conditionWeaves: true,
    fieldExpeditions: true,
    fieldAccords: true,
    routePatrols: true,
    itemProvisions: true,
    guildCommissions: true,
    socialRallies: true,
    wayfarerChronicles: true,
    guildAscensionTrials: true,
    guildInsigniaCases: true,
    affinityTrials: true,
    affinityMatrices: true,
    battleTactics: true,
    techniqueLoadouts: true,
    spiritTraits: true,
    guildRankTrials: true,
    spiritGrowthRites: true,
    sparringLadder: true,
    trainingBattles: true,
    techniqueMastery: true,
    raisingCare: true,
    bondMilestones: true,
    roleplayQuests: true,
    questChains: true,
    spiritJournal: true,
    copiedUpstreamContent: false
  },
  ugc: 'curated'
} as const;

export const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback'
} as const;

export const SERVER_ENV_CONTRACT = [
  'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
  'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
  'ENJIN_PLATFORM_URL',
  'ENJIN_PLATFORM_TOKEN',
  'ENJIN_NETWORK',
  'ENJIN_COLLECTION_ID',
  'ENJIN_FUEL_TANK_ID'
] as const;

export const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'spirit.capture',
  'spirit.capture_rite',
  'spirit.route_invite',
  'world.route_mastery',
  'world.route_patrol',
  'spirit.habitat_bond',
  'spirit.sanctuary_rite',
  'spirit.research',
  'spirit.compendium_complete',
  'spirit.roster_archive',
  'spirit.care_cycle',
  'spirit.temperament_concord',
  'spirit.field_almanac',
  'world.route_ecology',
  'world.encounter_atlas',
  'item.craft_writ',
  'world.route_waystone',
  'spirit.nurture_rite',
  'spirit.recovery_tea',
  'spirit.kinship_album',
  'spirit.nursery_grove',
  'item.provision_satchel',
  'guild.commission_complete',
  'guild.social_rally',
  'guild.wayfarer_chronicle',
  'guild.ascension_trial',
  'spirit.attune',
  'spirit.bond',
  'spirit.care',
  'spirit.journal',
  'world.expedition',
  'spirit.technique',
  'spirit.technique_loadout',
  'spirit.trait_attune',
  'battle.tactic_scroll',
  'guild.rank_trial',
  'spirit.growth_rite',
  'party.set',
  'party.harmony_form',
  'battle.harmony_trial',
  'battle.team_spar_match',
  'battle.mentor_challenge',
  'battle.tournament_bracket',
  'battle.rival_circle',
  'story.chapter_complete',
  'guild.insignia_case',
  'battle.condition_weave',
  'battle.affinity_trial',
  'battle.affinity_matrix',
  'battle.spar_ladder',
  'spirit.train',
  'spirit.raise',
  'quest.accept',
  'quest.progress',
  'market.fixed_list',
  'trade.direct_offer',
  'trade.exchange_accord',
  'chain.withdraw_request',
  'chain.deposit_request',
  'chain.operation_update'
] as const;

export type AlphaActionType = (typeof ALPHA_ACTION_TYPES)[number];

export interface AlphaActionEnvelope {
  requestId: string;
  type: AlphaActionType;
  playerId?: string;
  payload: Record<string, unknown>;
}

export function isAlphaActionEnvelope(value: unknown): value is AlphaActionEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AlphaActionEnvelope>;
  return (
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 8 &&
    typeof candidate.type === 'string' &&
    ALPHA_ACTION_TYPES.includes(candidate.type as AlphaActionType) &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null
  );
}
