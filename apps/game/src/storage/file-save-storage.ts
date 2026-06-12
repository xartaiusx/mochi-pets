import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RpgPlayer, SaveStorageStrategy } from '@rpgjs/server';
import type { SaveSlot, SaveSlotEntries, SaveSlotList, SaveSlotMeta } from '@rpgjs/common';

export interface FileSaveStorageOptions {
  directory: string;
}

export class FileSaveStorageStrategy implements SaveStorageStrategy {
  private readonly directory: string;
  private readonly fileLocks = new Map<string, Promise<void>>();

  constructor(options: FileSaveStorageOptions) {
    this.directory = options.directory;
  }

  async list(player: RpgPlayer): Promise<SaveSlotList> {
    return this.stripSnapshots(await this.readSlotsFromFile(this.getPlayerFile(player)));
  }

  async get(player: RpgPlayer, index: number): Promise<SaveSlot | null> {
    const slots = await this.readSlotsFromFile(this.getPlayerFile(player));
    return slots[index] ?? null;
  }

  async save(player: RpgPlayer, index: number, snapshot: string, meta: SaveSlotMeta): Promise<void> {
    const file = this.getPlayerFile(player);
    await this.withFileLock(file, async () => {
      const slots = await this.readSlotsFromFile(file);
      const existing = slots[index];
      slots[index] = {
        ...(existing ?? {}),
        ...meta,
        snapshot
      };
      await this.writeSlotsToFile(file, slots);
    });
  }

  async delete(player: RpgPlayer, index: number): Promise<void> {
    const file = this.getPlayerFile(player);
    await this.withFileLock(file, async () => {
      const slots = await this.readSlotsFromFile(file);
      slots[index] = null;
      await this.writeSlotsToFile(file, slots);
    });
  }

  private async readSlotsFromFile(file: string): Promise<SaveSlotEntries> {
    try {
      const raw = await readFile(file, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeSlotsToFile(file: string, slots: SaveSlotEntries) {
    await mkdir(this.directory, { recursive: true });
    const tempFile = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await writeFile(tempFile, JSON.stringify(slots, null, 2), 'utf8');
    await rename(tempFile, file);
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

  private async withFileLock<T>(file: string, action: () => Promise<T>): Promise<T> {
    const previous = this.fileLocks.get(file) ?? Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((resolveLock) => {
      release = resolveLock;
    });
    const chained = previous.catch(() => undefined).then(() => next);
    this.fileLocks.set(file, chained);

    await previous.catch(() => undefined);
    try {
      return await action();
    } finally {
      release();
      if (this.fileLocks.get(file) === chained) {
        this.fileLocks.delete(file);
      }
    }
  }
}
