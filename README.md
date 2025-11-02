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
- **Firebase Hosting / Cloudflare Pages** - 無料ホスティング

## 📋 ドキュメント

- [要件定義書](./REQUIREMENTS.md)
- [技術仕様書](./TECHNICAL_SPEC.md)

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 📁 プロジェクト構造

```
├── public/data/          # Spotify履歴データ（JSONファイル）
├── src/
│   ├── components/       # Vueコンポーネント
│   ├── composables/      # Composition API関数
│   ├── stores/           # Piniaストア
│   └── utils/            # ユーティリティ関数
└── ...
```

## 🎨 デザイン

- ダークモード専用
- Spotify風のデザイン（グリーンアクセント）
- レスポンシブデザイン対応

## 📝 ライセンス

MIT

