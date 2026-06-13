import { PrebuiltGui } from '@rpgjs/common';
import type { EventDefinition, RpgPlayer } from '@rpgjs/server';
import { ALPHA_ITEMS, MOCHI_SPIRITS, growthStageFromBond, type MochiSpirit } from '../../alpha/content';

const ALPHA_PROMPT_MS = 2600;

type AlphaHudStatePatch = {
  canaryRequested?: boolean;
  charmListed?: boolean;
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  sealClaimed?: boolean;
  tradeProof?: boolean;
};

function showAlphaPrompt(player: RpgPlayer, message: string) {
  if (typeof player.gui !== 'function' || typeof player.removeGui !== 'function') {
    void player.showText(message);
    return;
  }

  const gui = player.gui(PrebuiltGui.Dialog);
  void gui.open(
    {
      message,
      choices: [],
      autoClose: true,
      fullWidth: false,
      typewriterEffect: false
    },
    {
      waitingAction: false,
      blockPlayerInput: false
    }
  );

  const openId = gui.openId;
  setTimeout(() => {
    player.removeGui(PrebuiltGui.Dialog, undefined, openId);
  }, ALPHA_PROMPT_MS);
}

function emitAlphaHudState(player: RpgPlayer, patch: AlphaHudStatePatch) {
  if (typeof (player as { emit?: unknown }).emit === 'function') {
    (player as { emit(type: string, value?: unknown): void }).emit('mochi-social-alpha-state', patch);
  }
}

export const SPIRITS = [
  ...MOCHI_SPIRITS
] as const;

export function WelcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(player: RpgPlayer) {
      player.showNotification('Guild spark found', { time: 1800, icon: 'sifu-narao' });
      showAlphaPrompt(
        player,
        'Welcome to Mochi Social. This closed alpha guild court is no-real-value and Canary-only, but it is ready for Mochirii spirit testing with friends.'
      );
    }
  };
}

function bondedSpirits(player: RpgPlayer): string[] {
  const spirits = player.getVariable<string[]>('mochiSocial.spirits.bonded');
  return Array.isArray(spirits) ? spirits : [];
}

export function SpiritEvent(spirit: MochiSpirit): EventDefinition {
  return {
    onInit() {
      this.setGraphic(spirit.sprite);
    },

    async onAction(player: RpgPlayer) {
      const spirits = bondedSpirits(player);
      if (spirits.includes(spirit.id)) {
        showAlphaPrompt(player, `${spirit.name} drifts close by. Your Mochi Spirit bond is already started.`);
        return;
      }

      spirits.push(spirit.id);
      player.setVariable('mochiSocial.spirits.bonded', spirits);
      player.setVariable('mochiSocial.spirits.active', spirit.id);
      player.setVariable(`mochiSocial.spirit.${spirit.id}.bond`, 1);
      player.setVariable(`mochiSocial.spirit.${spirit.id}.growth`, 'seed');
      player.setVariable(`mochiSocial.spirit.${spirit.id}.journalUnlocked`, true);
      player.showNotification(`${spirit.name} bonded`, { time: 1800, icon: spirit.sprite });
      emitAlphaHudState(player, { spirit: { id: spirit.id, bond: 1, growth: 'seed' } });
      await player.save('auto', { title: 'Mochi Spirit bonded' }, { reason: 'auto', source: 'spirit-bond' });
      showAlphaPrompt(player, `${spirit.name} joined your Mochirii spirit journal. Offer care at the court shrine to grow your bond.`);
    }
  };
}

export function CareShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = player.getVariable<string>('mochiSocial.spirits.active') || bondedSpirits(player)[0];
      if (!activeSpirit) {
        showAlphaPrompt(player, 'The Jade Lantern Court shrine warms gently. Bond with a Mochi Spirit first, then return to care for it.');
        return;
      }

      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const nextBond = Math.min(5, Number(player.getVariable<number>(bondKey) || 1) + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      player.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(player, { spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth } });
      await player.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'spirit-care' });
      showAlphaPrompt(player, `Care complete. Your companion is now in ${nextGrowth} growth with bond ${nextBond}/5.`);
    }
  };
}

export function MarketBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('market-board');
    },

    async onAction(player: RpgPlayer) {
      if (!player.getVariable<boolean>('mochiSocial.alpha.charmListed')) {
        player.addItem(ALPHA_ITEMS.charm, 1);
        player.setVariable('mochiSocial.alpha.charmListed', true);
        player.showNotification('Fixed listing proof', { time: 1800, icon: 'market-board' });
        emitAlphaHudState(player, { charmListed: true });
        await player.save('auto', { title: 'Alpha market proof' }, { reason: 'auto', source: 'market-board' });
        showAlphaPrompt(player, 'You listed a Jade Thread Charm for test soft currency. This proves fixed-price market flow without real value.');
        return;
      }

      showAlphaPrompt(player, 'Your Jade Thread Charm listing proof is already recorded for this alpha save.');
    }
  };
}

export function TradePost(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('trade-post');
    },

    async onAction(player: RpgPlayer) {
      player.setVariable('mochiSocial.alpha.tradeProof', true);
      player.showNotification('Direct trade proof', { time: 1800, icon: 'trade-post' });
      emitAlphaHudState(player, { tradeProof: true });
      await player.save('auto', { title: 'Alpha trade proof' }, { reason: 'auto', source: 'trade-post' });
      showAlphaPrompt(player, 'Direct trade proof recorded. Alpha direct trades stay eligible-assets-only and no-real-value.');
    }
  };
}

export function CanaryShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('canary-shrine');
    },

    async onAction(player: RpgPlayer) {
      if (!bondedSpirits(player).includes('lirabao')) {
        showAlphaPrompt(player, 'The Canary shrine responds to Lirabao certificates first. Bond with Lirabao before staging this proof.');
        return;
      }

      if (!player.getVariable<boolean>('mochiSocial.alpha.canaryCertificateRequested')) {
        player.addItem(ALPHA_ITEMS.certificate, 1);
        player.setVariable('mochiSocial.alpha.canaryCertificateRequested', true);
      }
      player.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
      emitAlphaHudState(player, { canaryRequested: true });
      await player.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
      showAlphaPrompt(
        player,
        'A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.'
      );
    }
  };
}

export function GuildSealChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(player: RpgPlayer) {
      if (player.getVariable<boolean>('mochiSocial.guildSealClaimed')) {
        showAlphaPrompt(player, 'The chest is empty. Your Mochirii Guild Seal is already tucked away.');
        return;
      }

      player.addItem(ALPHA_ITEMS.guildSeal, 1);
      player.setVariable('mochiSocial.guildSealClaimed', true);
      player.showNotification('Guild Seal added', { time: 1800, icon: 'chest' });
      emitAlphaHudState(player, { sealClaimed: true });
      await player.save('auto', { title: 'Mochirii first guild seal' }, { reason: 'auto', source: 'guild-seal-chest' });
      showAlphaPrompt(player, 'You found a Mochirii Guild Seal. The server saved this little milestone.');
    }
  };
}
