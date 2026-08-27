import {mkdtemp, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {generateEs256JwtKey, issueEs256Jwt, parseTtl} from '../src/jwt.js';

describe('JWT CLI helpers', () => {
  it('generates ES256 key files and issues a scoped token', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'tw-auth-'));
    const key = await generateEs256JwtKey({outDir, kid: 'test-key'});
    const jwks = JSON.parse(await readFile(key.jwksPath, 'utf8')) as {keys: Array<{kid: string}>};

    const token = await issueEs256Jwt({
      keyPath: key.privateKeyPath,
      subject: 'teacher',
      role: 'admin',
      scopes: ['posts:read', 'posts:write'],
      issuer: 'https://api.example.com',
      audience: 'classroom-api',
      ttlSeconds: 3600
    });
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    expect(encodedHeader).toBeDefined();
    expect(encodedPayload).toBeDefined();
    expect(encodedSignature).toBeDefined();
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error('JWT must contain header, payload, and signature.');
    }
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as {
      alg: string;
      kid: string;
    };
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      sub: string;
      role: string;
      scope: string;
      iss: string;
      aud: string;
    };

    expect(jwks.keys[0]?.kid).toBe('test-key');
    expect(header).toMatchObject({alg: 'ES256', kid: 'test-key'});
    expect(payload).toMatchObject({
      iss: 'https://api.example.com',
      aud: 'classroom-api',
      sub: 'teacher',
      role: 'admin',
      scope: 'posts:read posts:write'
    });
    expect(encodedSignature.length).toBeGreaterThan(0);
  });

  it('parses compact TTL strings', () => {
    expect(parseTtl(undefined)).toBe(3600);
    expect(parseTtl('15m')).toBe(900);
    expect(parseTtl('1h')).toBe(3600);
    expect(parseTtl('7d')).toBe(604800);
  });

  it('uses worker name defaults for issuer and audience', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'tw-auth-'));
    const key = await generateEs256JwtKey({outDir, kid: 'worker-key'});
    const token = await issueEs256Jwt({
      keyPath: key.privateKeyPath,
      subject: 'client',
      role: 'user',
      scopes: [],
      workerName: 'tw-api-app',
      ttlSeconds: 3600
    });
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) throw new Error('JWT must contain a payload.');
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      iss: string;
      aud: string;
    };

    expect(payload).toMatchObject({
      iss: 'https://tw-api-app.workers.dev',
      aud: 'tw-api-app'
    });
  });
});
