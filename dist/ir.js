export function normalizeHttpMethod(value) {
    const normalized = value.trim().toUpperCase();
    if (isHttpMethod(normalized))
        return normalized;
    throw new TypeError(`Unsupported HTTP method: ${value}`);
}
export function normalizeRoutePath(value) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('/'))
        return `/${trimmed}`;
    return trimmed || '/';
}
export function parseWorkerIr(value) {
    if (!isRecord(value)) {
        throw new TypeError('Cloudflare Worker IR must be an object.');
    }
    const name = requireString(value.name, 'IR name');
    const handlers = Array.isArray(value.handlers)
        ? value.handlers.map((handler, index) => parseHandlerIr(handler, index))
        : [];
    const compatibilityDate = value.compatibilityDate === undefined
        ? undefined
        : requireString(value.compatibilityDate, 'IR compatibilityDate');
    const auth = value.auth === undefined ? undefined : parseAuthBindingIr(value.auth);
    const storage = value.storage === undefined ? undefined : parseStorageBindings(value.storage);
    return {
        name,
        handlers,
        ...(compatibilityDate === undefined ? {} : { compatibilityDate }),
        ...(auth === undefined ? {} : { auth }),
        ...(storage === undefined ? {} : { storage })
    };
}
function parseHandlerIr(value, index) {
    if (!isRecord(value)) {
        throw new TypeError(`Handler at index ${index} must be an object.`);
    }
    return {
        method: normalizeHttpMethod(requireString(value.method, `Handler ${index} method`)),
        path: normalizeRoutePath(requireString(value.path, `Handler ${index} path`)),
        responseText: requireString(value.responseText, `Handler ${index} responseText`)
    };
}
function parseAuthBindingIr(value) {
    if (!isRecord(value)) {
        throw new TypeError('IR auth must be an object.');
    }
    const mode = requireString(value.mode, 'IR auth mode');
    if (mode !== 'external-oauth-oidc') {
        throw new TypeError(`Unsupported auth mode: ${mode}`);
    }
    const providers = Array.isArray(value.providers)
        ? value.providers.map((provider) => requireAuthProvider(provider))
        : [];
    return {
        mode,
        providers,
        ...(value.session === undefined ? {} : { session: requireAuthSessionMode(value.session) }),
        ...(value.loginPath === undefined
            ? {}
            : { loginPath: normalizeRoutePath(requireString(value.loginPath, 'IR auth loginPath')) }),
        ...(value.callbackPath === undefined
            ? {}
            : { callbackPath: normalizeRoutePath(requireString(value.callbackPath, 'IR auth callbackPath')) }),
        ...(value.logoutPath === undefined
            ? {}
            : { logoutPath: normalizeRoutePath(requireString(value.logoutPath, 'IR auth logoutPath')) }),
        ...(value.mePath === undefined
            ? {}
            : { mePath: normalizeRoutePath(requireString(value.mePath, 'IR auth mePath')) }),
        ...(value.protectedRoutes === undefined
            ? {}
            : { protectedRoutes: parseProtectedRoutes(value.protectedRoutes) }),
        ...(value.jwtIssuerEnv === undefined
            ? {}
            : { jwtIssuerEnv: requireString(value.jwtIssuerEnv, 'IR auth jwtIssuerEnv') }),
        ...(value.jwtAudienceEnv === undefined
            ? {}
            : { jwtAudienceEnv: requireString(value.jwtAudienceEnv, 'IR auth jwtAudienceEnv') })
    };
}
function parseProtectedRoutes(value) {
    if (!Array.isArray(value)) {
        throw new TypeError('IR auth protectedRoutes must be an array.');
    }
    return value.map((route, index) => {
        if (!isRecord(route)) {
            throw new TypeError(`Protected route at index ${index} must be an object.`);
        }
        return {
            method: route.method === '*'
                ? '*'
                : normalizeHttpMethod(requireString(route.method, `Protected route ${index} method`)),
            path: normalizeRoutePath(requireString(route.path, `Protected route ${index} path`)),
            onUnauthenticated: requireUnauthenticatedAction(route.onUnauthenticated, `Protected route ${index} onUnauthenticated`),
            ...(route.auth === undefined
                ? {}
                : { auth: requireProtectedRouteAuth(route.auth, `Protected route ${index} auth`) }),
            ...(route.requiredRole === undefined
                ? {}
                : { requiredRole: requireString(route.requiredRole, `Protected route ${index} requiredRole`) }),
            ...(route.requiredScopes === undefined
                ? {}
                : { requiredScopes: parseStringArray(route.requiredScopes, `Protected route ${index} requiredScopes`) })
        };
    });
}
function parseStorageBindings(value) {
    if (!Array.isArray(value)) {
        throw new TypeError('IR storage must be an array.');
    }
    return value.map((binding, index) => {
        if (!isRecord(binding)) {
            throw new TypeError(`Storage binding at index ${index} must be an object.`);
        }
        return {
            kind: requireStorageKind(binding.kind),
            binding: requireString(binding.binding, `Storage binding ${index} binding`),
            name: requireString(binding.name, `Storage binding ${index} name`)
        };
    });
}
function isHttpMethod(value) {
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].includes(value);
}
function requireAuthProvider(value) {
    if (value === 'google' || value === 'microsoft' || value === 'github')
        return value;
    throw new TypeError(`Unsupported auth provider: ${String(value)}`);
}
function requireAuthSessionMode(value) {
    if (value === 'signed-cookie' || value === 'bearer-jwt' || value === 'cloudflare-access') {
        return value;
    }
    throw new TypeError(`Unsupported auth session mode: ${String(value)}`);
}
function requireUnauthenticatedAction(value, label) {
    if (value === 'redirect-login' || value === 'json-401' || value === 'forbid-403')
        return value;
    throw new TypeError(`${label} must be redirect-login, json-401, or forbid-403.`);
}
function requireProtectedRouteAuth(value, label) {
    if (value === 'session' || value === 'bearer-jwt')
        return value;
    throw new TypeError(`${label} must be session or bearer-jwt.`);
}
function parseStringArray(value, label) {
    if (!Array.isArray(value)) {
        throw new TypeError(`${label} must be an array.`);
    }
    return value.map((item, index) => requireString(item, `${label}[${index}]`));
}
function requireStorageKind(value) {
    if (value === 'd1' || value === 'kv' || value === 'r2' || value === 'durable-object') {
        return value;
    }
    throw new TypeError(`Unsupported storage kind: ${String(value)}`);
}
function requireString(value, label) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new TypeError(`${label} must be a non-empty string.`);
    }
    return value;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=ir.js.map