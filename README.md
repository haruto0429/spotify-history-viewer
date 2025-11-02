# Spotify履歴ダッシュボード

Spotifyの再生履歴データを可視化・分析するためのオシャレなダッシュボードアプリケーションです。

## 🎯 機能

- **総再生時間・再生回数表示** - 全期間の統計情報
- **アーティスト・楽曲ランキング** - 再生回数によるTOPランキング
- **日付・月・年ごとの再生履歴** - 期間別の詳細な分析
- **時系列グラフ** - 再生傾向の視覚化
- **ジャンル分析** - ジャンル別の再生傾向

## 🛠️ 技術スタック

- **Vue 3** + **TypeScript** - モダンなフロントエンドフレームワーク
- **Vite** - 高速なビルドツール
- **Tailwind CSS** - ユーティリティファーストのスタイリング
- **Chart.js** - グラフ・可視化ライブラリ
- **Pinia** - 状態管理
- **Firebase Hosting / Cloudflare Pages** - 無料ホスティング

## 📋 ドキュメント

- [要件定義書](./REQUIREMENTS.md)
- [技術仕様書](./TECHNICAL_SPEC.md)

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データファイルの配置

`spotifyHistoryData`フォルダ内のJSONファイルを`public/data/`に配置してください。
または、シンボリックリンクを作成：

```bash
ln -s /Users/nakajiyuuto/Documents/spotify/spotifyHistoryData public/data
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### 4. ビルド

```bash
npm run build
```

ビルド結果は`dist`フォルダに出力されます。

### 5. プレビュー

```bash
npm run preview
```

## 📁 プロジェクト構造

```
├── public/
│   └── data/              # Spotify履歴データ（JSONファイル）
├── src/
│   ├── assets/
│   │   └── styles/        # グローバルスタイル
│   ├── components/        # Vueコンポーネント
│   ├── composables/       # Composition API関数
│   ├── stores/            # Piniaストア
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   ├── views/             # ページコンポーネント
│   ├── router/            # Vue Router設定
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 デザイン

- ダークモード専用
- Spotify風のデザイン（グリーンアクセント）
- レスポンシブデザイン対応

## 📝 ライセンス

MIT

