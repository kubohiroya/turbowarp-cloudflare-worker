# turbowarp-http-server-cloudflare

`@kubohiroya/turbowarp-http-server-cloudflare` は、TurboWarp のブロックで表現した HTTP ハンドラ構成を Cloudflare Workers 向け TypeScript/Hono アプリへ変換するための初期実装です。

このリポジトリは `turbowarp-http-server` 本体から分離した Cloudflare 連携パッケージです。本体はブロック側の HTTP サーバ表現とローカル実行を担い、このパッケージは Cloudflare Workers へ持ち出すための IR、コード生成、CLI、将来的なデプロイ補助ブロックを担います。

## MVP 範囲

- Cloudflare Workers + TypeScript + Hono を生成対象にする。
- ブロックと CLI の両方から使える `CloudflareWorkerIr` を定義する。
- `wrangler.jsonc`、Worker 側 `package.json`、`tsconfig.json`、`src/index.ts` を `GeneratedFile[]` として生成する。
- JSON IR を読み、指定した out directory にファイルを書き出す CLI を提供する。
- TurboWarp 拡張として、最小限の IR 作成・生成結果 JSON 取得ブロックを提供する。
- 永続ストレージは D1/KV/R2/Durable Objects を IR 上で用途別に表現する。

## 非 MVP

- Apple 認証連携。
- このパッケージ自身が OAuth/OIDC プロバイダになること。
- TurboWarp ブラウザ実行環境から直接 `wrangler deploy` を実行すること。
- React island、MUI、Jotai ブロック連携の本格実装。
- 複雑なルーティング、middleware、schema validation、migration 自動生成。

## 認証方針

MVP では Google、Microsoft、GitHub など外部 OAuth/OIDC プロバイダとの連携を想定します。このパッケージは認証プロバイダそのものにはなりません。

実装方針は二段階です。

1. 生成された Worker で provider-issued JWT を検証する。
2. 必要に応じて Cloudflare Access など Worker の前段で認証を済ませる。

IR には `auth.mode: "external-oauth-oidc"`、`providers`、`protectedRoutes` を置きます。ブロックは「どの外部プロバイダを使うか」「どのルートをログイン必須にするか」「未ログイン時にどう応答するか」を宣言し、秘密情報やOAuth/OIDCの詳細手順は生成コードとCloudflare Secrets側へ委譲します。

認証ブロックの仕様は [docs/auth-blocks.ja.md](docs/auth-blocks.ja.md) に分離しています。

現在の生成器は、auth IR がある場合に `/auth/login`、`/auth/login/:provider`、`/auth/callback/:provider`、`/auth/logout`、`/auth/me` と保護ルート middleware を生成します。Google/GitHub/Microsoft の client ID/secret と `SESSION_SECRET` は Cloudflare Secrets へ設定します。

```sh
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put MICROSOFT_CLIENT_ID
wrangler secret put MICROSOFT_CLIENT_SECRET
wrangler secret put SESSION_SECRET
```

## 永続ストレージ方針

- D1: ユーザー、投稿、設定、履歴など relational data。
- KV: feature flag、短い設定、軽量 cache。
- R2: 画像、添付ファイル、エクスポート成果物など object data。
- Durable Objects: WebSocket/session、協調編集、順序制御、強い一貫性が必要な状態。

初期実装では storage binding を `wrangler.jsonc` と Worker の `Env` 型へ反映します。DB schema、migration、実アプリの repository 層は今後の課題です。

## CLI

```sh
pnpm install
pnpm build
node dist/cli.js generate --input worker-ir.json --out dist-worker
```

入力例:

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

APIサーバ向けのBearer JWTを使う場合は、ローカルCLIでES256鍵とtokenを作成します。

```sh
node dist/cli.js auth keygen --out .tw-auth
node dist/cli.js auth issue-token \
  --key .tw-auth/private-key.jwk \
  --worker-name tw-api-app \
  --sub teacher \
  --role admin \
  --scope posts:read \
  --scope posts:write \
  --ttl 1h
```

Worker側には `.tw-auth/jwks.json` の内容を `BEARER_JWKS` として設定します。必要に応じて `BEARER_JWT_ISSUER` と `BEARER_JWT_AUDIENCE` も環境変数で指定します。

## 開発

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

詳しい設計は [docs/architecture.ja.md](docs/architecture.ja.md) を参照してください。
