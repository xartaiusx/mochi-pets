import { PrebuiltGui } from '@rpgjs/common';
import type { EventDefinition, RpgPlayer } from '@rpgjs/server';

const TOKEN_ITEM = {
  id: 'mochi-token',
  name: 'Mochi Token',
  description: 'A tiny proof that you visited the first Mochi Social town.'
};

const ALPHA_ITEMS = {
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
};

const ALPHA_PROMPT_MS = 2600;

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

export const SPIRITS = [
  { id: 'momo', name: 'Momo', graphic: 'spirit-momo', eligible: true },
  { id: 'yuzu', name: 'Yuzu', graphic: 'spirit-yuzu', eligible: false },
  { id: 'sora', name: 'Sora', graphic: 'spirit-sora', eligible: false }
] as const;

export function WelcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('friend');
    },

    async onAction(player: RpgPlayer) {
      player.showNotification('Social spark found', { time: 1800, icon: 'friend' });
      showAlphaPrompt(
        player,
        'Welcome to Mochi Social. This closed alpha town is no-real-value and Canary-only, but it is ready for cozy pet testing with friends.'
      );
    }
  };
}

function adoptedPets(player: RpgPlayer): string[] {
  const pets = player.getVariable<string[]>('mochiSocial.alpha.pets');
  return Array.isArray(pets) ? pets : [];
}

function growthStage(bond: number) {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
}

export function SpiritEvent(spirit: (typeof SPIRITS)[number]): EventDefinition {
  return {
    onInit() {
      this.setGraphic(spirit.graphic);
    },

    async onAction(player: RpgPlayer) {
      const pets = adoptedPets(player);
      if (pets.includes(spirit.id)) {
        showAlphaPrompt(player, `${spirit.name} bounces close by. Your bond is already started.`);
        return;
      }

      pets.push(spirit.id);
      player.setVariable('mochiSocial.alpha.pets', pets);
      player.setVariable('mochiSocial.alpha.activePet', spirit.id);
      player.setVariable(`mochiSocial.alpha.pet.${spirit.id}.bond`, 1);
      player.setVariable(`mochiSocial.alpha.pet.${spirit.id}.growth`, 'seed');
      player.showNotification(`${spirit.name} befriended`, { time: 1800, icon: spirit.graphic });
      await player.save('auto', { title: 'Mochi Spirit befriended' }, { reason: 'auto', source: 'pet-befriend' });
      showAlphaPrompt(player, `${spirit.name} joined your alpha companion list. Care at the garden shrine to grow your bond.`);
    }
  };
}

export function CareShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('friend');
    },

    async onAction(player: RpgPlayer) {
      const activePet = player.getVariable<string>('mochiSocial.alpha.activePet') || adoptedPets(player)[0];
      if (!activePet) {
        showAlphaPrompt(player, 'The garden shrine warms gently. Befriend a Mochi Spirit first, then return to care for it.');
        return;
      }

      const bondKey = `mochiSocial.alpha.pet.${activePet}.bond`;
      const nextBond = Math.min(5, Number(player.getVariable<number>(bondKey) || 1) + 1);
      const nextGrowth = growthStage(nextBond);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.alpha.pet.${activePet}.growth`, nextGrowth);
      player.showNotification(`Bond ${nextBond}/5`, { time: 1800, icon: 'friend' });
      await player.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'pet-care' });
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
        await player.save('auto', { title: 'Alpha market proof' }, { reason: 'auto', source: 'market-board' });
        showAlphaPrompt(player, 'You listed a Lantern Charm for test soft currency. This proves fixed-price market flow without real value.');
        return;
      }

      showAlphaPrompt(player, 'Your Lantern Charm listing proof is already recorded for this alpha save.');
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
      if (!adoptedPets(player).includes('momo')) {
        showAlphaPrompt(player, 'The Canary shrine responds to Momo certificates first. Befriend Momo before staging this proof.');
        return;
      }

      if (!player.getVariable<boolean>('mochiSocial.alpha.canaryCertificateRequested')) {
        player.addItem(ALPHA_ITEMS.certificate, 1);
        player.setVariable('mochiSocial.alpha.canaryCertificateRequested', true);
      }
      player.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
      await player.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
      showAlphaPrompt(
        player,
        'A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.'
      );
    }
  };
}

export function TokenChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(player: RpgPlayer) {
      if (player.getVariable<boolean>('mochiSocial.tokenClaimed')) {
        showAlphaPrompt(player, 'The chest is empty. Your Mochi Token is already tucked away.');
        return;
      }

      player.addItem(TOKEN_ITEM, 1);
      player.setVariable('mochiSocial.tokenClaimed', true);
      player.showNotification('Mochi Token added', { time: 1800, icon: 'chest' });
      await player.save('auto', { title: 'Mochi Social first token' }, { reason: 'auto', source: 'token-chest' });
      showAlphaPrompt(player, 'You found a Mochi Token. The server saved this little milestone.');
    }
  };
}
