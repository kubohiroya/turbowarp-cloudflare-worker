# OAuth/OIDC 認証ブロック仕様

## 目的

この仕様は、TurboWarp のブロックで書いた HTTP ハンドラを Cloudflare Workers へ変換するときに、Google、Microsoft、GitHub などの外部アカウント認証をどう表現するかを定めます。

このパッケージ自身は OAuth/OIDC プロバイダにはなりません。ブロックは認証処理の詳細ではなく、次の方針を宣言します。

- どの外部プロバイダを使うか。
- どのルートをログイン必須にするか。
- 未ログイン時にリダイレクト、401 JSON、403 のどれで応答するか。
- Worker 側でセッションCookie、Bearer JWT、Cloudflare Access のどれを前提にするか。

## MVP ブロック

パレット上では、HTTP handler/Worker生成の基本ブロックを先に置き、その後にseparatorを挟んで認証系ブロックを並べます。認証系ブロックには `category: "auth"` を付け、TurboWarpが対応する環境では通常のCloudflareブロックとは異なる小さな鍵アイコンを表示します。対応しない環境ではアイコン指定は無視されます。

| ブロック | 生成するIR | 用途 |
| --- | --- | --- |
| `protected route [METHOD] [PATH] when unauthenticated [ON_UNAUTHENTICATED]` | `ProtectedRouteIr` | ルート単位のログイン必須設定 |
| `API route [METHOD] [PATH] requires bearer token` | `ProtectedRouteIr` | APIルートにES256 Bearer JWT認証を要求 |
| `API route [METHOD] [PATH] requires bearer role [ROLE]` | `ProtectedRouteIr` | `role` claimによる認可を要求 |
| `API route [METHOD] [PATH] requires bearer scope [SCOPE]` | `ProtectedRouteIr` | `scope` claimによる認可を要求 |
| `external OAuth/OIDC auth providers [PROVIDERS] protected routes JSON [PROTECTED_ROUTES]` | `AuthBindingIr` | Google/Microsoft/GitHub連携と保護ルート一覧 |
| `Cloudflare Worker [NAME] with handlers JSON [HANDLERS] and auth JSON [AUTH]` | `CloudflareWorkerIr` | HTTP handler IR と auth IR を統合 |
| `generated Cloudflare files JSON from IR [IR]` | `GeneratedFile[]` | Worker一式の生成結果 |

`PROVIDERS` は `google,github,microsoft` のようなカンマ区切り文字列です。Apple認証はMVP外です。

`ON_UNAUTHENTICATED` は次の値を取ります。

| 値 | 挙動 |
| --- | --- |
| `redirect-login` | ブラウザ画面向け。未ログインならログインURLへリダイレクト |
| `json-401` | API向け。未ログインなら `{error:"authentication_required"}` を401で返す |
| `forbid-403` | 認証が必須で、ログイン誘導しない場合に403を返す |

## IR

```ts
type AuthProvider = 'google' | 'microsoft' | 'github';
type AuthSessionMode = 'signed-cookie' | 'bearer-jwt' | 'cloudflare-access';
type UnauthenticatedAction = 'redirect-login' | 'json-401' | 'forbid-403';

interface ProtectedRouteIr {
  method: HttpMethod | '*';
  path: string;
  onUnauthenticated: UnauthenticatedAction;
  auth?: 'session' | 'bearer-jwt';
  requiredRole?: string;
  requiredScopes?: string[];
}

interface AuthBindingIr {
  mode: 'external-oauth-oidc';
  providers: AuthProvider[];
  session?: AuthSessionMode;
  loginPath?: string;
  callbackPath?: string;
  logoutPath?: string;
  protectedRoutes?: ProtectedRouteIr[];
}
```

例:

```json
{
  "mode": "external-oauth-oidc",
  "providers": ["google", "github"],
  "session": "signed-cookie",
  "loginPath": "/auth/login",
  "callbackPath": "/auth/callback",
  "logoutPath": "/auth/logout",
  "protectedRoutes": [
    {
      "method": "GET",
      "path": "/private",
      "onUnauthenticated": "redirect-login"
    }
  ]
}
```

