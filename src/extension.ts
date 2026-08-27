import {extensionConfig} from './config';
import definitions from './block-definitions.json';
import {generateCloudflareWorkerFiles} from './generator.js';
import type {AuthBindingIr, AuthProvider, CloudflareWorkerIr, HttpHandlerIr, ProtectedRouteIr} from './ir.js';
import {normalizeHttpMethod, normalizeRoutePath, parseWorkerIr} from './ir.js';

type BlockTypeName = 'REPORTER';
type ArgumentTypeName = 'STRING';
type BlockCategory = 'core' | 'auth';

interface DefinitionArgument {
  type: ArgumentTypeName;
  defaultValue: string;
}

interface BlockDefinition {
  opcode: string;
  category?: BlockCategory;
  blockType: BlockTypeName;
  text: string;
  description: string;
  arguments: Record<string, DefinitionArgument>;
}

interface SeparatorDefinition {
  kind: 'separator';
  category?: BlockCategory;
}

type PaletteDefinition = BlockDefinition | SeparatorDefinition;

const paletteDefinitions = definitions.blocks as readonly PaletteDefinition[];

const authBlockIconUri =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNiIgeT0iMTgiIHdpZHRoPSIzNiIgaGVpZ2h0PSIyNCIgcng9IjQiIGZpbGw9IiNGNzk1MjEiLz48cGF0aCBkPSJNMTUgMTh2LTZjMC01IDQtOSA5LTlzOSA0IDkgOXY2IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRjI5MzciIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiMxRjI5MzciLz48L3N2Zz4=';

