# Cloudflare 連携パッケージ設計

## 位置づけ

`turbowarp-cloudflare-worker` は、`turbowarp-http-server` 本体からCloudflare Workers向けの生成・デプロイ補助を分離するためのパッケージです。

本体リポジトリは TurboWarp 上で HTTP ハンドラをブロックとして表現し、ローカル実行や教育用の体験を成立させる責務を持ちます。一方、このリポジトリはそのブロック表現を Cloudflare Workers で動く TypeScript/Hono コードへ変換する責務を持ちます。

分離する理由は次の通りです。

- Cloudflare Workers、Wrangler、D1/KV/R2/Durable Objects は本体より更新頻度と依存が重い。
- デプロイや認証は外部環境との結合が強く、教育用 HTTP サーバの中核と同じ release cycle にしないほうがよい。
- 将来的に Firebase/Vercel など別 target を追加する場合も、target ごとに peer package として分けやすい。

## 構成

- `src/ir.ts`: ブロック/CLI/生成器で共有する Cloudflare Worker IR。
- `src/generator.ts`: IR から `GeneratedFile[]` を返す Cloudflare Workers/Hono 生成器。
- `src/cli.ts`: JSON IR を読み、生成ファイルを out directory に書き出す CLI。
- `src/extension.ts`: TurboWarp から IR を作る最小ブロック。
- `tests/generator.test.ts`: 生成器の最小テスト。

## IR

初期 IR は意図的に小さくしています。

```ts
interface CloudflareWorkerIr {
  name: string;
  handlers: HttpHandlerIr[];
  compatibilityDate?: string;
  auth?: AuthBindingIr;
  storage?: StorageBindingIr[];
}
```

HTTP handler は `method`、`path`、`responseText` のみから開始します。これは TurboWarp のブロックと Cloudflare Workers/Hono のコード生成を結びつける最小単位です。

## 生成対象

MVP の生成対象は次の 4 ファイルです。

- `wrangler.jsonc`
- `package.json`
- `tsconfig.json`
- `src/index.ts`

`src/index.ts` は Hono を使った Worker として生成します。ブロックから作られた root 以下の HTTP handler は、Hono の `app.get('/path', ...)` などへ対応づけます。

## 認証

このパッケージが OAuth/OIDC プロバイダになることはありません。MVP では Google、Microsoft、GitHub の外部アカウント連携を想定します。Apple 認証は MVP 外です。

Cloudflare Workers 上での選択肢は主に 2 つです。

- Worker 内で provider-issued JWT を検証する。
- Cloudflare Access などを Worker の前段に置き、Worker は認証済み identity を受け取る。

教育的には、まず「認証済み前提の handler」と「外部 provider の token を検証する middleware」を分けて説明できるようにするのが重要です。現在の初期実装では、`auth` IR からログイン/コールバック/ログアウトの route、OAuth/OIDC state照合、authorization code exchange、署名付きsession cookie、保護ルート middleware を生成します。

ブロック仕様は [auth-blocks.ja.md](auth-blocks.ja.md) にまとめます。ブロックは provider 名、保護ルート、未認証時の動作を宣言し、client secret、cookie署名鍵、issuer/audienceなどの秘密情報は Cloudflare Secrets または環境変数で扱います。

## 永続ストレージ

Cloudflare のストレージは用途で分けます。

| 種類 | 用途 | 注意点 |
| --- | --- | --- |
| D1 | relational data、ユーザー、投稿、設定、履歴 | SQL schema と migration の扱いが必要 |
| KV | 設定、feature flag、短命 cache | eventual consistency 前提で使う |
| R2 | 画像、添付ファイル、生成物、export | metadata と object body を分けて扱う |
| Durable Objects | session、WebSocket、協調編集、順序制御 | class 設計と migration が必要 |

初期実装は `wrangler.jsonc` の binding と Worker `Env` 型への反映までに留めます。実データ操作の API、migration、型付き repository は後続 issue で分けます。

## TurboWarp ブロックとの対応

TurboWarp 側では、まず JSON IR を作る reporter block を提供します。

- handler block: HTTP method、path、response text を `HttpHandlerIr` にする。
- protected route block: HTTP method、path、未認証時の挙動を `ProtectedRouteIr` にする。
- auth block: Google/Microsoft/GitHub provider と保護ルート一覧を `AuthBindingIr` にする。
- Worker IR block: handler 配列を `CloudflareWorkerIr` にまとめる。
- Worker IR with auth block: handler 配列と `AuthBindingIr` を `CloudflareWorkerIr` にまとめる。
- generated files block: IR から `GeneratedFile[]` JSON を得る。

ブラウザ上の TurboWarp extension から直接 `wrangler deploy` は実行しません。デプロイは CLI またはローカル dev tool 側の責務にします。

## 今後の拡張

- route parameter、query/body/header の mapping。
- JSON response、status code、headers。
- D1 migration と seed generation。
- OAuth/OIDC middleware generation。
- Cloudflare Access 前提の identity extraction。
- `wrangler deploy` を実行するローカル CLI workflow。
- `turbowarp-http-server` 本体から export される IR との schema alignment。
