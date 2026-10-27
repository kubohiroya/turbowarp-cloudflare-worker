# turbowarp-cloudflare-worker

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

`@kubohiroya/turbowarp-cloudflare-worker` is the Cloudflare integration package for the `turbowarp-http-server` family. It defines a shared IR, generates Cloudflare Workers TypeScript/Hono files, exposes a small CLI, and provides minimal TurboWarp blocks for IR creation.

The MVP target is Cloudflare Workers + TypeScript + Hono. Authentication is expected to use external OAuth/OIDC providers such as Google, Microsoft, or GitHub. Apple sign-in is intentionally out of scope for the MVP. Persistent storage is represented through Cloudflare D1, KV, R2, and Durable Objects bindings.

## Runnable sample

[**Open the demo in TurboWarp Editor**](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-cloudflare-worker%2Fsamples%2Fgenerate-hello-worker.sb3) · [Download the SB3](https://kubohiroya.github.io/turbowarp-cloudflare-worker/samples/generate-hello-worker.sb3)

Choose **Allow** and click the green flag.
Both generated-route and response checks are true. The full Worker files JSON is stored in a hidden variable.

Editable sources and expected results: [`samples/README.md`](samples/README.md).
Run `pnpm run samples:build` after source/bundle changes and `pnpm run samples:check` before committing.

## MVP Scope

- Shared `CloudflareWorkerIr` types for blocks and CLI.
- Generator returning `GeneratedFile[]` for `wrangler.jsonc`, Worker `package.json`, and `src/index.ts`.
- CLI that reads JSON IR and writes generated files to an output directory.
- Minimal TurboWarp extension blocks for handler IR, Worker IR, and generated file JSON.
- Storage binding representation for D1, KV, R2, and Durable Objects.

## Out of Scope

- Acting as an OAuth/OIDC provider.
- Apple authentication.
- Running `wrangler deploy` directly from the browser-hosted TurboWarp extension.
- Full React island, MUI, or Jotai integration.
- Production-grade migrations, schema validation, and middleware generation.

## CLI

```sh
pnpm install
pnpm build
node dist/cli.js --input worker-ir.json --out dist-worker
```

Example IR:

```json
{
  "name": "tw-http-app",
  "handlers": [
    {"method": "GET", "path": "/hello", "responseText": "Hello from TurboWarp"}
  ],
  "storage": [
    {"kind": "d1", "binding": "DB", "name": "tw_db"}
  ]
}
```

See [docs/architecture.ja.md](docs/architecture.ja.md) for the Japanese architecture note.

## License

[Mozilla Public License 2.0](LICENSE) (SPDX: `MPL-2.0`).

固定入力の編集範囲・互換性・切戻しについては [固定入力の編集](docs/fixed-input-editors.ja.md) を参照してください。
