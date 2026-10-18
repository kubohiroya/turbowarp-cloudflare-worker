# 段階2の安定版検証記録

公開予定版: `@kubohiroya/turbowarp-cloudflare-worker@0.3.0`。4つの固定IR Schemaで5入力を編集します。HANDLERS + AUTH は単一transactionで保存し、Worker生成・deployは呼びません。

| opcode | 入力 |
| --- | --- |
| createWorkerIr | HANDLERS |
| generateFilesJson | IR |
| createAuthIr | PROTECTED_ROUTES |
| createWorkerIrWithAuth | HANDLERS, AUTH |

正本は `schemas/{handler-ir,auth-ir,protected-routes,worker-ir}.schema.json` と既存 `src/ir.ts` のpure検証です。methodは固定候補から選択し、既存の大小文字・空白の正規化規則、未知キー、配列重複を維持します。

共通依存は `76fa1d50a3c188082ceef723ea018a9d8769ea6e`（`@kubohiroya/turbowarp-extension-data-editor` 0.2.0）へGitの完全SHAで固定しています。manifest・lock・build許可・fresh実解決を揃え、直接・AJV経由のfast-uriを3.1.8へ統一しています。古い共有aliasの実解決を安定版の検証として流用していません。

Honoのdeclared range `^4.10.7` は維持し、既知moderate4件を修正する最小patch `4.13.7` へlockを更新しました。生成するWorkerのコード/APIは変更しません。

`react-dom@18.3.1` は実際のRJSF registration回帰テストに必要なdev依存として追加しました。拡張のruntimeコードはGUIのoptional APIを使い、ReactDOMを拡張bundleへ追加しません。

Node v22.23.3 / pnpm 11.11.0で、空の専用storeからscripts有効の `pnpm install --frozen-lockfile` を実施しました。Git prepareから得た共通packageにはsrcが含まれず、build-infoは上記SHAと一致します。

- 全テスト 18件、型検査、全lint、build、文書/リポジトリ検査、pack検査が成功しました。
- production auditはcritical/high/moderate/lowすべて0件です。
- dist 14件は2回のbuildでSHA-256が一致し、異なるcheckout pathのfresh fixtureと作業cloneでも全件のbytesが一致しました。
- Vite8を使う場合の生成region行にはpackage storeのpathが入るため、そのマーカー行だけを省きます。licenseコメントと実行コードは保持します。Vite7のrepoにはこの追加処理を適用しません。

過去の段階2ローカル全体659件・実GUI5ケース（各8手順）は別の保存済み記録です。今回の数は当該repoのfresh full結果であり、繰り返し実行を合算していません。GitHub CIの結果はPRで別途確認します。

GUIの起動時固定・既定OFFの `blockEditorSourceForms` と `blockEditorDialogs` の両方、および信頼した拡張のunsandboxed読込を必要とします。旧API、ブロックのopcode/入力、raw保存形式を保持し、無変更・Cancelでは元の入力を維持します。検査した候補だけを保存し、複数入力はatomicに保存します。Schema自体の編集・動的Schema・既存候補への新規項目追加はこの段階に含みません。

ロールバックはflagをOFFにして再読込します。コードを戻す場合はconsumer→producer→共通の逆順でrevertし、manifest・lock・実解決を一体で戻します。以前の公開版 `@kubohiroya/turbowarp-cloudflare-worker@0.2.0` へ固定できます。保存形式を自動移行しません。
