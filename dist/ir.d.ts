export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type AuthProvider = 'google' | 'microsoft' | 'github';
export type StorageKind = 'd1' | 'kv' | 'r2' | 'durable-object';
export type AuthSessionMode = 'signed-cookie' | 'bearer-jwt' | 'cloudflare-access';
export type UnauthenticatedAction = 'redirect-login' | 'json-401' | 'forbid-403';
export type ProtectedRouteAuth = 'session' | 'bearer-jwt';
export interface GeneratedFile {
    path: string;
    contents: string;
}
export interface AuthBindingIr {
    mode: 'external-oauth-oidc';
    providers: AuthProvider[];
    session?: AuthSessionMode;
    loginPath?: string;
    callbackPath?: string;
    logoutPath?: string;
    mePath?: string;
    protectedRoutes?: ProtectedRouteIr[];
    jwtIssuerEnv?: string;
    jwtAudienceEnv?: string;
}
export interface ProtectedRouteIr {
    method: HttpMethod | '*';
    path: string;
    onUnauthenticated: UnauthenticatedAction;
    auth?: ProtectedRouteAuth;
    requiredRole?: string;
    requiredScopes?: string[];
}
export interface StorageBindingIr {
    kind: StorageKind;
    binding: string;
    name: string;
}
export interface HttpHandlerIr {
    method: HttpMethod;
    path: string;
    responseText: string;
}
export interface CloudflareWorkerIr {
    name: string;
    handlers: HttpHandlerIr[];
    compatibilityDate?: string;
    auth?: AuthBindingIr;
    storage?: StorageBindingIr[];
}
export declare function normalizeHttpMethod(value: string): HttpMethod;
export declare function normalizeRoutePath(value: string): string;
export declare function parseWorkerIr(value: unknown): CloudflareWorkerIr;
