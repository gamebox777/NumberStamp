# Git/GitHub よく使うコマンド集

## developブランチの内容をmainに反映させる手順

開発作業が完了し、`develop`ブランチの内容を本番環境用の`main`ブランチに反映させる手順です。

1. **mainブランチに切り替える**
   ```bash
   git checkout main
   ```

2. **最新のmainブランチの状態を取得する** (チーム開発などで更新がある可能性がある場合)
   ```bash
   git pull origin main
   ```

3. **developブランチの内容をmainにマージ（統合）する**
   ```bash
   git merge develop
   ```

4. **変更をGitHub（リモートリポジトリ）に反映させる**
   ```bash
   git push origin main
   ```

その後、開発を続ける場合は `develop` ブランチに戻ります。
```bash
git checkout develop
```

---

## その他のよく使うコマンド

### 基本操作

- **現状の確認** (変更されたファイルなどを確認)
  ```bash
  git status
  ```

- **変更履歴の確認**
  ```bash
  git log --oneline --graph --all
  ```

### ブランチ操作

- **ブランチの一覧表示**
  ```bash
  git branch -a
  ```

- **新しいブランチを作成して切り替える**
  ```bash
  git checkout -b <新しいブランチ名>
  ```
  既存のブランチへの切り替えは `git checkout <ブランチ名>` です。

- **ブランチを削除する** (マージ済みの場合)
  ```bash
  git branch -d <ブランチ名>
  ```

### 変更の保存流れ

1. **変更をステージングエリアに追加** (コミットする準備)
   ```bash
   git add .
   ```
   ※ `.` は全ての変更を追加する場合。特定のファイルだけなら `git add <ファイル名>`

2. **変更をコミット** (メッセージ付きで保存)
   ```bash
   git commit -m "機能追加: 〇〇機能の実装"
   ```

### GitHubとの連携

- **プッシュ** (ローカルの変更をGitHubへ送信)
  ```bash
  git push origin <現在のブランチ名>
  ```

- **プル** (GitHubの変更をローカルに取り込み)
  ```bash
  git pull origin <現在のブランチ名>
  ```

### 取り消し・修正

- **直前のコミットを取り消す** (変更内容は作業ディレクトリに残す - soft reset)
  ```bash
  git reset --soft HEAD^
  ```

- **特定のファイルの変更を元に戻す** (最終コミットの状態に戻す)
  ```bash
  git checkout -- <ファイル名>
  ```
