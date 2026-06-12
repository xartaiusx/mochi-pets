import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, test } from 'vitest';
import { FileSaveStorageStrategy } from '../src/storage/file-save-storage';
import type { RpgPlayer } from '@rpgjs/server';

const tempDirs: string[] = [];

async function makeStorage() {
  const directory = await mkdtemp(join(tmpdir(), 'mochi-social-saves-'));
  tempDirs.push(directory);
  return {
    directory,
    storage: new FileSaveStorageStrategy({ directory })
  };
}

function fakePlayer(id: string) {
  return { id } as RpgPlayer;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('FileSaveStorageStrategy', () => {
  test('serializes overlapping writes to the same player file', async () => {
    const { directory, storage } = await makeStorage();
    const player = fakePlayer('manual review/player');

    await Promise.all([
      storage.save(player, 0, '{"snapshot":"auto"}', { title: 'Autosave', source: 'auto' }),
      storage.save(player, 0, '{"snapshot":"event"}', { title: 'Event save', source: 'event' }),
      storage.save(player, 1, '{"snapshot":"second"}', { title: 'Second slot', source: 'manual' })
    ]);

    const files = await readdir(directory);
    expect(files).toEqual(['manual_review_player.json']);

    const raw = await readFile(join(directory, files[0]), 'utf8');
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].snapshot).toMatch(/"snapshot":"(?:auto|event)"/);
    expect(parsed[0].title).toMatch(/Autosave|Event save/);
    expect(parsed[1]).toMatchObject({
      snapshot: '{"snapshot":"second"}',
      title: 'Second slot',
      source: 'manual'
    });
    expect(files.some((file) => file.endsWith('.tmp'))).toBe(false);
  });

  test('returns save metadata without exposing snapshots in slot lists', async () => {
    const { storage } = await makeStorage();
    const player = fakePlayer('tester');

    await storage.save(player, 0, '{"private":"snapshot"}', { title: 'Alpha manual prompt' });

    await expect(storage.get(player, 0)).resolves.toMatchObject({
      snapshot: '{"private":"snapshot"}',
      title: 'Alpha manual prompt'
    });
    await expect(storage.list(player)).resolves.toEqual([
      {
        title: 'Alpha manual prompt'
      }
    ]);
  });
});
