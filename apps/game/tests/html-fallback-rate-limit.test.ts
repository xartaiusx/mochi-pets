import { readFileSync } from 'node:fs';
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import {
  createHtmlFallbackRateLimit,
  HTML_FALLBACK_RATE_LIMIT,
  resolveValidatedClientIp
} from '../src/security/html-fallback-rate-limit';

describe('HTML fallback rate limiting', () => {
  it('uses only validated and trusted client addresses', () => {
    expect(resolveValidatedClientIp({
      flyClientIp: '203.0.113.12',
      remoteAddress: '10.0.0.4',
      trustFlyClientIp: true
    })).toBe('203.0.113.12');
    expect(resolveValidatedClientIp({
      flyClientIp: '203.0.113.12',
      remoteAddress: '10.0.0.4',
      trustFlyClientIp: false
    })).toBe('10.0.0.4');
    expect(resolveValidatedClientIp({
      flyClientIp: 'not-an-ip',
      remoteAddress: '::ffff:192.0.2.44',
      trustFlyClientIp: true
    })).toBe('192.0.2.44');
    expect(resolveValidatedClientIp({
      remoteAddress: 'not-an-ip',
      trustFlyClientIp: false
    })).toBe('unresolved');
    expect(resolveValidatedClientIp({
      remoteAddress: '2001:0db8:0:0:0:0:0:1',
      trustFlyClientIp: false
    })).toBe(resolveValidatedClientIp({
      remoteAddress: '2001:db8::1',
      trustFlyClientIp: false
    }));
  });

  it('allows 120 requests per minute and returns Retry-After on overflow', () => {
    let currentTime = 1_000;
    const limiter = createHtmlFallbackRateLimit({
      now: () => currentTime,
      maxRequests: 2,
      windowMs: 60_000,
      trustFlyClientIp: true
    });
    const request = fakeRequest('203.0.113.20', '10.0.0.5');

    expect(runLimiter(limiter, request).nextCalls).toBe(1);
    expect(runLimiter(limiter, request).nextCalls).toBe(1);
    const rejected = runLimiter(limiter, request);
    expect(rejected.nextCalls).toBe(0);
    expect(rejected.statusCode).toBe(429);
    expect(rejected.headers.get('retry-after')).toBe('60');
    expect(rejected.headers.get('cache-control')).toBe('no-store');

    currentTime += 60_000;
    expect(runLimiter(limiter, request).nextCalls).toBe(1);
    expect(HTML_FALLBACK_RATE_LIMIT.maxRequests).toBe(120);
    expect(HTML_FALLBACK_RATE_LIMIT.windowMs).toBe(60_000);
  });

  it('keeps clients independent and bounds overflow tracking', () => {
    const limiter = createHtmlFallbackRateLimit({
      maxRequests: 1,
      maxTrackedClients: 2,
      now: () => 10_000
    });

    expect(runLimiter(limiter, fakeRequest(undefined, '192.0.2.1')).nextCalls).toBe(1);
    expect(runLimiter(limiter, fakeRequest(undefined, '192.0.2.2')).nextCalls).toBe(1);
    expect(runLimiter(limiter, fakeRequest(undefined, '192.0.2.3')).statusCode).toBe(429);
    expect(runLimiter(limiter, fakeRequest(undefined, '192.0.2.1')).statusCode).toBe(429);
  });

  it('attaches only to legacy HTML fallbacks and avoids request-time file reads', () => {
    const source = readFileSync(new URL('../src/entries/express.ts', import.meta.url), 'utf8');
    const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
    expect(source).toContain("const clientIndexHtml = readFileSync(indexHtml, 'utf8')");
    expect(source).toContain("from '../security/html-fallback-rate-limit.js'");
    expect(source).toContain("app.get(['/', '/play', '/embed'], htmlFallbackRateLimit, sendClientIndexHtml)");
    expect(source).toContain('app.get(/.*/, htmlFallbackRateLimit, sendClientIndexHtml)');
    expect(source).not.toContain('res.sendFile(indexHtml)');
    expect(source).not.toMatch(/app\.get\('\/healthz',\s*htmlFallbackRateLimit/);
    expect(source).not.toMatch(/app\.use\('\/parties',\s*htmlFallbackRateLimit/);
    expect(source).not.toMatch(/app\.use\(express\.static\([^)]*htmlFallbackRateLimit/);
    expect(viteConfig).toContain("'security/html-fallback-rate-limit': './src/security/html-fallback-rate-limit.ts'");
  });
});

function fakeRequest(flyClientIp?: string, remoteAddress = '127.0.0.1') {
  return {
    headers: flyClientIp ? { 'fly-client-ip': flyClientIp } : {},
    socket: { remoteAddress }
  } as unknown as Request;
}

function runLimiter(limiter: ReturnType<typeof createHtmlFallbackRateLimit>, request: Request) {
  const state = {
    statusCode: 200,
    headers: new Map<string, string>(),
    body: undefined as unknown,
    nextCalls: 0
  };
  const response = {
    setHeader(name: string, value: string) {
      state.headers.set(name.toLowerCase(), String(value));
      return response;
    },
    status(statusCode: number) {
      state.statusCode = statusCode;
      return response;
    },
    type() {
      return response;
    },
    send(body: unknown) {
      state.body = body;
      return response;
    }
  } as unknown as Response;
  const next = (() => {
    state.nextCalls += 1;
  }) as NextFunction;

  limiter(request, response, next);
  return state;
}
