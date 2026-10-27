# Cloudflare Workerの最小デモ

- 配布: [`generate-hello-worker.sb3`](https://kubohiroya.github.io/turbowarp-cloudflare-worker/samples/generate-hello-worker.sb3)
- 起動: [TurboWarp Editor](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-cloudflare-worker%2Fsamples%2Fgenerate-hello-worker.sb3)
- 操作: **Allow**で読み込みを許可し、緑の旗を押します。
- 内容: `createHandlerIr`・`createWorkerIr`・`generateFilesJson`でGET /hello用ファイルを生成
- 期待結果: GET /hello generatedとHello response generatedが両方trueになります。生成された全ファイルはGenerated files JSON変数に保存されます。

`manifest.json`に拡張ID・JSパス・sandbox条件・期待結果を記録しています。
`generate-hello-worker/project.json`と自作SVGを編集し、次のコマンドで再生成します。

```bash
pnpm run samples:build
pnpm run samples:check
pnpm run pages:build
```

Node.jsは`.nvmrc`指定版を使います。サンプル生成に追加依存はありません。
生成したSB3もコミットし、`_site/`のdocs・dist・SB3をPagesへ公開します。
unsandboxed拡張は検証対象JSをSB3へ同梱し、利用者が通常の同意画面で許可します。
sandbox互換の拡張はPages上のJSを参照します。

緑の旗で毎回入力から結果を生成します。停止してから再実行できます。

切戻しはサンプル・READMEリンク・Pages配信設定の追加をrevertします。

このデモはコード生成までを確認します。Cloudflareへのデプロイや認証は行いません。生成JSON全体を確認するには、変数パレットの`Generated files JSON`を表示するか、変数ブロックをクリックします。
