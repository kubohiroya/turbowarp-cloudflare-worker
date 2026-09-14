// Name: TurboWarp Cloudflare Worker
// ID: kubohiroyacloudflareworker
// Description: Cloudflare Workers generation blocks for turbowarp-http-server.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  //#region src/config.ts
  var extensionConfig = {
  	id: "kubohiroyacloudflareworker",
  	slug: "turbowarp-cloudflare-worker",
  	name: "TurboWarp Cloudflare Worker",
  	description: "Cloudflare Workers generation blocks for turbowarp-http-server.",
  	author: "Hiroya Kubo",
  	license: "MPL-2.0",
  	unsandboxed: false,
  	docsURI: "https://kubohiroya.github.io/turbowarp-cloudflare-worker/",
  	blockIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE0IiByeD0iMyIgZmlsbD0iIzRDOTdGRiIvPjxyZWN0IHg9IjI2IiB5PSI4IiB3aWR0aD0iMTgiIGhlaWdodD0iMTQiIHJ4PSIzIiBmaWxsPSIjNTlDMDU5Ii8+PHJlY3QgeD0iMTUiIHk9IjI2IiB3aWR0aD0iMTgiIGhlaWdodD0iMTQiIHJ4PSIzIiBmaWxsPSIjRkZBQjE5Ii8+PC9zdmc+"
  };
  var block_definitions_default = {
  	extensionName: "TurboWarp HTTP Server Cloudflare",
  	blocks: [
  		{
  			"opcode": "createHandlerIr",
  			"category": "core",
  			"blockType": "REPORTER",
  			"text": "Cloudflare handler [METHOD] [PATH] returns [BODY]",
  			"description": "Creates a minimal HTTP handler IR JSON entry for the Cloudflare generator.",
  			"arguments": {
  				"METHOD": {
  					"type": "STRING",
  					"defaultValue": "GET"
  				},
  				"PATH": {
  					"type": "STRING",
  					"defaultValue": "/hello"
  				},
  				"BODY": {
  					"type": "STRING",
  					"defaultValue": "Hello from TurboWarp"
  				}
  			}
  		},
  		{
  			"opcode": "createWorkerIr",
  			"category": "core",
  			"blockType": "REPORTER",
  			"text": "Cloudflare Worker [NAME] with handlers JSON [HANDLERS]",
  			"description": "Creates a deployable Worker IR JSON document from handler entries.",
  			"arguments": {
  				"NAME": {
  					"type": "STRING",
  					"defaultValue": "tw-http-app"
  				},
  				"HANDLERS": {
  					"type": "STRING",
  					"defaultValue": "[]"
  				}
  			}
  		},
  		{
  			"opcode": "generateFilesJson",
  			"category": "core",
  			"blockType": "REPORTER",
  			"text": "generated Cloudflare files JSON from IR [IR]",
  			"description": "Runs the Cloudflare Workers/Hono generator and returns GeneratedFile[] as JSON.",
  			"arguments": { "IR": {
  				"type": "STRING",
  				"defaultValue": "{\"name\":\"tw-http-app\",\"handlers\":[]}"
  			} }
  		},
  		{
  			"kind": "separator",
  			"category": "auth"
  		},
  		{
  			"opcode": "createProtectedRouteIr",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "protected route [METHOD] [PATH] when unauthenticated [ON_UNAUTHENTICATED]",
  			"description": "Creates an auth guard IR entry for a route protected by external OAuth/OIDC.",
  			"arguments": {
  				"METHOD": {
  					"type": "STRING",
  					"defaultValue": "GET"
  				},
  				"PATH": {
  					"type": "STRING",
  					"defaultValue": "/private"
  				},
  				"ON_UNAUTHENTICATED": {
  					"type": "STRING",
  					"defaultValue": "redirect-login"
  				}
  			}
  		},
  		{
  			"opcode": "createAuthIr",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "external OAuth/OIDC auth providers [PROVIDERS] protected routes JSON [PROTECTED_ROUTES]",
  			"description": "Creates auth IR for Google, Microsoft, and GitHub account sign-in.",
  			"arguments": {
  				"PROVIDERS": {
  					"type": "STRING",
  					"defaultValue": "google,github"
  				},
  				"PROTECTED_ROUTES": {
  					"type": "STRING",
  					"defaultValue": "[]"
  				}
  			}
  		},
  		{
  			"opcode": "createBearerRouteIr",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "API route [METHOD] [PATH] requires bearer token",
  			"description": "Creates a protected route IR entry that requires a valid self-issued ES256 bearer JWT.",
  			"arguments": {
  				"METHOD": {
  					"type": "STRING",
  					"defaultValue": "GET"
  				},
  				"PATH": {
  					"type": "STRING",
  					"defaultValue": "/api/items"
  				}
  			}
  		},
  		{
  			"opcode": "createBearerRoleRouteIr",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "API route [METHOD] [PATH] requires bearer role [ROLE]",
  			"description": "Creates a bearer JWT protected route IR entry that also requires a role claim.",
  			"arguments": {
  				"METHOD": {
  					"type": "STRING",
  					"defaultValue": "POST"
  				},
  				"PATH": {
  					"type": "STRING",
  					"defaultValue": "/api/admin"
  				},
  				"ROLE": {
  					"type": "STRING",
  					"defaultValue": "admin"
  				}
  			}
  		},
  		{
  			"opcode": "createBearerScopeRouteIr",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "API route [METHOD] [PATH] requires bearer scope [SCOPE]",
  			"description": "Creates a bearer JWT protected route IR entry that also requires one or more scopes.",
  			"arguments": {
  				"METHOD": {
  					"type": "STRING",
  					"defaultValue": "POST"
  				},
  				"PATH": {
  					"type": "STRING",
  					"defaultValue": "/api/posts"
  				},
  				"SCOPE": {
  					"type": "STRING",
  					"defaultValue": "posts:write"
  				}
  			}
  		},
  		{
  			"opcode": "createWorkerIrWithAuth",
  			"category": "auth",
  			"blockType": "REPORTER",
  			"text": "Cloudflare Worker [NAME] with handlers JSON [HANDLERS] and auth JSON [AUTH]",
  			"description": "Creates Worker IR with an external OAuth/OIDC auth policy.",
  			"arguments": {
  				"NAME": {
  					"type": "STRING",
  					"defaultValue": "tw-http-app"
  				},
  				"HANDLERS": {
  					"type": "STRING",
  					"defaultValue": "[]"
  				},
  				"AUTH": {
  					"type": "STRING",
  					"defaultValue": "{\"mode\":\"external-oauth-oidc\",\"providers\":[\"google\"],\"protectedRoutes\":[]}"
  				}
  			}
  		}
  	]
  };
  //#endregion
  //#region src/ir.ts
  function normalizeHttpMethod(value) {
  	const normalized = value.trim().toUpperCase();
  	if (isHttpMethod(normalized)) return normalized;
  	throw new TypeError(`Unsupported HTTP method: ${value}`);
  }
  function normalizeRoutePath(value) {
  	const trimmed = value.trim();
  	if (!trimmed.startsWith("/")) return `/${trimmed}`;
  	return trimmed || "/";
  }
  function parseWorkerIr(value) {
  	if (!isRecord(value)) throw new TypeError("Cloudflare Worker IR must be an object.");
  	const name = requireString(value.name, "IR name");
  	const handlers = Array.isArray(value.handlers) ? value.handlers.map((handler, index) => parseHandlerIr(handler, index)) : [];
  	const compatibilityDate = value.compatibilityDate === void 0 ? void 0 : requireString(value.compatibilityDate, "IR compatibilityDate");
  	const auth = value.auth === void 0 ? void 0 : parseAuthBindingIr(value.auth);
  	const storage = value.storage === void 0 ? void 0 : parseStorageBindings(value.storage);
  	return {
  		name,
  		handlers,
  		...compatibilityDate === void 0 ? {} : { compatibilityDate },
  		...auth === void 0 ? {} : { auth },
  		...storage === void 0 ? {} : { storage }
  	};
  }
  function parseHandlerIr(value, index) {
  	if (!isRecord(value)) throw new TypeError(`Handler at index ${index} must be an object.`);
  	return {
  		method: normalizeHttpMethod(requireString(value.method, `Handler ${index} method`)),
  		path: normalizeRoutePath(requireString(value.path, `Handler ${index} path`)),
  		responseText: requireString(value.responseText, `Handler ${index} responseText`)
  	};
  }
  function parseAuthBindingIr(value) {
  	if (!isRecord(value)) throw new TypeError("IR auth must be an object.");
  	const mode = requireString(value.mode, "IR auth mode");
  	if (mode !== "external-oauth-oidc") throw new TypeError(`Unsupported auth mode: ${mode}`);
  	return {
  		mode,
  		providers: Array.isArray(value.providers) ? value.providers.map((provider) => requireAuthProvider(provider)) : [],
  		...value.session === void 0 ? {} : { session: requireAuthSessionMode(value.session) },
  		...value.loginPath === void 0 ? {} : { loginPath: normalizeRoutePath(requireString(value.loginPath, "IR auth loginPath")) },
  		...value.callbackPath === void 0 ? {} : { callbackPath: normalizeRoutePath(requireString(value.callbackPath, "IR auth callbackPath")) },
  		...value.logoutPath === void 0 ? {} : { logoutPath: normalizeRoutePath(requireString(value.logoutPath, "IR auth logoutPath")) },
  		...value.mePath === void 0 ? {} : { mePath: normalizeRoutePath(requireString(value.mePath, "IR auth mePath")) },
  		...value.protectedRoutes === void 0 ? {} : { protectedRoutes: parseProtectedRoutes(value.protectedRoutes) },
  		...value.jwtIssuerEnv === void 0 ? {} : { jwtIssuerEnv: requireString(value.jwtIssuerEnv, "IR auth jwtIssuerEnv") },
  		...value.jwtAudienceEnv === void 0 ? {} : { jwtAudienceEnv: requireString(value.jwtAudienceEnv, "IR auth jwtAudienceEnv") }
  	};
  }
  function parseProtectedRoutes(value) {
  	if (!Array.isArray(value)) throw new TypeError("IR auth protectedRoutes must be an array.");
  	return value.map((route, index) => {
  		if (!isRecord(route)) throw new TypeError(`Protected route at index ${index} must be an object.`);
  		return {
  			method: route.method === "*" ? "*" : normalizeHttpMethod(requireString(route.method, `Protected route ${index} method`)),
  			path: normalizeRoutePath(requireString(route.path, `Protected route ${index} path`)),
  			onUnauthenticated: requireUnauthenticatedAction(route.onUnauthenticated, `Protected route ${index} onUnauthenticated`),
  			...route.auth === void 0 ? {} : { auth: requireProtectedRouteAuth(route.auth, `Protected route ${index} auth`) },
  			...route.requiredRole === void 0 ? {} : { requiredRole: requireString(route.requiredRole, `Protected route ${index} requiredRole`) },
  			...route.requiredScopes === void 0 ? {} : { requiredScopes: parseStringArray(route.requiredScopes, `Protected route ${index} requiredScopes`) }
  		};
  	});
  }
  function parseStorageBindings(value) {
  	if (!Array.isArray(value)) throw new TypeError("IR storage must be an array.");
  	return value.map((binding, index) => {
  		if (!isRecord(binding)) throw new TypeError(`Storage binding at index ${index} must be an object.`);
  		return {
  			kind: requireStorageKind(binding.kind),
  			binding: requireString(binding.binding, `Storage binding ${index} binding`),
  			name: requireString(binding.name, `Storage binding ${index} name`)
  		};
  	});
  }
  function isHttpMethod(value) {
  	return [
  		"GET",
  		"POST",
  		"PUT",
  		"PATCH",
  		"DELETE",
  		"OPTIONS",
  		"HEAD"
  	].includes(value);
  }
  function requireAuthProvider(value) {
  	if (value === "google" || value === "microsoft" || value === "github") return value;
  	throw new TypeError(`Unsupported auth provider: ${String(value)}`);
  }
  function requireAuthSessionMode(value) {
  	if (value === "signed-cookie" || value === "bearer-jwt" || value === "cloudflare-access") return value;
  	throw new TypeError(`Unsupported auth session mode: ${String(value)}`);
  }
  function requireUnauthenticatedAction(value, label) {
  	if (value === "redirect-login" || value === "json-401" || value === "forbid-403") return value;
  	throw new TypeError(`${label} must be redirect-login, json-401, or forbid-403.`);
  }
  function requireProtectedRouteAuth(value, label) {
  	if (value === "session" || value === "bearer-jwt") return value;
  	throw new TypeError(`${label} must be session or bearer-jwt.`);
  }
  function parseStringArray(value, label) {
  	if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  	return value.map((item, index) => requireString(item, `${label}[${index}]`));
  }
  function requireStorageKind(value) {
  	if (value === "d1" || value === "kv" || value === "r2" || value === "durable-object") return value;
  	throw new TypeError(`Unsupported storage kind: ${String(value)}`);
  }
  function requireString(value, label) {
  	if (typeof value !== "string" || value.length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  	return value;
  }
  function isRecord(value) {
  	return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  //#endregion
  //#region src/generator.ts
  var DEFAULT_COMPATIBILITY_DATE = "2026-08-27";
  function generateCloudflareWorkerFiles(input) {
  	const ir = parseWorkerIr(input);
  	return [
  		{
  			path: "package.json",
  			contents: `${JSON.stringify(createPackageJson(ir.name), null, 2)}\n`
  		},
  		{
  			path: "wrangler.jsonc",
  			contents: createWranglerJsonc(ir)
  		},
  		{
  			path: "tsconfig.json",
  			contents: createTsconfigJson()
  		},
  		{
  			path: "src/index.ts",
  			contents: createWorkerSource(ir)
  		}
  	];
  }
  function createTsconfigJson() {
  	return `${JSON.stringify({
  		compilerOptions: {
  			target: "ES2022",
  			module: "ESNext",
  			moduleResolution: "Bundler",
  			strict: true,
  			lib: ["ES2022"],
  			types: ["@cloudflare/workers-types"]
  		},
  		include: ["src/**/*.ts"]
  	}, null, 2)}\n`;
  }
  function createPackageJson(name) {
  	return {
  		name,
  		version: "0.1.0",
  		private: true,
  		type: "module",
  		scripts: {
  			dev: "wrangler dev",
  			deploy: "wrangler deploy",
  			typecheck: "tsc --noEmit"
  		},
  		dependencies: { hono: "^4.10.7" },
  		devDependencies: {
  			"@cloudflare/workers-types": "^5.20260826.1",
  			typescript: "^5.9.3",
  			wrangler: "^4.0.0"
  		}
  	};
  }
  function createWranglerJsonc(ir) {
  	const lines = [
  		"{",
  		`  "name": ${JSON.stringify(ir.name)},`,
  		"  \"main\": \"src/index.ts\",",
  		`  "compatibility_date": ${JSON.stringify(ir.compatibilityDate ?? DEFAULT_COMPATIBILITY_DATE)}`
  	];
  	const d1 = storageOfKind(ir.storage, "d1");
  	const kv = storageOfKind(ir.storage, "kv");
  	const r2 = storageOfKind(ir.storage, "r2");
  	const durableObjects = storageOfKind(ir.storage, "durable-object");
  	if (d1.length > 0) {
  		lines.push(",", "  \"d1_databases\": [");
  		lines.push(...d1.map((binding, index) => [
  			"    {",
  			`      "binding": ${JSON.stringify(binding.binding)},`,
  			`      "database_name": ${JSON.stringify(binding.name)},`,
  			`      "database_id": "REPLACE_WITH_${binding.binding}_DATABASE_ID"`,
  			`    }${index === d1.length - 1 ? "" : ","}`
  		].join("\n")));
  		lines.push("  ]");
  	}
  	if (kv.length > 0) {
  		lines.push(",", "  \"kv_namespaces\": [");
  		lines.push(...kv.map((binding, index) => [
  			"    {",
  			`      "binding": ${JSON.stringify(binding.binding)},`,
  			`      "id": "REPLACE_WITH_${binding.binding}_NAMESPACE_ID"`,
  			`    }${index === kv.length - 1 ? "" : ","}`
  		].join("\n")));
  		lines.push("  ]");
  	}
  	if (r2.length > 0) {
  		lines.push(",", "  \"r2_buckets\": [");
  		lines.push(...r2.map((binding, index) => [
  			"    {",
  			`      "binding": ${JSON.stringify(binding.binding)},`,
  			`      "bucket_name": ${JSON.stringify(binding.name)}`,
  			`    }${index === r2.length - 1 ? "" : ","}`
  		].join("\n")));
  		lines.push("  ]");
  	}
  	if (durableObjects.length > 0) {
  		lines.push(",", "  \"durable_objects\": {");
  		lines.push("    \"bindings\": [");
  		lines.push(...durableObjects.map((binding, index) => [
  			"      {",
  			`        "name": ${JSON.stringify(binding.binding)},`,
  			`        "class_name": ${JSON.stringify(binding.name)}`,
  			`      }${index === durableObjects.length - 1 ? "" : ","}`
  		].join("\n")));
  		lines.push("    ]", "  }");
  	}
  	lines.push("}", "");
  	return lines.join("\n");
  }
  function createWorkerSource(ir) {
  	const routeLines = ir.handlers.length === 0 ? ["app.get('/', (c) => c.text('Generated by turbowarp-cloudflare-worker.'));"] : ir.handlers.map((handler) => `app.${handler.method.toLowerCase()}(${JSON.stringify(handler.path)}, (c) => c.text(${JSON.stringify(handler.responseText)}));`);
  	return [
  		"import {Hono} from 'hono';",
  		"",
  		"type Env = {",
  		...createEnvLines(ir),
  		"};",
  		"",
  		"const app = new Hono<{Bindings: Env}>();",
  		"",
  		...createAuthLines(ir),
  		...routeLines,
  		"",
  		"export default app;",
  		""
  	].join("\n");
  }
  function createAuthLines(ir) {
  	if (!ir.auth) return ["// Add auth middleware here when the IR enables external OAuth/OIDC."];
  	const loginPath = ir.auth.loginPath ?? "/auth/login";
  	const callbackPath = ir.auth.callbackPath ?? "/auth/callback";
  	const logoutPath = ir.auth.logoutPath ?? "/auth/logout";
  	const mePath = ir.auth.mePath ?? "/auth/me";
  	const protectedRoutes = ir.auth.protectedRoutes ?? [];
  	const providerMap = createProviderMap(ir.auth.providers, callbackPath);
  	const loginProviderPath = `${loginPath}/:provider`;
  	const callbackProviderPath = `${callbackPath}/:provider`;
  	return [
  		"// Authentication is delegated to external OAuth/OIDC providers.",
  		`// MVP providers: ${ir.auth.providers.join(", ") || "none configured"}.`,
  		"// Secrets such as client IDs, client secrets, cookie keys, issuer, and audience must stay in Cloudflare secrets or environment variables.",
  		"// The generated flow covers authorization redirect, state verification, token exchange, and signed session cookies.",
  		"// Review provider scopes and profile mapping before production use.",
  		`const oauthProviders: Record<string, ProviderConfig> = ${JSON.stringify(providerMap, null, 2)};`,
  		`const authSession: {mode: AuthSessionMode} = {mode: ${JSON.stringify(ir.auth.session ?? "signed-cookie")}};`,
  		`const defaultBearerJwtIssuer = ${JSON.stringify(`https://${ir.name}.workers.dev`)};`,
  		`const defaultBearerJwtAudience = ${JSON.stringify(ir.name)};`,
  		`const protectedRoutes: readonly ProtectedRoute[] = ${JSON.stringify(protectedRoutes, null, 2)};`,
  		"",
  		`app.get(${JSON.stringify(loginPath)}, (c) => {`,
  		"  const firstProvider = Object.keys(oauthProviders)[0];",
  		"  if (!firstProvider) return c.text('No OAuth/OIDC provider configured.', 500);",
  		`  return c.redirect(${JSON.stringify(loginPath)} + '/' + firstProvider);`,
  		"});",
  		"",
  		`app.get(${JSON.stringify(loginProviderPath)}, async (c) => {`,
  		"  const providerName = c.req.param(\"provider\");",
  		"  const provider = oauthProviders[providerName as keyof typeof oauthProviders];",
  		"  if (!provider) return c.text('Unknown OAuth/OIDC provider.', 404);",
  		"  const state = randomToken();",
  		"  const nonce = randomToken();",
  		"  const codeVerifier = randomToken();",
  		"  const codeChallenge = await sha256Base64Url(codeVerifier);",
  		"  const redirectUri = new URL(c.req.url).origin + provider.callbackPath;",
  		"  const authorizationUrl = new URL(provider.authorizationEndpoint);",
  		"  authorizationUrl.searchParams.set('client_id', requiredEnv(c.env, provider.clientIdEnv));",
  		"  authorizationUrl.searchParams.set('redirect_uri', redirectUri);",
  		"  authorizationUrl.searchParams.set('response_type', 'code');",
  		"  authorizationUrl.searchParams.set('scope', provider.scopes.join(' '));",
  		"  authorizationUrl.searchParams.set('state', state);",
  		"  authorizationUrl.searchParams.set('code_challenge', codeChallenge);",
  		"  authorizationUrl.searchParams.set('code_challenge_method', 'S256');",
  		"  if (provider.usesOidc) authorizationUrl.searchParams.set(\"nonce\", nonce);",
  		"  for (const [name, value] of Object.entries(provider.authorizationParams ?? {})) {",
  		"    authorizationUrl.searchParams.set(name, value);",
  		"  }",
  		"  return redirectWithCookies(authorizationUrl.toString(), [",
  		"    serializeCookie('tw_oauth_state', `${providerName}.${state}`, {",
  		"        httpOnly: true,",
  		"        sameSite: 'Lax',",
  		"        secure: true,",
  		"        path: provider.callbackPath,",
  		"        maxAge: 600",
  		"      }),",
  		"    serializeCookie('tw_oauth_pkce', `${providerName}.${codeVerifier}.${nonce}`, {",
  		"        httpOnly: true,",
  		"        sameSite: 'Lax',",
  		"        secure: true,",
  		"        path: provider.callbackPath,",
  		"        maxAge: 600",
  		"      })",
  		"  ]);",
  		"});",
  		"",
  		`app.get(${JSON.stringify(callbackProviderPath)}, async (c) => {`,
  		"  const providerName = c.req.param(\"provider\");",
  		"  const provider = oauthProviders[providerName as keyof typeof oauthProviders];",
  		"  if (!provider) return c.text('Unknown OAuth/OIDC provider.', 404);",
  		"  const error = c.req.query('error');",
  		"  if (error) return c.text(`OAuth/OIDC error: ${error}`, 400);",
  		"  const code = c.req.query('code');",
  		"  const state = c.req.query('state');",
  		"  if (!code || !state) return c.text('Missing OAuth/OIDC callback parameters.', 400);",
  		"  const cookies = parseCookies(c.req.header('Cookie') ?? '');",
  		"  if (cookies.tw_oauth_state !== `${providerName}.${state}`) {",
  		"    return c.text('Invalid OAuth/OIDC state.', 400);",
  		"  }",
  		"  const pkceParts = cookies.tw_oauth_pkce?.split('.') ?? [];",
  		"  const codeVerifier = pkceParts[0] === providerName ? pkceParts[1] : undefined;",
  		"  const nonce = pkceParts[0] === providerName ? pkceParts[2] : undefined;",
  		"  if (!codeVerifier) return c.text('Missing OAuth/OIDC PKCE verifier.', 400);",
  		"  if (provider.usesOidc && !nonce) return c.text('Missing OAuth/OIDC nonce.', 400);",
  		"  const redirectUri = new URL(c.req.url).origin + provider.callbackPath;",
  		"  const tokenResponse = await exchangeAuthorizationCode(c.env, provider, code, redirectUri, codeVerifier);",
  		"  const identity = await loadProviderIdentity(c.env, provider, tokenResponse, nonce);",
  		"  const session = await signSession(c.env, {",
  		"    provider: providerName,",
  		"    subject: identity.subject,",
  		"    name: identity.name,",
  		"    email: identity.email,",
  		"    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24",
  		"  });",
  		"  return redirectWithCookies(\"/\", [",
  		"        serializeCookie('tw_oauth_state', '', {path: provider.callbackPath, maxAge: 0}),",
  		"        serializeCookie('tw_oauth_pkce', '', {path: provider.callbackPath, maxAge: 0}),",
  		"        serializeCookie('tw_session', session, {",
  		"          httpOnly: true,",
  		"          sameSite: 'Lax',",
  		"          secure: true,",
  		"          path: '/',",
  		"          maxAge: 60 * 60 * 24",
  		"        })",
  		"  ]);",
  		"});",
  		"",
  		`app.get(${JSON.stringify(logoutPath)}, (c) => {`,
  		"  return redirectWithCookies(\"/\", [",
  		"    serializeCookie('tw_session', '', {path: '/', maxAge: 0})",
  		"  ]);",
  		"});",
  		"",
  		`app.get(${JSON.stringify(mePath)}, async (c) => {`,
  		"  if (authSession.mode === \"cloudflare-access\") {",
  		"    const subject = c.req.header(\"Cf-Access-Authenticated-User-Email\");",
  		"    return c.json({",
  		"      authenticated: Boolean(subject),",
  		"      user: subject ? {provider: \"cloudflare-access\", subject, email: subject} : null",
  		"    }, subject ? 200 : 401);",
  		"  }",
  		"  const sessionCookie = parseCookies(c.req.header('Cookie') ?? '').tw_session;",
  		"  const session = sessionCookie ? await readSignedSession(c.env, sessionCookie) : null;",
  		"  return c.json({authenticated: Boolean(session), user: session}, session ? 200 : 401);",
  		"});",
  		"",
  		"for (const route of protectedRoutes) {",
  		"  app.use(route.path, async (c, next) => {",
  		"    if (route.method !== '*' && route.method !== c.req.method.toUpperCase()) {",
  		"      await next();",
  		"      return;",
  		"    }",
  		"    if (route.auth === \"bearer-jwt\") {",
  		"      const result = await verifyBearerRequest(c.req.raw, c.env, route);",
  		"      if (!result.ok) {",
  		"        return c.json({error: result.error}, result.status);",
  		"      }",
  		"      await next();",
  		"      return;",
  		"    }",
  		"    if (await hasAuthenticatedIdentity(c.req.raw, c.env)) {",
  		"      await next();",
  		"      return;",
  		"    }",
  		"    if (route.onUnauthenticated === \"json-401\") {",
  		"      return c.json({error: 'authentication_required'}, 401);",
  		"    }",
  		"    if (route.onUnauthenticated === \"forbid-403\") {",
  		"      return c.text('Forbidden', 403);",
  		"    }",
  		`    return c.redirect(${JSON.stringify(loginPath)});`,
  		"  });",
  		"}",
  		"",
  		"async function hasAuthenticatedIdentity(request: Request, env: Env): Promise<boolean> {",
  		"  if (authSession.mode === \"cloudflare-access\") {",
  		"    return request.headers.has('Cf-Access-Jwt-Assertion');",
  		"  }",
  		"  if (authSession.mode === \"bearer-jwt\") {",
  		"    // TODO: Validate provider-issued bearer JWTs against issuer, audience, and JWKS.",
  		"    return false;",
  		"  }",
  		"  const sessionCookie = parseCookies(request.headers.get('Cookie') ?? '').tw_session;",
  		"  return sessionCookie ? (await readSignedSession(env, sessionCookie)) !== null : false;",
  		"}",
  		"",
  		"type ProviderConfig = {",
  		"  authorizationEndpoint: string;",
  		"  tokenEndpoint: string;",
  		"  userInfoEndpoint?: string;",
  		"  emailsEndpoint?: string;",
  		"  jwksEndpoint?: string;",
  		"  issuer?: string;",
  		"  issuerPrefix?: string;",
  		"  usesOidc: boolean;",
  		"  authorizationParams?: Record<string, string>;",
  		"  scopes: readonly string[];",
  		"  clientIdEnv: string;",
  		"  clientSecretEnv: string;",
  		"  callbackPath: string;",
  		"};",
  		"",
  		"type AuthSessionMode = \"signed-cookie\" | \"bearer-jwt\" | \"cloudflare-access\";",
  		"",
  		"type ProtectedRoute = {",
  		"  method: string;",
  		"  path: string;",
  		"  onUnauthenticated: \"redirect-login\" | \"json-401\" | \"forbid-403\";",
  		"  auth?: \"session\" | \"bearer-jwt\";",
  		"  requiredRole?: string;",
  		"  requiredScopes?: readonly string[];",
  		"};",
  		"",
  		"type TokenResponse = {",
  		"  access_token?: string;",
  		"  id_token?: string;",
  		"  token_type?: string;",
  		"  expires_in?: number;",
  		"};",
  		"",
  		"type JwksKey = JsonWebKey & {kid?: string; kty?: string};",
  		"",
  		"type SessionIdentity = {",
  		"  provider: string;",
  		"  subject: string;",
  		"  name?: string;",
  		"  email?: string;",
  		"  expiresAt: number;",
  		"};",
  		"",
  		"type BearerClaims = {",
  		"  iss?: string;",
  		"  aud?: string | string[];",
  		"  sub?: string;",
  		"  role?: string;",
  		"  scope?: string;",
  		"  iat?: number;",
  		"  exp?: number;",
  		"};",
  		"",
  		"type BearerVerificationResult =",
  		"  | {ok: true; claims: BearerClaims}",
  		"  | {ok: false; status: 401 | 403; error: string};",
  		"",
  		"async function verifyBearerRequest(",
  		"  request: Request,",
  		"  env: Env,",
  		"  route: ProtectedRoute",
  		"): Promise<BearerVerificationResult> {",
  		"  const authorization = request.headers.get('Authorization') ?? '';",
  		"  const match = /^Bearer\\s+(.+)$/i.exec(authorization);",
  		"  if (!match) return {ok: false, status: 401, error: \"authentication_required\"};",
  		"  const tokenResult = await verifyEs256BearerJwt(env, match[1]);",
  		"  if (!tokenResult.ok) return tokenResult;",
  		"  if (route.requiredRole && tokenResult.claims.role !== route.requiredRole) {",
  		"    return {ok: false, status: 403, error: \"insufficient_role\"};",
  		"  }",
  		"  const scopes = new Set((tokenResult.claims.scope ?? '').split(/\\s+/).filter(Boolean));",
  		"  for (const scope of route.requiredScopes ?? []) {",
  		"    if (!scopes.has(scope)) return {ok: false, status: 403, error: \"insufficient_scope\"};",
  		"  }",
  		"  return tokenResult;",
  		"}",
  		"",
  		"async function verifyEs256BearerJwt(env: Env, token: string): Promise<BearerVerificationResult> {",
  		"  const [encodedHeader, encodedPayload, encodedSignature] = token.split(\".\");",
  		"  if (!encodedHeader || !encodedPayload || !encodedSignature) {",
  		"    return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  }",
  		"  let header: Record<string, unknown>;",
  		"  let claims: BearerClaims;",
  		"  try {",
  		"    header = JSON.parse(base64UrlDecode(encodedHeader)) as Record<string, unknown>;",
  		"    claims = JSON.parse(base64UrlDecode(encodedPayload)) as BearerClaims;",
  		"  } catch {",
  		"    return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  }",
  		"  if (header.alg !== \"ES256\") return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  const expectedIssuer = env.BEARER_JWT_ISSUER ?? defaultBearerJwtIssuer;",
  		"  const expectedAudience = env.BEARER_JWT_AUDIENCE ?? defaultBearerJwtAudience;",
  		"  if (claims.iss !== expectedIssuer) {",
  		"    return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  }",
  		"  const audience = claims.aud;",
  		"  const audienceMatches = Array.isArray(audience)",
  		"    ? audience.includes(expectedAudience)",
  		"    : audience === expectedAudience;",
  		"  if (!audienceMatches) return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {",
  		"    return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  }",
  		"  const jwks = JSON.parse(env.BEARER_JWKS) as {keys?: JwksKey[]};",
  		"  const key = jwks.keys?.find((item) => item.kid === header.kid && item.kty === \"EC\");",
  		"  if (!key) return {ok: false, status: 401, error: \"invalid_token\"};",
  		"  const cryptoKey = await crypto.subtle.importKey(",
  		"    \"jwk\",",
  		"    key,",
  		"    {name: \"ECDSA\", namedCurve: \"P-256\"},",
  		"    false,",
  		"    [\"verify\"]",
  		"  );",
  		"  const verified = await crypto.subtle.verify(",
  		"    {name: \"ECDSA\", hash: \"SHA-256\"},",
  		"    cryptoKey,",
  		"    base64UrlToBytes(encodedSignature),",
  		"    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)",
  		"  );",
  		"  return verified",
  		"    ? {ok: true, claims}",
  		"    : {ok: false, status: 401, error: \"invalid_token\"};",
  		"}",
  		"",
  		"async function exchangeAuthorizationCode(",
  		"  env: Env,",
  		"  provider: ProviderConfig,",
  		"  code: string,",
  		"  redirectUri: string,",
  		"  codeVerifier: string",
  		"): Promise<TokenResponse> {",
  		"  const body = new URLSearchParams({",
  		"    grant_type: \"authorization_code\",",
  		"    code,",
  		"    redirect_uri: redirectUri,",
  		"    client_id: requiredEnv(env, provider.clientIdEnv),",
  		"    client_secret: requiredEnv(env, provider.clientSecretEnv),",
  		"    code_verifier: codeVerifier",
  		"  });",
  		"  const response = await fetch(provider.tokenEndpoint, {",
  		"    method: 'POST',",
  		"    headers: {Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'},",
  		"    body",
  		"  });",
  		"  if (!response.ok) {",
  		"    throw new Error(`OAuth/OIDC token exchange failed: ${response.status}`);",
  		"  }",
  		"  return (await response.json()) as TokenResponse;",
  		"}",
  		"",
  		"async function loadProviderIdentity(",
  		"  env: Env,",
  		"  provider: ProviderConfig,",
  		"  tokenResponse: TokenResponse,",
  		"  expectedNonce: string | undefined",
  		"): Promise<Omit<SessionIdentity, \"provider\" | \"expiresAt\">> {",
  		"  if (tokenResponse.id_token) {",
  		"    const claims = await verifyOidcIdToken(env, provider, tokenResponse.id_token, expectedNonce);",
  		"    return {",
  		"      subject: providerSubject(provider, claims),",
  		"      name: stringClaim(claims.name),",
  		"      email: stringClaim(claims.email)",
  		"    };",
  		"  }",
  		"  if (provider.userInfoEndpoint && tokenResponse.access_token) {",
  		"    const response = await fetch(provider.userInfoEndpoint, {",
  		"      headers: {Authorization: `Bearer ${tokenResponse.access_token}`, Accept: 'application/json'}",
  		"    });",
  		"    if (response.ok) {",
  		"      const profile = (await response.json()) as Record<string, unknown>;",
  		"      return {",
  		"        subject: providerSubject(provider, profile),",
  		"        name: stringClaim(profile.name) ?? stringClaim(profile.login),",
  		"        email: stringClaim(profile.email) ?? (await loadGithubPrimaryEmail(provider, tokenResponse.access_token))",
  		"      };",
  		"    }",
  		"  }",
  		"  return {subject: \"unknown\"};",
  		"}",
  		"",
  		"async function verifyOidcIdToken(",
  		"  env: Env,",
  		"  provider: ProviderConfig,",
  		"  token: string,",
  		"  expectedNonce: string | undefined",
  		"): Promise<Record<string, unknown>> {",
  		"  if (!provider.usesOidc || !provider.jwksEndpoint) throw new Error(\"Provider does not support OIDC ID token verification.\");",
  		"  const [encodedHeader, encodedPayload, encodedSignature] = token.split(\".\");",
  		"  if (!encodedHeader || !encodedPayload || !encodedSignature) throw new Error(\"Invalid OIDC ID token format.\");",
  		"  const header = JSON.parse(base64UrlDecode(encodedHeader)) as Record<string, unknown>;",
  		"  const claims = JSON.parse(base64UrlDecode(encodedPayload)) as Record<string, unknown>;",
  		"  if (header.alg !== \"RS256\") throw new Error(\"Unsupported OIDC ID token alg.\");",
  		"  const issuer = stringClaim(claims.iss);",
  		"  if (provider.issuer && issuer !== provider.issuer) throw new Error(\"Invalid OIDC issuer.\");",
  		"  if (provider.issuerPrefix && !issuer?.startsWith(provider.issuerPrefix)) throw new Error(\"Invalid OIDC issuer.\");",
  		"  const audience = claims.aud;",
  		"  const expectedAudience = requiredEnv(env, provider.clientIdEnv);",
  		"  const audienceMatches = Array.isArray(audience)",
  		"    ? audience.includes(expectedAudience)",
  		"    : audience === expectedAudience;",
  		"  if (!audienceMatches) throw new Error(\"Invalid OIDC audience.\");",
  		"  const expiresAt = typeof claims.exp === \"number\" ? claims.exp : 0;",
  		"  if (expiresAt <= Math.floor(Date.now() / 1000)) throw new Error(\"Expired OIDC ID token.\");",
  		"  if (!expectedNonce || claims.nonce !== expectedNonce) throw new Error(\"Invalid OIDC nonce.\");",
  		"  await verifyJwtSignature(provider.jwksEndpoint, encodedHeader, encodedPayload, encodedSignature, stringClaim(header.kid));",
  		"  return claims;",
  		"}",
  		"",
  		"async function verifyJwtSignature(",
  		"  jwksEndpoint: string,",
  		"  encodedHeader: string,",
  		"  encodedPayload: string,",
  		"  encodedSignature: string,",
  		"  keyId: string | undefined",
  		"): Promise<void> {",
  		"  const response = await fetch(jwksEndpoint, {headers: {Accept: \"application/json\"}});",
  		"  if (!response.ok) throw new Error(`JWKS fetch failed: ${response.status}`);",
  		"  const jwks = (await response.json()) as {keys?: JwksKey[]};",
  		"  const key = jwks.keys?.find((item) => item.kid === keyId && item.kty === \"RSA\");",
  		"  if (!key) throw new Error(\"OIDC signing key not found.\");",
  		"  const cryptoKey = await crypto.subtle.importKey(",
  		"    \"jwk\",",
  		"    key,",
  		"    {name: \"RSASSA-PKCS1-v1_5\", hash: \"SHA-256\"},",
  		"    false,",
  		"    [\"verify\"]",
  		"  );",
  		"  const verified = await crypto.subtle.verify(",
  		"    \"RSASSA-PKCS1-v1_5\",",
  		"    cryptoKey,",
  		"    base64UrlToBytes(encodedSignature),",
  		"    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)",
  		"  );",
  		"  if (!verified) throw new Error(\"Invalid OIDC ID token signature.\");",
  		"}",
  		"",
  		"async function loadGithubPrimaryEmail(",
  		"  provider: ProviderConfig,",
  		"  accessToken: string | undefined",
  		"): Promise<string | undefined> {",
  		"  if (!provider.emailsEndpoint || !accessToken) return undefined;",
  		"  const response = await fetch(provider.emailsEndpoint, {",
  		"    headers: {Authorization: `Bearer ${accessToken}`, Accept: \"application/vnd.github+json\"}",
  		"  });",
  		"  if (!response.ok) return undefined;",
  		"  const emails = (await response.json()) as Array<Record<string, unknown>>;",
  		"  const primary = emails.find((email) => email.primary === true && email.verified === true);",
  		"  return stringClaim(primary?.email);",
  		"}",
  		"",
  		"async function signSession(env: Env, identity: SessionIdentity): Promise<string> {",
  		"  const payload = base64UrlEncode(JSON.stringify(identity));",
  		"  const signature = await hmacSha256(payload, requiredEnv(env, 'SESSION_SECRET'));",
  		"  return `${payload}.${signature}`;",
  		"}",
  		"",
  		"async function readSignedSession(env: Env, cookie: string): Promise<SessionIdentity | null> {",
  		"  const [payload, signature] = cookie.split('.');",
  		"  if (!payload || !signature) return null;",
  		"  const expected = await hmacSha256(payload, requiredEnv(env, 'SESSION_SECRET'));",
  		"  if (signature !== expected) return null;",
  		"  try {",
  		"    const session = JSON.parse(base64UrlDecode(payload)) as SessionIdentity;",
  		"    return typeof session.expiresAt === 'number' && session.expiresAt > Math.floor(Date.now() / 1000)",
  		"      ? session",
  		"      : null;",
  		"  } catch {",
  		"    return null;",
  		"  }",
  		"}",
  		"",
  		"function decodeJwtPayload(token: string): Record<string, unknown> {",
  		"  const payload = token.split('.')[1];",
  		"  if (!payload) return {};",
  		"  try {",
  		"    return JSON.parse(base64UrlDecode(payload)) as Record<string, unknown>;",
  		"  } catch {",
  		"    return {};",
  		"  }",
  		"}",
  		"",
  		"async function hmacSha256(value: string, secret: string): Promise<string> {",
  		"  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);",
  		"  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));",
  		"  return base64UrlEncode(new Uint8Array(signature));",
  		"}",
  		"",
  		"async function sha256Base64Url(value: string): Promise<string> {",
  		"  const digest = await crypto.subtle.digest(\"SHA-256\", new TextEncoder().encode(value));",
  		"  return base64UrlEncode(new Uint8Array(digest));",
  		"}",
  		"",
  		"function randomToken(): string {",
  		"  const bytes = new Uint8Array(32);",
  		"  crypto.getRandomValues(bytes);",
  		"  return base64UrlEncode(bytes);",
  		"}",
  		"",
  		"function parseCookies(header: string): Record<string, string> {",
  		"  return Object.fromEntries(",
  		"    header.split(';').flatMap((part) => {",
  		"      const index = part.indexOf('=');",
  		"      if (index === -1) return [];",
  		"      return [[part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))]];",
  		"    })",
  		"  );",
  		"}",
  		"",
  		"function serializeCookie(",
  		"  name: string,",
  		"  value: string,",
  		"  options: {httpOnly?: boolean; sameSite?: \"Lax\" | \"Strict\" | \"None\"; secure?: boolean; path?: string; maxAge?: number}",
  		"): string {",
  		"  const parts = [`${name}=${encodeURIComponent(value)}`];",
  		"  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);",
  		"  if (options.path) parts.push(`Path=${options.path}`);",
  		"  if (options.httpOnly) parts.push(\"HttpOnly\");",
  		"  if (options.secure) parts.push(\"Secure\");",
  		"  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);",
  		"  return parts.join('; ');",
  		"}",
  		"",
  		"function redirectWithCookies(location: string, cookies: readonly string[]): Response {",
  		"  const headers = new Headers({Location: location});",
  		"  for (const cookie of cookies) headers.append('Set-Cookie', cookie);",
  		"  return new Response(null, {status: 302, headers});",
  		"}",
  		"",
  		"function requiredEnv(env: Env, name: string): string {",
  		"  const value = (env as unknown as Record<string, string | undefined>)[name];",
  		"  if (!value) throw new Error(`Missing required environment variable: ${name}`);",
  		"  return value;",
  		"}",
  		"",
  		"function stringClaim(value: unknown): string | undefined {",
  		"  return typeof value === 'string' && value.length > 0 ? value : undefined;",
  		"}",
  		"",
  		"function subjectClaim(value: unknown): string | undefined {",
  		"  if (typeof value === 'string' && value.length > 0) return value;",
  		"  if (typeof value === \"number\" && Number.isFinite(value)) return String(value);",
  		"  return undefined;",
  		"}",
  		"",
  		"function providerSubject(provider: ProviderConfig, claims: Record<string, unknown>): string {",
  		"  const providerName = providerNameFromConfig(provider);",
  		"  const subject =",
  		"    subjectClaim(claims.sub) ??",
  		"    subjectClaim(claims.id) ??",
  		"    stringClaim(claims.login) ??",
  		"    \"unknown\";",
  		"  return `${providerName}:${subject}`;",
  		"}",
  		"",
  		"function providerNameFromConfig(provider: ProviderConfig): string {",
  		"  const entry = Object.entries(oauthProviders).find(([, config]) => config === provider);",
  		"  return entry?.[0] ?? \"oauth\";",
  		"}",
  		"",
  		"function base64UrlEncode(value: string | Uint8Array): string {",
  		"  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;",
  		"  let binary = '';",
  		"  for (const byte of bytes) binary += String.fromCharCode(byte);",
  		"  return btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');",
  		"}",
  		"",
  		"function base64UrlDecode(value: string): string {",
  		"  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');",
  		"  const binary = atob(padded);",
  		"  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));",
  		"  return new TextDecoder().decode(bytes);",
  		"}",
  		"",
  		"function base64UrlToBytes(value: string): Uint8Array {",
  		"  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');",
  		"  const binary = atob(padded);",
  		"  return Uint8Array.from(binary, (char) => char.charCodeAt(0));",
  		"}",
  		""
  	];
  }
  function createProviderMap(providers, callbackBasePath) {
  	const providerSet = new Set(providers ?? []);
  	const result = {};
  	if (providerSet.has("google")) result.google = {
  		authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  		tokenEndpoint: "https://oauth2.googleapis.com/token",
  		userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
  		jwksEndpoint: "https://www.googleapis.com/oauth2/v3/certs",
  		issuer: "https://accounts.google.com",
  		usesOidc: true,
  		authorizationParams: { prompt: "select_account" },
  		scopes: [
  			"openid",
  			"email",
  			"profile"
  		],
  		clientIdEnv: "GOOGLE_CLIENT_ID",
  		clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  		callbackPath: `${callbackBasePath}/google`
  	};
  	if (providerSet.has("microsoft")) result.microsoft = {
  		authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  		tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  		userInfoEndpoint: "https://graph.microsoft.com/oidc/userinfo",
  		jwksEndpoint: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
  		issuerPrefix: "https://login.microsoftonline.com/",
  		usesOidc: true,
  		authorizationParams: { prompt: "select_account" },
  		scopes: [
  			"openid",
  			"email",
  			"profile"
  		],
  		clientIdEnv: "MICROSOFT_CLIENT_ID",
  		clientSecretEnv: "MICROSOFT_CLIENT_SECRET",
  		callbackPath: `${callbackBasePath}/microsoft`
  	};
  	if (providerSet.has("github")) result.github = {
  		authorizationEndpoint: "https://github.com/login/oauth/authorize",
  		tokenEndpoint: "https://github.com/login/oauth/access_token",
  		userInfoEndpoint: "https://api.github.com/user",
  		emailsEndpoint: "https://api.github.com/user/emails",
  		usesOidc: false,
  		scopes: ["read:user", "user:email"],
  		clientIdEnv: "GITHUB_CLIENT_ID",
  		clientSecretEnv: "GITHUB_CLIENT_SECRET",
  		callbackPath: `${callbackBasePath}/github`
  	};
  	return result;
  }
  function createEnvLines(ir) {
  	const lines = [];
  	if (!ir.storage || ir.storage.length === 0) lines.push("  // Bindings are added when D1, KV, R2, or Durable Objects appear in the IR.");
  	else lines.push(...ir.storage.map((binding) => `  ${binding.binding}: ${bindingType(binding)};`));
  	if (ir.auth && ir.auth.session !== "cloudflare-access") {
  		for (const provider of ir.auth.providers) {
  			lines.push(`  ${providerEnvPrefix(provider)}_CLIENT_ID: string;`);
  			lines.push(`  ${providerEnvPrefix(provider)}_CLIENT_SECRET: string;`);
  		}
  		lines.push("  SESSION_SECRET: string;");
  	}
  	if (ir.auth?.protectedRoutes?.some((route) => route.auth === "bearer-jwt")) {
  		lines.push("  BEARER_JWKS: string;");
  		lines.push("  BEARER_JWT_ISSUER?: string;");
  		lines.push("  BEARER_JWT_AUDIENCE?: string;");
  	}
  	return lines;
  }
  function providerEnvPrefix(provider) {
  	return provider.toUpperCase();
  }
  function bindingType(binding) {
  	switch (binding.kind) {
  		case "d1": return "D1Database";
  		case "kv": return "KVNamespace";
  		case "r2": return "R2Bucket";
  		case "durable-object": return "DurableObjectNamespace";
  	}
  }
  function storageOfKind(storage, kind) {
  	return storage?.filter((binding) => binding.kind === kind) ?? [];
  }
  //#endregion
  //#region src/extension.ts
  var paletteDefinitions = block_definitions_default.blocks;
  var authBlockIconUri = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNiIgeT0iMTgiIHdpZHRoPSIzNiIgaGVpZ2h0PSIyNCIgcng9IjQiIGZpbGw9IiNGNzk1MjEiLz48cGF0aCBkPSJNMTUgMTh2LTZjMC01IDQtOSA5LTlzOSA0IDkgOXY2IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRjI5MzciIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiMxRjI5MzciLz48L3N2Zz4=";
  var CloudflareExtension = class {
  	getInfo() {
  		return {
  			id: extensionConfig.id,
  			name: Scratch.translate(block_definitions_default.extensionName),
  			docsURI: extensionConfig.docsURI,
  			blockIconURI: extensionConfig.blockIconURI,
  			blocks: paletteDefinitions.map((block) => this.toScratchPaletteEntry(block))
  		};
  	}
  	createHandlerIr(args) {
  		const handler = {
  			method: normalizeHttpMethod(Scratch.Cast.toString(args.METHOD)),
  			path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
  			responseText: Scratch.Cast.toString(args.BODY)
  		};
  		return JSON.stringify(handler);
  	}
  	createWorkerIr(args) {
  		const parsedHandlers = JSON.parse(Scratch.Cast.toString(args.HANDLERS));
  		const handlers = Array.isArray(parsedHandlers) ? parsedHandlers : [parsedHandlers];
  		const ir = parseWorkerIr({
  			name: Scratch.Cast.toString(args.NAME),
  			handlers
  		});
  		return JSON.stringify(ir);
  	}
  	createProtectedRouteIr(args) {
  		const rawMethod = Scratch.Cast.toString(args.METHOD).trim().toUpperCase();
  		const rawAction = Scratch.Cast.toString(args.ON_UNAUTHENTICATED).trim();
  		const route = {
  			method: rawMethod === "*" ? "*" : normalizeHttpMethod(rawMethod),
  			path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
  			onUnauthenticated: rawAction === "json-401" || rawAction === "forbid-403" ? rawAction : "redirect-login"
  		};
  		return JSON.stringify(route);
  	}
  	createBearerRouteIr(args) {
  		const route = {
  			method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
  			path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
  			onUnauthenticated: "json-401",
  			auth: "bearer-jwt"
  		};
  		return JSON.stringify(route);
  	}
  	createBearerRoleRouteIr(args) {
  		const route = {
  			method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
  			path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
  			onUnauthenticated: "json-401",
  			auth: "bearer-jwt",
  			requiredRole: Scratch.Cast.toString(args.ROLE)
  		};
  		return JSON.stringify(route);
  	}
  	createBearerScopeRouteIr(args) {
  		const route = {
  			method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
  			path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
  			onUnauthenticated: "json-401",
  			auth: "bearer-jwt",
  			requiredScopes: parseScopes(Scratch.Cast.toString(args.SCOPE))
  		};
  		return JSON.stringify(route);
  	}
  	createAuthIr(args) {
  		const parsedRoutes = JSON.parse(Scratch.Cast.toString(args.PROTECTED_ROUTES));
  		const protectedRoutes = Array.isArray(parsedRoutes) ? parsedRoutes : [parsedRoutes];
  		const auth = {
  			mode: "external-oauth-oidc",
  			providers: parseProviders(Scratch.Cast.toString(args.PROVIDERS)),
  			session: "signed-cookie",
  			loginPath: "/auth/login",
  			callbackPath: "/auth/callback",
  			logoutPath: "/auth/logout",
  			mePath: "/auth/me",
  			protectedRoutes
  		};
  		return JSON.stringify(parseWorkerIr({
  			name: "auth-validation",
  			handlers: [],
  			auth
  		}).auth);
  	}
  	createWorkerIrWithAuth(args) {
  		const parsedHandlers = JSON.parse(Scratch.Cast.toString(args.HANDLERS));
  		const handlers = Array.isArray(parsedHandlers) ? parsedHandlers : [parsedHandlers];
  		const auth = JSON.parse(Scratch.Cast.toString(args.AUTH));
  		const ir = parseWorkerIr({
  			name: Scratch.Cast.toString(args.NAME),
  			handlers,
  			auth
  		});
  		return JSON.stringify(ir);
  	}
  	generateFilesJson(args) {
  		const ir = JSON.parse(Scratch.Cast.toString(args.IR));
  		return JSON.stringify(generateCloudflareWorkerFiles(ir));
  	}
  	toScratchPaletteEntry(block) {
  		if (isSeparatorDefinition(block)) return "---";
  		const scratchBlock = {
  			opcode: block.opcode,
  			blockType: Scratch.BlockType[block.blockType],
  			text: Scratch.translate(block.text),
  			arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [name, {
  				type: Scratch.ArgumentType[argument.type],
  				defaultValue: argument.defaultValue
  			}]))
  		};
  		if (block.category === "auth") scratchBlock.blockIconURI = authBlockIconUri;
  		return scratchBlock;
  	}
  };
  function isSeparatorDefinition(block) {
  	return "kind" in block && block.kind === "separator";
  }
  function parseProviders(value) {
  	const normalized = value.split(",").map((provider) => provider.trim().toLowerCase()).filter((provider) => provider.length > 0).filter((provider) => provider === "google" || provider === "microsoft" || provider === "github");
  	return [...new Set(normalized)];
  }
  function normalizeMethodOrWildcard(value) {
  	const normalized = value.trim().toUpperCase();
  	return normalized === "*" ? "*" : normalizeHttpMethod(normalized);
  }
  function parseScopes(value) {
  	return value.split(/[,\s]+/).map((scope) => scope.trim()).filter((scope) => scope.length > 0);
  }
  //#endregion
  //#region src/index.ts
  if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  Scratch.extensions.register(new CloudflareExtension());
  //#endregion

})(Scratch);
