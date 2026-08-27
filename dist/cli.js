#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, relative, sep } from 'node:path';
import { generateCloudflareWorkerFiles } from './generator.js';
import { generateEs256JwtKey, issueEs256Jwt, parseTtl } from './jwt.js';
async function main(argv) {
    const command = argv[0] ?? 'generate';
    if (command === 'auth') {
        await runAuthCommand(argv.slice(1));
        return;
    }
    const options = parseGenerateArgs(command === 'generate' ? argv.slice(1) : argv);
    const source = await readFile(options.input, 'utf8');
    const files = generateCloudflareWorkerFiles(JSON.parse(source));
    for (const file of files) {
        const destination = safeJoin(options.outDir, file.path);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, file.contents, 'utf8');
    }
    process.stdout.write(`Generated ${files.length} files in ${options.outDir}\n`);
}
async function runAuthCommand(argv) {
    const command = argv[0];
    if (command === 'keygen') {
        const outDir = valueAfter(argv, '--out') ?? valueAfter(argv, '-o') ?? '.tw-auth';
        const kid = valueAfter(argv, '--kid');
        const result = await generateEs256JwtKey({ outDir, ...(kid === undefined ? {} : { kid }) });
        process.stdout.write([
            `Generated ES256 key ${result.kid}`,
            `private: ${result.privateKeyPath}`,
            `public: ${result.publicJwkPath}`,
            `jwks: ${result.jwksPath}`
        ].join('\n'));
        process.stdout.write('\n');
        return;
    }
    if (command === 'issue-token') {
        const keyPath = requireFlag(argv, '--key');
        const subject = requireFlag(argv, '--sub');
        const role = valueAfter(argv, '--role') ?? 'user';
        const scopes = valuesAfter(argv, '--scope').flatMap(parseScopes);
        const workerName = valueAfter(argv, '--worker-name');
        const issuer = valueAfter(argv, '--issuer');
        const audience = valueAfter(argv, '--audience');
        const ttlSeconds = parseTtl(valueAfter(argv, '--ttl'));
        const token = await issueEs256Jwt({
            keyPath,
            subject,
            role,
            scopes,
            ...(workerName === undefined ? {} : { workerName }),
            ...(issuer === undefined ? {} : { issuer }),
            ...(audience === undefined ? {} : { audience }),
            ttlSeconds
        });
        process.stdout.write(`${token}\n`);
        return;
    }
    printHelp();
    process.exit(1);
}
function parseGenerateArgs(argv) {
    const input = valueAfter(argv, '--input') ?? valueAfter(argv, '-i');
    const outDir = valueAfter(argv, '--out') ?? valueAfter(argv, '-o') ?? 'dist-worker';
    if (!input || argv.includes('--help') || argv.includes('-h')) {
        printHelp();
        process.exit(input ? 0 : 1);
    }
    return { input, outDir };
}
function printHelp() {
    process.stdout.write([
        'Usage:',
        '  turbowarp-http-server-cloudflare generate --input worker-ir.json --out dist-worker',
        '  turbowarp-http-server-cloudflare --input worker-ir.json --out dist-worker',
        '  turbowarp-http-server-cloudflare auth keygen --out .tw-auth',
        '  turbowarp-http-server-cloudflare auth issue-token --key .tw-auth/private-key.jwk --worker-name tw-api-app --sub teacher --role admin --scope posts:read --scope posts:write',
        '',
        'The generate command input file must contain CloudflareWorkerIr JSON.',
        'The auth commands create local ES256 bearer JWT keys and issue API tokens.'
    ].join('\n'));
    process.stdout.write('\n');
}
function valueAfter(argv, flag) {
    const index = argv.indexOf(flag);
    if (index === -1)
        return undefined;
    return argv[index + 1];
}
function valuesAfter(argv, flag) {
    const values = [];
    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index + 1];
        if (argv[index] === flag && value) {
            values.push(value);
        }
    }
    return values;
}
function requireFlag(argv, flag) {
    const value = valueAfter(argv, flag);
    if (!value) {
        throw new Error(`Missing required flag: ${flag}`);
    }
    return value;
}
function parseScopes(value) {
    return value
        .split(/[,\s]+/)
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);
}
function safeJoin(root, childPath) {
    const destination = normalize(join(root, childPath));
    const relativePath = relative(root, destination);
    if (relativePath.startsWith('..') || relativePath.split(sep).includes('..')) {
        throw new Error(`Generated file escaped output directory: ${childPath}`);
    }
    return destination;
}
main(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map