export class CloudflareExtension implements TurboWarpExtension {
  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(definitions.extensionName),
      docsURI: extensionConfig.docsURI,
      blockIconURI: extensionConfig.blockIconURI,
      blocks: paletteDefinitions.map((block) => this.toScratchPaletteEntry(block))
    };
  }

  public createHandlerIr(args: {METHOD: unknown; PATH: unknown; BODY: unknown}): string {
    const handler: HttpHandlerIr = {
      method: normalizeHttpMethod(Scratch.Cast.toString(args.METHOD)),
      path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
      responseText: Scratch.Cast.toString(args.BODY)
    };
    return JSON.stringify(handler);
  }

  public createWorkerIr(args: {NAME: unknown; HANDLERS: unknown}): string {
    const parsedHandlers = JSON.parse(Scratch.Cast.toString(args.HANDLERS)) as unknown;
    const handlers = Array.isArray(parsedHandlers) ? parsedHandlers : [parsedHandlers];
    const ir: CloudflareWorkerIr = parseWorkerIr({
      name: Scratch.Cast.toString(args.NAME),
      handlers
    });
    return JSON.stringify(ir);
  }

  public createProtectedRouteIr(args: {
    METHOD: unknown;
    PATH: unknown;
    ON_UNAUTHENTICATED: unknown;
  }): string {
    const rawMethod = Scratch.Cast.toString(args.METHOD).trim().toUpperCase();
    const rawAction = Scratch.Cast.toString(args.ON_UNAUTHENTICATED).trim();
    const route: ProtectedRouteIr = {
      method: rawMethod === '*' ? '*' : normalizeHttpMethod(rawMethod),
      path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
      onUnauthenticated:
        rawAction === 'json-401' || rawAction === 'forbid-403' ? rawAction : 'redirect-login'
    };
    return JSON.stringify(route);
  }

  public createBearerRouteIr(args: {METHOD: unknown; PATH: unknown}): string {
    const route: ProtectedRouteIr = {
      method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
      path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
      onUnauthenticated: 'json-401',
      auth: 'bearer-jwt'
    };
    return JSON.stringify(route);
  }

  public createBearerRoleRouteIr(args: {METHOD: unknown; PATH: unknown; ROLE: unknown}): string {
    const route: ProtectedRouteIr = {
      method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
      path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
      onUnauthenticated: 'json-401',
      auth: 'bearer-jwt',
      requiredRole: Scratch.Cast.toString(args.ROLE)
    };
    return JSON.stringify(route);
  }

  public createBearerScopeRouteIr(args: {METHOD: unknown; PATH: unknown; SCOPE: unknown}): string {
    const route: ProtectedRouteIr = {
      method: normalizeMethodOrWildcard(Scratch.Cast.toString(args.METHOD)),
      path: normalizeRoutePath(Scratch.Cast.toString(args.PATH)),
      onUnauthenticated: 'json-401',
      auth: 'bearer-jwt',
      requiredScopes: parseScopes(Scratch.Cast.toString(args.SCOPE))
    };
    return JSON.stringify(route);
  }

  public createAuthIr(args: {PROVIDERS: unknown; PROTECTED_ROUTES: unknown}): string {
    const parsedRoutes = JSON.parse(Scratch.Cast.toString(args.PROTECTED_ROUTES)) as unknown;
    const protectedRoutes = Array.isArray(parsedRoutes) ? parsedRoutes : [parsedRoutes];
    const auth: AuthBindingIr = {
      mode: 'external-oauth-oidc',
      providers: parseProviders(Scratch.Cast.toString(args.PROVIDERS)),
      session: 'signed-cookie',
      loginPath: '/auth/login',
      callbackPath: '/auth/callback',
      logoutPath: '/auth/logout',
      mePath: '/auth/me',
      protectedRoutes: protectedRoutes as ProtectedRouteIr[]
    };
    return JSON.stringify(parseWorkerIr({name: 'auth-validation', handlers: [], auth}).auth);
  }

  public createWorkerIrWithAuth(args: {NAME: unknown; HANDLERS: unknown; AUTH: unknown}): string {
    const parsedHandlers = JSON.parse(Scratch.Cast.toString(args.HANDLERS)) as unknown;
    const handlers = Array.isArray(parsedHandlers) ? parsedHandlers : [parsedHandlers];
    const auth = JSON.parse(Scratch.Cast.toString(args.AUTH)) as unknown;
    const ir: CloudflareWorkerIr = parseWorkerIr({
      name: Scratch.Cast.toString(args.NAME),
      handlers,
      auth
    });
    return JSON.stringify(ir);
  }

  public generateFilesJson(args: {IR: unknown}): string {
    const ir = JSON.parse(Scratch.Cast.toString(args.IR)) as unknown;
    return JSON.stringify(generateCloudflareWorkerFiles(ir));
  }

  private toScratchPaletteEntry(block: PaletteDefinition): Record<string, unknown> | string {
    if (isSeparatorDefinition(block)) return '---';
    const scratchBlock: Record<string, unknown> = {
      opcode: block.opcode,
      blockType: Scratch.BlockType[block.blockType],
      text: Scratch.translate(block.text),
      arguments: Object.fromEntries(
        Object.entries(block.arguments).map(([name, argument]) => [
          name,
          {
            type: Scratch.ArgumentType[argument.type],
            defaultValue: argument.defaultValue
          }
        ])
      )
    };
    if (block.category === 'auth') {
      scratchBlock.blockIconURI = authBlockIconUri;
    }
    return scratchBlock;
  }
}

function isSeparatorDefinition(block: PaletteDefinition): block is SeparatorDefinition {
  return 'kind' in block && block.kind === 'separator';
}

function parseProviders(value: string): AuthProvider[] {
  const providers = value
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider) => provider.length > 0);
  const normalized = providers.filter(
    (provider): provider is AuthProvider =>
      provider === 'google' || provider === 'microsoft' || provider === 'github'
  );
  return [...new Set(normalized)];
}

function normalizeMethodOrWildcard(value: string): ProtectedRouteIr['method'] {
  const normalized = value.trim().toUpperCase();
  return normalized === '*' ? '*' : normalizeHttpMethod(normalized);
}

function parseScopes(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
}
