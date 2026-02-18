# スクリーンショット・ツール

このプロジェクトには、アプリの現在の状態を自動で撮影し、ドキュメント用の画像を生成するツールが含まれています。

## 前提条件

- 開発サーバーが起動していること
  ```bash
  npm run dev
  ```
  （デフォルトで `http://localhost:5173` で起動していることを想定しています）

## セットアップ手順

このツールを使用する前に、依存関係とPlaywright用のブラウザバイナリをインストールする必要があります。

1. 依存関係のインストール:
   ```bash
   npm install
   ```
   (プロジェクトの依存関係には `playwright` が含まれています)

2. Playwrightブラウザのインストール:
   ```bash
   npx playwright install
   ```
   ※ この手順を省略すると、実行時に `browserType.launch: Executable doesn't exist` というエラーが発生します。

## 実行方法

新しいターミナルを開き、以下のコマンドを実行してください。

```bash
npm run capture
```

## 生成されるファイル

以下のディレクトリに画像が保存されます。

`docs/images/`

- `app_overview.png`: アプリ全体のスクリーンショット
- `toolbar.png`: 左側ツールバー周辺
- `settings_panel.png`: 右側設定パネル周辺

## 設定の変更

撮影範囲や保存先を変更したい場合は、以下のファイルを編集してください。

`scripts/capture_screenshots.cjs`
