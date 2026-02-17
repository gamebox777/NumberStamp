# Vercelへのデプロイ手順

このガイドでは、作成したReact (Vite) プロジェクトをVercelにデプロイする手順を説明します。

## 1. GitHubリポジトリの準備

まず、ローカルプロジェクトをGitHubリポジトリにプッシュします。

1. GitHubで新しいリポジトリを作成します（例: `NumberStamp`）。
2. ローカルプロジェクトでGitを初期化し、プッシュします。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/NumberStamp.git
git push -u origin main
```

※ `YOUR_USERNAME` はご自身のGitHubユーザー名に置き換えてください。

## 2. Vercelでのインポート

1. [Vercel dashboard](https://vercel.com/dashboard) にアクセスします。
2. **"Add New..."** ボタンをクリックし、**"Project"** を選択します。
3. GitHubアカウントを連携し、先ほど作成した `NumberStamp` リポジトリをインポートします。

## 3. デプロイ設定

VercelはViteプロジェクトを自動的に検出するため、特別な設定は通常不要です。

- **Framework Preset**: `Vite` が自動選択されていることを確認してください。
- **Root Directory**: `src` ではなくプロジェクトルート（`./`）のままでOKです。
- **Build Command**: `npm run build` （デフォルト）
- **Output Directory**: `dist` （デフォルト）
- **Install Command**: `npm install` （デフォルト）

設定を確認したら、**"Deploy"** ボタンをクリックします。

## 4. デプロイ完了

デプロイが完了すると、自動的にURL（例: `number-stamp.vercel.app`）が発行されます。
このURLにアクセスして、アプリケーションが正しく動作しているか確認してください。

## 5. ブランチ運用（推奨）

`main` ブランチを本番環境（Production）、`develop` などの他のブランチを開発環境（Preview）として運用できます。

1. **Production Branch**: Vercelの設定で `main` をProduction Branchに指定します（デフォルト設定）。
   - `main` ブランチにマージされると、自動的に本番環境へデプロイされます。

2. **Preview Branch**: `develop` などの他のブランチにプッシュすると、プレビュー環境（Preview Deployment）が作成されます。
   - 開発中の確認用として、個別のURLが発行されます（例: `number-stamp-git-develop-user.vercel.app`）。
   - Pull Requestを作成した場合も同様にプレビューが生成されます。

### 設定確認手順
もし `main` 以外がProductionになっている場合は、Vercelのプロジェクト設定から以下の手順で変更できます。
1. **Settings** > **Git** へ移動します。
2. **Production Branch** の項目で `main` を入力・選択し、Saveします。
