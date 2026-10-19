# 固定入力の編集

S3-4のローカル実装です。対応GUIの固定入力機能は既定OFFです。旧GUI・API無し・固定入力機能OFFではブロックの従来動作を保ちます。`getInfo()` に存在する対象opcodeだけ登録し、再取得・APIの置換・拡張の`dispose()`・runtimeの破棄に対応します。既存SOURCEエディターとopcodeは分離しています。

|ブロックopcode|引数|UI|
|---|---|---|
|`createHandlerIr`|`METHOD`|既定値からの選択：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`|
|`createProtectedRouteIr`|`METHOD`|既定値からの選択：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`, `*`|
|`createProtectedRouteIr`|`ON_UNAUTHENTICATED`|既定値からの選択：`redirect-login`, `json-401`, `forbid-403`|
|`createBearerRouteIr`|`METHOD`|既定値からの選択：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`, `*`|
|`createBearerRoleRouteIr`|`METHOD`|既定値からの選択：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`, `*`|
|`createBearerScopeRouteIr`|`METHOD`|既定値からの選択：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`, `*`|

数値の新規入力は、空白を除いた完全な有限JSON数値トークンを受け付け、指数表記・負のゼロ・表記を保持します。空文字、16進表記、先頭の`+`、先頭ゼロや未完成トークンは新規保存しません。既存値は開いただけで書き換えません。既存の有限数値別表記は参照用に投影し、未編集の生値を保ちます。未知の旧enum値も無操作では保存し直しません。

`METHOD` は前後空白を除いて大文字化します。`createHandlerIr` に `*` はありません。認証失敗時の動作は既存の `schemas/protected-routes.schema.json` の enum を参照し、旧Schemaの `$id` と既存データを維持します。

reporter接続は読取専用で、実行・置換しません。新しい選択や数値を保存するときだけ純粋codecとSchemaで検証します。検証失敗時は全変更を拒否し、ブロックや接続を部分的に書き換えません。

正本は本ownerの `schemas/block-editor-fixed-inputs.schema.json`、TSモジュールは選択・参照用、`dist`は生成物です。外部候補取得や実行時Schema生成は行いません。

切戻しはGUIの固定入力機能OFFで行えます。既存のプロジェクト形式・opcode・メニュー・defaultValue・実行時の処理は維持します。
