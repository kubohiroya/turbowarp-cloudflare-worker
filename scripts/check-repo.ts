import {access, readFile} from 'node:fs/promises';

interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  packageManager?: string;
  engines?: {node?: string};
  repository?: {url?: string};
  bugs?: {url?: string};
  files?: string[];
  bin?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface RepoPolicy {
  schemaVersion: number;
  productName: string;
  packageType: string;
  licensePolicy: string;
  readmeLanguages: string[];
  canonicalReadme: string;
  localizedReadmes: {
    ja: string;
  };
  node: {
    minimum: string;
  };
  packageManager: string;
  requiredFiles: string[];
  exceptions: {
    upstreamFork: boolean;
    mixedContentLicenses: boolean;
    legacyPackageName: boolean;
    thirdPartyBundle: boolean;
  };
  migrationChecklist: string[];
}
const errors: string[] = [];

const packageMetadata = JSON.parse(await readFile('package.json', 'utf8')) as PackageMetadata;
const policy = JSON.parse(await readFile('repo-policy.json', 'utf8')) as RepoPolicy;
const readme = await readFile(policy.canonicalReadme, 'utf8');
const readmeJa = await readFile(policy.localizedReadmes.ja, 'utf8');
const license = await readFile('LICENSE', 'utf8');
const config = await readFile('src/config.ts', 'utf8');

checkPolicy();
checkPackageMetadata();
checkReadmes();
checkLicense();
checkGeneratedArtifacts();
await checkRequiredFiles();

if (errors.length > 0) {
  throw new Error(`Repository policy check failed:\n- ${errors.join('\n- ')}`);
}

process.stdout.write('Repository policy is aligned.\n');

function checkPolicy() {
  if (policy.schemaVersion !== 1) errors.push('repo-policy.json schemaVersion must be 1');
  if (policy.productName !== 'turbowarp-http-server-cloudflare') {
    errors.push('repo-policy.json productName must match this repository');
  }
  if (policy.licensePolicy !== 'mpl-2.0') {
    errors.push('repo-policy.json licensePolicy must be mpl-2.0');
  }
  if (policy.packageManager !== 'pnpm') {
    errors.push('repo-policy.json packageManager must be pnpm');
  }
  if (!Array.isArray(policy.migrationChecklist) || policy.migrationChecklist.length === 0) {
    errors.push('repo-policy.json must include a migration checklist');
  }
}

function checkPackageMetadata() {
  const requiredStrings = ['description', 'author', 'license', 'homepage', 'packageManager'] as const;
  for (const key of requiredStrings) {
    const value = packageMetadata[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`package.json ${key} must be a non-empty string`);
    }
  }
  if (packageMetadata.license !== 'MPL-2.0') errors.push('package.json license must be MPL-2.0');
  if (!packageMetadata.packageManager?.startsWith('pnpm@')) {
    errors.push('package.json packageManager must pin pnpm exactly');
  }
  if (packageMetadata.engines?.node !== '>=22.18.0') {
    errors.push('package.json engines.node must be >=22.18.0');
  }
  if (packageMetadata.name !== '@kubohiroya/turbowarp-http-server-cloudflare') {
    errors.push('package.json name must be @kubohiroya/turbowarp-http-server-cloudflare');
  }
  if (
    packageMetadata.repository?.url !==
    'git+https://github.com/kubohiroya/turbowarp-http-server-cloudflare.git'
  ) {
    errors.push('package.json repository.url must point to the current repository');
  }
  if (
    packageMetadata.bugs?.url !==
    'https://github.com/kubohiroya/turbowarp-http-server-cloudflare/issues'
  ) {
    errors.push('package.json bugs.url must point to the current issue tracker');
  }
  for (const file of policy.requiredFiles) {
    if (!packageMetadata.files?.includes(file)) {
      errors.push(`package.json files must include ${file}`);
    }
  }
  for (const command of ['docs:check', 'check', 'check:dist']) {
    if (/\bnpm run\b/u.test(packageMetadata.scripts?.[command] ?? '')) {
      errors.push(`package.json ${command} must use pnpm run`);
    }
  }
}

function checkReadmes() {
  if (!readme.startsWith(`# ${policy.productName}\n`)) {
    errors.push('README.md H1 must match repo-policy.json productName');
  }
  if (!readme.includes('[日本語](README.ja.md)')) {
    errors.push('README.md must link to README.ja.md');
  }
  if (!readme.includes('## MVP Scope')) errors.push('README.md must include MVP Scope');
  if (!readme.includes('Cloudflare Workers + TypeScript + Hono')) {
    errors.push('README.md must document the Cloudflare Workers + TypeScript + Hono target');
  }
  if (!readme.includes('MPL-2.0')) errors.push('README.md License section must include MPL-2.0');
  if (!readmeJa.startsWith('# turbowarp-http-server-cloudflare\n')) {
    errors.push('README.ja.md must mirror the product H1');
  }
  if (!readmeJa.includes('OAuth/OIDC')) errors.push('README.ja.md must mention OAuth/OIDC');
  if (!readmeJa.includes('D1/KV/R2/Durable Objects')) {
    errors.push('README.ja.md must mention Cloudflare storage choices');
  }
}

function checkLicense() {
  if (!license.startsWith('Mozilla Public License Version 2.0\n==================================')) {
    errors.push('LICENSE must contain the Mozilla Public License Version 2.0 full text');
  }
  if (!license.includes('Exhibit A - Source Code Form License Notice')) {
    errors.push('LICENSE must include the MPL-2.0 Exhibit A text');
  }
  if (!config.includes("license: 'MPL-2.0'")) {
    errors.push('src/config.ts must expose MPL-2.0 bundle metadata');
  }
}

function checkGeneratedArtifacts() {
  const expectedBundle = `dist/${extractConfigValue('slug')}.js`;
  if (!packageMetadata.files?.includes('dist/')) errors.push('package.json files must include dist/');
  if (packageMetadata.bin?.['turbowarp-http-server-cloudflare'] !== './dist/cli.js') {
    errors.push('package.json bin must point to ./dist/cli.js');
  }
  if (!expectedBundle.includes('turbowarp-http-server-cloudflare')) {
    errors.push('src/config.ts slug must produce the Cloudflare extension bundle name');
  }
}

async function checkRequiredFiles() {
  for (const file of policy.requiredFiles) {
    await access(file);
  }
  await access('docs/architecture.ja.md');
  await access('src/ir.ts');
  await access('src/generator.ts');
  await access('src/cli.ts');
  await access('pnpm-lock.yaml');
}

function extractConfigValue(key: string): string {
  const match = config.match(new RegExp(`${key}: '([^']+)'`));
  if (!match?.[1]) throw new Error(`src/config.ts must define ${key}`);
  return match[1];
}