## 生成されるWorker側の責務

生成器は初期段階で次の処理を生成します。

- `/auth/login`
- `/auth/login/:provider`
- `/auth/callback/:provider`
- `/auth/logout`
- `/auth/me`
- `protectedRoutes` に基づく Hono middleware
- Cloudflare Access利用時の `Cf-Access-Jwt-Assertion` 検出
- OAuth/OIDC `state` cookie の発行とcallback時の照合
- PKCE `code_verifier` / `code_challenge` の発行と token exchange への反映
- OIDC `nonce` の発行とID token claim照合
- provider token endpoint への authorization code exchange
- OIDC ID token の issuer、audience、expiration、nonce、JWKS署名検証
- userinfo endpoint からの最小identity抽出
- GitHub `/user/emails` からの verified primary email 取得
- HMAC-SHA-256署名付き `tw_session` cookie の発行
- `tw_session` cookie の署名検証と期限確認
- 現在の認証状態とユーザー情報を返す `/auth/me`
- `Authorization: Bearer ...` のES256 JWT検証
- Bearer JWTの `iss`、`aud`、`exp`、`role`、`scope` 検査

## Bearer JWT CLI

APIサーバ向けには、ローカルCLIでES256鍵を生成し、APIアクセス用tokenを発行します。

```sh
turbowarp-cloudflare-worker auth keygen --out .tw-auth
turbowarp-cloudflare-worker auth issue-token \
  --key .tw-auth/private-key.jwk \
  --worker-name tw-api-app \
  --sub teacher \
  --role admin \
  --scope posts:read \
  --scope posts:write \
  --ttl 1h
```

`scope` claimはOAuth慣習に合わせて空白区切り文字列としてJWTへ入れます。IRとブロック側では配列として扱います。

`--worker-name` を指定すると、issuer は `https://<worker-name>.workers.dev`、audience は `<worker-name>` になります。生成Worker側も同じ値を既定値として検証するため、`BEARER_JWT_ISSUER` / `BEARER_JWT_AUDIENCE` を設定し忘れても別用途のtokenを受け入れません。カスタムドメインや用途名を使う場合は `--issuer` / `--audience` と Worker側環境変数を合わせて指定します。

package改名前から発行済みのtokenとの互換性を保つため、`--worker-name`と`--audience`をどちらも省略した場合の既定audienceは、legacy値`turbowarp-http-server-cloudflare`のまま維持します。新規構成では曖昧な既定値に依存せず、`--worker-name`または`--audience`を明示してください。

ただし、MVPの生成器は認証ライブラリ相当の網羅的な検証までは行いません。productionで使う前に、少なくとも provider ごとのscope、Microsoft tenant制約、session cookie rotation、ログアウト後のprovider session、エラー画面、監査ログを確認します。必要に応じて Auth.js、Arctic、OpenID Client、またはCloudflare Accessの検証処理へ置き換えます。

## 秘密情報の扱い

クライアントID、クライアントシークレット、Cookie署名鍵、JWT issuer/audience などの秘密情報は、TurboWarp ブロックや `.sb3` に保存しません。Cloudflare の Secrets または環境変数に置きます。

```sh
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SESSION_SECRET
```

ブロックが扱うのは、プロバイダ名、保護ルート、未認証時の動作だけです。この分離により、教育用の見通しと実運用時の安全性を両立させます。

## 今後の実装候補

- providerごとのredirect先制御。
- Cloudflare KV/D1を使ったsession store。
- 認証ライブラリの選定と薄いadapter。
- Microsoft tenant ID 固定オプション。
- Bearer JWT mode のJWKS検証。
- `現在のユーザーID`、`現在のユーザー名`、`ログイン済み?` reporter block。
- `/auth/me` を呼び出す TurboWarp 側 reporter block。
- `ルート [METHOD] [PATH] はログイン必須` の日本語ブロック表記。
