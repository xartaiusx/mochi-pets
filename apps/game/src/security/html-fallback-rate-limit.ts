import { isIP } from 'node:net';
import type { RequestHandler } from 'express';

export const HTML_FALLBACK_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 120,
  maxTrackedClients: 4_096
} as const;

interface ClientIpInput {
  flyClientIp?: string | string[];
  remoteAddress?: string | null;
  trustFlyClientIp: boolean;
}

interface HtmlFallbackRateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  maxTrackedClients?: number;
  trustFlyClientIp?: boolean;
  now?: () => number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const unresolvedClientKey = 'unresolved';
const overflowClientKey = 'tracked-client-overflow';

export function resolveValidatedClientIp(input: ClientIpInput) {
  const flyClientIp = input.trustFlyClientIp
    ? normalizeIp(firstHeaderValue(input.flyClientIp))
    : undefined;
  return flyClientIp ?? normalizeIp(input.remoteAddress) ?? unresolvedClientKey;
}

export function createHtmlFallbackRateLimit(options: HtmlFallbackRateLimitOptions = {}): RequestHandler {
  const windowMs = positiveInteger(options.windowMs ?? HTML_FALLBACK_RATE_LIMIT.windowMs, 'windowMs');
  const maxRequests = positiveInteger(options.maxRequests ?? HTML_FALLBACK_RATE_LIMIT.maxRequests, 'maxRequests');
  const maxTrackedClients = positiveInteger(
    options.maxTrackedClients ?? HTML_FALLBACK_RATE_LIMIT.maxTrackedClients,
    'maxTrackedClients'
  );
  const trustFlyClientIp = options.trustFlyClientIp ?? false;
  const now = options.now ?? Date.now;
  const buckets = new Map<string, RateLimitBucket>();
  let nextSweepAt = 0;

  return (req, res, next) => {
    const currentTime = now();
    if (currentTime >= nextSweepAt) {
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= currentTime) buckets.delete(key);
      }
      nextSweepAt = currentTime + windowMs;
    }

    const resolvedClientIp = resolveValidatedClientIp({
      flyClientIp: req.headers['fly-client-ip'],
      remoteAddress: req.socket.remoteAddress,
      trustFlyClientIp
    });
    const bucketKey = !buckets.has(resolvedClientIp) && buckets.size >= maxTrackedClients - 1
      ? overflowClientKey
      : resolvedClientIp;
    let bucket = buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= currentTime) {
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.set(bucketKey, bucket);
    }

    if (bucket.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1_000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('Cache-Control', 'no-store');
      res.status(429).type('text/plain').send('Too many requests. Please try again shortly.');
      return;
    }

    bucket.count += 1;
    next();
  };
}

function firstHeaderValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeIp(value?: string | null) {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  const version = isIP(candidate);
  if (version === 4) return candidate;
  if (version !== 6) return undefined;

  const canonical = new URL(`http://[${candidate}]/`).hostname.slice(1, -1).toLowerCase();
  const mappedIpv4 = canonical.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!mappedIpv4) return canonical;

  const high = Number.parseInt(mappedIpv4[1], 16);
  const low = Number.parseInt(mappedIpv4[2], 16);
  return `${high >>> 8}.${high & 0xff}.${low >>> 8}.${low & 0xff}`;
}

function positiveInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(`${label} must be a positive integer.`);
  return value;
}
