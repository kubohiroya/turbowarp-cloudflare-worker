import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {webcrypto} from 'node:crypto';

export interface JwtKeygenOptions {
  outDir: string;
  kid?: string;
}

export interface JwtIssueOptions {
  keyPath: string;
  subject: string;
  role: string;
  scopes: string[];
  issuer?: string;
  audience?: string;
  ttlSeconds?: number;
}

export interface JwtKeygenResult {
  kid: string;
  privateKeyPath: string;
  publicJwkPath: string;
  jwksPath: string;
}

type Es256PrivateJwk = JsonWebKey & {
  kid: string;
  alg: 'ES256';
  crv: 'P-256';
  d: string;
  kty: 'EC';
  x: string;
  y: string;
};

type JwtJwk = JsonWebKey & {
  kid: string;
  alg: 'ES256';
  use: 'sig';
  key_ops: string[];
};

const DEFAULT_AUDIENCE = 'turbowarp-http-server-cloudflare';
const DEFAULT_TTL_SECONDS = 60 * 60;

export async function generateEs256JwtKey(options: JwtKeygenOptions): Promise<JwtKeygenResult> {
  const kid = options.kid ?? randomId();
  const pair = await webcrypto.subtle.generateKey(
    {name: 'ECDSA', namedCurve: 'P-256'},
    true,
    ['sign', 'verify']
  );
  const privateJwk = await webcrypto.subtle.exportKey('jwk', pair.privateKey);
  const publicJwk = await webcrypto.subtle.exportKey('jwk', pair.publicKey);
  const normalizedPrivate = withKeyMetadata(privateJwk, kid, true);
  const normalizedPublic = withKeyMetadata(publicJwk, kid, false);

  await mkdir(options.outDir, {recursive: true});
  const privateKeyPath = join(options.outDir, 'private-key.jwk');
  const publicJwkPath = join(options.outDir, 'public-jwk.json');
  const jwksPath = join(options.outDir, 'jwks.json');

  await writeJson(privateKeyPath, normalizedPrivate);
  await writeJson(publicJwkPath, normalizedPublic);
  await writeJson(jwksPath, {keys: [normalizedPublic]});

  return {kid, privateKeyPath, publicJwkPath, jwksPath};
}

export async function issueEs256Jwt(options: JwtIssueOptions): Promise<string> {
  const privateJwk = JSON.parse(await readFile(options.keyPath, 'utf8')) as Es256PrivateJwk;
  const now = Math.floor(Date.now() / 1000);
  const audience = options.audience ?? DEFAULT_AUDIENCE;
  const issuer = options.issuer ?? `https://${audience}.workers.dev`;
  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const header = {
    alg: 'ES256',
    typ: 'JWT',
    kid: privateJwk.kid
  };
  const payload = {
    iss: issuer,
    aud: audience,
    sub: options.subject,
    role: options.role,
    scope: options.scopes.join(' '),
    iat: now,
    exp: now + ttlSeconds
  };
  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const key = await webcrypto.subtle.importKey(
    'jwk',
    privateJwk,
    {name: 'ECDSA', namedCurve: 'P-256'},
    false,
    ['sign']
  );
  const signature = await webcrypto.subtle.sign(
    {name: 'ECDSA', hash: 'SHA-256'},
    key,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export function parseTtl(value: string | undefined): number {
  if (!value) return DEFAULT_TTL_SECONDS;
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) {
    throw new TypeError('TTL must look like 900s, 15m, 1h, or 7d.');
  }
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return amount * multiplier;
}

function withKeyMetadata(key: JsonWebKey, kid: string, privateKey: boolean): JwtJwk {
  return {
    ...key,
    kid,
    alg: 'ES256',
    use: 'sig',
    key_ops: privateKey ? ['sign'] : ['verify']
  };
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, {encoding: 'utf8', mode: 0o600});
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  webcrypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function base64UrlEncode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return Buffer.from(bytes).toString('base64url');
}
