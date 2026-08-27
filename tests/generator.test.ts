import {describe, expect, it} from 'vitest';
import {generateCloudflareWorkerFiles} from '../src/generator.js';

describe('generateCloudflareWorkerFiles', () => {
  it('generates the minimal Cloudflare Worker files', () => {
    const files = generateCloudflareWorkerFiles({
      name: 'tw-http-app',
      handlers: [{method: 'GET', path: '/hello', responseText: 'Hello'}]
    });

    expect(files.map((file) => file.path).sort()).toEqual([
      'package.json',
      'src/index.ts',
      'tsconfig.json',
      'wrangler.jsonc'
    ]);
    expect(files.find((file) => file.path === 'wrangler.jsonc')?.contents).toContain(
      '"main": "src/index.ts"'
    );
    expect(files.find((file) => file.path === 'src/index.ts')?.contents).toContain(
      "app.get(\"/hello\", (c) => c.text(\"Hello\"));"
    );
  });

  it('includes storage bindings in wrangler config and Worker env types', () => {
    const files = generateCloudflareWorkerFiles({
      name: 'tw-storage-app',
      handlers: [],
      storage: [
        {kind: 'd1', binding: 'DB', name: 'tw_db'},
        {kind: 'kv', binding: 'CACHE', name: 'tw_cache'}
      ]
    });

    const wrangler = files.find((file) => file.path === 'wrangler.jsonc')?.contents ?? '';
    const source = files.find((file) => file.path === 'src/index.ts')?.contents ?? '';

    expect(wrangler).toContain('"d1_databases"');
    expect(wrangler).toContain('"kv_namespaces"');
    expect(source).toContain('DB: D1Database;');
    expect(source).toContain('CACHE: KVNamespace;');
  });

  it('generates OAuth/OIDC routes and protected route middleware', () => {
    const files = generateCloudflareWorkerFiles({
      name: 'tw-auth-app',
      handlers: [{method: 'GET', path: '/private', responseText: 'Private'}],
      auth: {
        mode: 'external-oauth-oidc',
        providers: ['google', 'github'],
        session: 'signed-cookie',
        protectedRoutes: [
          {method: 'GET', path: '/private', onUnauthenticated: 'redirect-login'}
        ]
      }
    });

    const source = files.find((file) => file.path === 'src/index.ts')?.contents ?? '';

    expect(source).toContain("MVP providers: google, github.");
    expect(source).toContain('GOOGLE_CLIENT_ID: string;');
    expect(source).toContain('GITHUB_CLIENT_SECRET: string;');
    expect(source).toContain('SESSION_SECRET: string;');
    expect(source).toContain('app.get("/auth/login"');
    expect(source).toContain('app.get("/auth/login/:provider"');
    expect(source).toContain('app.get("/auth/callback/:provider"');
    expect(source).toContain('app.get("/auth/logout"');
    expect(source).toContain('app.get("/auth/me"');
    expect(source).toContain('"path": "/private"');
    expect(source).toContain('return c.redirect("/auth/login");');
    expect(source).toContain('async function readSignedSession');
    expect(source).toContain("authorizationUrl.searchParams.set('code_challenge'");
    expect(source).toContain('async function verifyOidcIdToken');
    expect(source).toContain('async function verifyJwtSignature');
    expect(source).toContain('https://www.googleapis.com/oauth2/v3/certs');
    expect(source).toContain('https://api.github.com/user/emails');
    expect(source).toContain('async function loadGithubPrimaryEmail');
    expect(source).toContain('OAuth/OIDC token exchange failed');
  });

  it('generates ES256 bearer JWT guards for API routes', () => {
    const files = generateCloudflareWorkerFiles({
      name: 'tw-api-app',
      handlers: [{method: 'POST', path: '/api/posts', responseText: 'created'}],
      auth: {
        mode: 'external-oauth-oidc',
        providers: [],
        protectedRoutes: [
          {
            method: 'POST',
            path: '/api/posts',
            onUnauthenticated: 'json-401',
            auth: 'bearer-jwt',
            requiredRole: 'admin',
            requiredScopes: ['posts:write']
          }
        ]
      }
    });

    const source = files.find((file) => file.path === 'src/index.ts')?.contents ?? '';

    expect(source).toContain('BEARER_JWKS: string;');
    expect(source).toContain('async function verifyBearerRequest');
    expect(source).toContain('async function verifyEs256BearerJwt');
    expect(source).toContain('insufficient_role');
    expect(source).toContain('insufficient_scope');
    expect(source).toContain('"requiredScopes": [');
    expect(source).toContain('"posts:write"');
  });
});
