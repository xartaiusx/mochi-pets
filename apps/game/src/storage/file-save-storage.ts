import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RpgPlayer, SaveStorageStrategy } from '@rpgjs/server';
import type { SaveSlot, SaveSlotEntries, SaveSlotList, SaveSlotMeta } from '@rpgjs/common';

export interface FileSaveStorageOptions {
  directory: string;
}

export class FileSaveStorageStrategy implements SaveStorageStrategy {
  private readonly directory: string;

  constructor(options: FileSaveStorageOptions) {
    this.directory = options.directory;
  }

  async list(player: RpgPlayer): Promise<SaveSlotList> {
    return this.stripSnapshots(await this.readSlots(player));
  }

  async get(player: RpgPlayer, index: number): Promise<SaveSlot | null> {
    const slots = await this.readSlots(player);
    return slots[index] ?? null;
  }

  async save(player: RpgPlayer, index: number, snapshot: string, meta: SaveSlotMeta): Promise<void> {
    const slots = await this.readSlots(player);
    const existing = slots[index];
    slots[index] = {
      ...(existing ?? {}),
      ...meta,
      snapshot
    };
    await this.writeSlots(player, slots);
  }

  async delete(player: RpgPlayer, index: number): Promise<void> {
    const slots = await this.readSlots(player);
    slots[index] = null;
    await this.writeSlots(player, slots);
  }

  private async readSlots(player: RpgPlayer): Promise<SaveSlotEntries> {
    try {
      const raw = await readFile(this.getPlayerFile(player), 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeSlots(player: RpgPlayer, slots: SaveSlotEntries) {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.getPlayerFile(player), JSON.stringify(slots, null, 2), 'utf8');
  }

  private getPlayerFile(player: RpgPlayer) {
    const rawId = String(player.id ?? 'guest');
    const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return join(this.directory, `${safeId}.json`);
  }

  private stripSnapshots(slots: SaveSlotEntries): SaveSlotList {
    return slots.map((slot) => {
      if (!slot) return null;
      const { snapshot: _snapshot, ...meta } = slot;
      return meta;
    });
  }
}
