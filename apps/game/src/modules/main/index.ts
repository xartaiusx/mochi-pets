import { createModule } from '@rpgjs/common';
import server from './server';

export function provideMain() {
  return createModule('mochi-social-main', [
    {
      server
    }
  ]);
}
