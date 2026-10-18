import type {SourceEditorOptions} from '@kubohiroya/turbowarp-extension-data-editor/schema';
import {extensionConfig} from './config.js';
import {canonicalBundle, sourceBinding} from './source-editor.js';
import handler from '../schemas/handler-ir.schema.json' with {type: 'json'};
import worker from '../schemas/worker-ir.schema.json' with {type: 'json'};
import routes from '../schemas/protected-routes.schema.json' with {type: 'json'};
import auth from '../schemas/auth-ir.schema.json' with {type: 'json'};
import {parseWorkerIr} from './ir.js';
export const cloudflareSchemaBundles = {
 handler: canonicalBundle('turbowarp-http-server-cloudflare', 'handler-ir', handler, {path: 'src/ir.ts', symbol: 'parseWorkerIr'}),
 worker: canonicalBundle('turbowarp-http-server-cloudflare', 'worker-ir', worker, {path: 'src/ir.ts', symbol: 'parseWorkerIr'}),
 routes: canonicalBundle('turbowarp-http-server-cloudflare', 'protected-routes', routes, {path: 'src/ir.ts', symbol: 'parseWorkerIr'}),
 auth: canonicalBundle('turbowarp-http-server-cloudflare', 'auth-ir', auth, {path: 'src/ir.ts', symbol: 'parseWorkerIr'})
};
function handlersSource(source: string): void {
 const data: unknown = JSON.parse(source);
 parseWorkerIr({name: 'editor-validation', handlers: Array.isArray(data) ? data : [data]});
}
function routesSource(source: string): void {
 const data: unknown = JSON.parse(source);
 parseWorkerIr({name: 'editor-validation', auth: {mode: 'external-oauth-oidc', providers: [], protectedRoutes: Array.isArray(data) ? data : [data]}});
}
const methodHints = {'ui:enum': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']};
const routeHints = {method: {'ui:enum': ['*', ...methodHints['ui:enum']]}};
const authHints = {protectedRoutes: {items: routeHints}};
const handlerHints = {method: methodHints, items: {method: methodHints}};
const handlerBinding = () => sourceBinding('HANDLERS', cloudflareSchemaBundles.handler, JSON.parse, handlersSource,
 'json', handlerHints);
const authBinding = () => sourceBinding('AUTH', cloudflareSchemaBundles.auth, JSON.parse,
 source => parseWorkerIr({name: 'editor-validation', auth: JSON.parse(source)}), 'json', authHints);
const definitions = [
 {editorId: 'worker-handlers-source', opcodes: ['createWorkerIr'], bindings: [handlerBinding()]},
 {editorId: 'worker-ir-source', opcodes: ['generateFilesJson'], bindings: [sourceBinding('IR', cloudflareSchemaBundles.worker, JSON.parse, source => parseWorkerIr(JSON.parse(source)), 'json', {handlers: {items: {method: methodHints}}, auth: authHints})]},
 {editorId: 'protected-routes-source', opcodes: ['createAuthIr'], bindings: [sourceBinding('PROTECTED_ROUTES', cloudflareSchemaBundles.routes, JSON.parse, routesSource, 'json', {...routeHints, items: routeHints})]},
 {editorId: 'worker-with-auth-source', opcodes: ['createWorkerIrWithAuth'], bindings: [handlerBinding(), authBinding()]}
];

export const sourceEditorDefinitions: readonly SourceEditorOptions[] = definitions.map(({editorId, opcodes, bindings}) => ({
  apiVersion: 1, extensionId: extensionConfig.id, editorId, opcodes: opcodes.map(opcode => `${extensionConfig.id}_${opcode}`), bindings,
  validationContext: () => ({consumerId: extensionConfig.id, nowMs: Date.now(), settings: null})
}));
