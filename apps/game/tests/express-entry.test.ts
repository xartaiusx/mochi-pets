import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const expressEntrySource = readFileSync('src/entries/express.ts', 'utf8');

describe('Express runtime entry', () => {
  it('keeps RPGJS party transport raw while limiting integration JSON bodies', () => {
    expect(expressEntrySource).toContain("const integrationJsonLimit = '256kb';");
    expect(expressEntrySource).toContain('const strictIntegrationJson = express.json({ limit: integrationJsonLimit });');
    expect(expressEntrySource).not.toContain('app.use(express.json');

    for (const route of ['/integration/alpha/action', '/integration/alpha/enjin/submit', '/integration/auth/verify']) {
      expect(expressEntrySource).toContain(`app.post('${route}', strictIntegrationJson,`);
    }
    expect(expressEntrySource).toContain("app.get('/integration/alpha/progress', async (req, res) => {");
    expect(expressEntrySource).toContain('forwardAlphaProgress(authResult.userId)');
    expect(expressEntrySource).toContain('buildAlphaProgressRequest(playerId)');
    expect(expressEntrySource).toContain("ALPHA_EDGE_FUNCTIONS.progress");

    expect(expressEntrySource).toContain("app.use('/parties', async (req, res, next) => {");
    expect(expressEntrySource).toContain('await transport.handleNodeRequest(req, res, next');
  });
});
