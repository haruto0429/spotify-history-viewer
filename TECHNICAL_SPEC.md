# Spotify履歴ダッシュボード 技術仕様書

## 1. 技術スタック

### 1.1 フロントエンド

#### コア技術
- **Vue 3**: Composition API、`<script setup>`構文を使用
- **TypeScript**: 型安全性の確保
- **Vite**: 高速なビルドツール

#### UI/スタイリング
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **Spotify風カラーパレット**: 
  - 背景: `#121212`（ダークグレー）
  - セカンダリ背景: `#181818`
  - アクセント: `#1DB954`（Spotifyグリーン）
  - テキスト: `#FFFFFF` / `#B3B3B3`
  - カード背景: `#1E1E1E`

#### グラフ・可視化
- **Chart.js**: 主要なグラフライブラリ（軽量、カスタマイズ可能）
- **vue-chartjs**: Vue 3用のChart.jsラッパー
- **または ECharts**: より高度な可視化が必要な場合

#### その他
- **date-fns**: 日付処理
- **lodash-es**: ユーティリティ関数（必要に応じて）

### 1.2 データ処理

#### クライアントサイド
- **Web Workers**: 大量データの非同期処理
- **IndexedDB**: ブラウザ側でのデータキャッシュ（将来実装）

#### API連携（将来実装）
- **Spotify Web API**: 
  - Recently Played Tracks API
  - Get Track API（ジャンル情報取得）
  - OAuth 2.0認証

### 1.3 デプロイメント

#### Firebase Hosting（推奨）
- 無料プラン: 10GB ストレージ、360MB/日転送
- 高速CDN配信
- 簡単なCI/CD設定

#### Cloudflare Pages（代替）
- 無料プラン: 無制限のリクエスト
- 自動ビルド・デプロイ
- GitHub連携

## 2. プロジェクト構造

```
spotify-history-dashboard/
├── public/
│   ├── data/                    # 初期データ（JSONファイル）
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css         # Tailwind CSS設定
│   ├── components/
│   │   ├── common/              # 共通コンポーネント
│   │   │   ├── Card.vue
│   │   │   ├── Loading.vue
│   │   │   └── FilterBar.vue
│   │   ├── dashboard/           # ダッシュボードコンポーネント
│   │   │   ├── StatsOverview.vue       # 総再生時間・回数
│   │   │   ├── ArtistRanking.vue       # アーティストランキング
│   │   │   ├── TrackRanking.vue        # 楽曲ランキング
│   │   │   ├── TimeSeriesChart.vue     # 時系列グラフ
│   │   │   ├── GenreAnalysis.vue       # ジャンル分析
│   │   │   └── PeriodHistory.vue       # 期間別履歴
│   │   └── charts/              # チャートコンポーネント
│   │       ├── LineChart.vue
│   │       ├── BarChart.vue
│   │       └── PieChart.vue
│   ├── composables/             # Composition API関数
│   │   ├── useSpotifyData.ts    # データ読み込み・処理
│   │   ├── useStatistics.ts     # 統計計算
│   │   ├── useFilters.ts        # フィルター機能
│   │   └── useSpotifyApi.ts     # Spotify API連携（将来）
│   ├── types/
│   │   └── index.ts             # TypeScript型定義
│   ├── utils/
│   │   ├── dataProcessor.ts     # データ処理ユーティリティ
│   │   ├── dateHelper.ts        # 日付処理
│   │   └── formatters.ts        # フォーマット関数
│   ├── stores/                  # Piniaストア（状態管理）
│   │   └── dataStore.ts
│   ├── App.vue
│   └── main.ts
├── .env                         # 環境変数（Spotify API設定用）
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 3. データ構造

### 3.1 入力データ形式

```typescript
// types/index.ts
export interface SpotifyHistoryItem {
  endTime: string;           // "YYYY-MM-DD HH:MM:SS"
  artistName: string;
  trackName: string;
  msPlayed: number;          // ミリ秒単位の再生時間
}

export interface SpotifyHistoryData {
  items: SpotifyHistoryItem[];
  source: string;             // ファイル名またはAPI
}
```

### 3.2 処理済みデータ構造

```typescript
export interface ProcessedData {
  totalPlays: number;
  totalTimeMs: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  artists: ArtistStats[];
  tracks: TrackStats[];
  dailyData: DailyData[];
  monthlyData: MonthlyData[];
  yearlyData: YearlyData[];
  genres: GenreStats[];
}

export interface ArtistStats {
  name: string;
  playCount: number;
  totalTimeMs: number;
  trackCount: number;
}

export interface TrackStats {
  name: string;
  artist: string;
  playCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
}

export interface DailyData {
  date: Date;
  playCount: number;
  totalTimeMs: number;
  topArtist: string;
  topTrack: string;
}

export interface GenreStats {
  name: string;
  playCount: number;
  totalTimeMs: number;
  artistCount: number;
}
```

## 4. 主要機能の実装方針

### 4.1 データ読み込み

```typescript
// composables/useSpotifyData.ts
export function useSpotifyData() {
  const loadHistoryFiles = async (): Promise<SpotifyHistoryItem[]> => {
    // 複数JSONファイルを並列読み込み
    // Web Workerで処理を分散
    // データを統合・ソート
  };
  
  const processData = (items: SpotifyHistoryItem[]): ProcessedData => {
    // 統計情報の計算
    // 期間別集計
    // ランキング生成
  };
}
```

### 4.2 状態管理（Pinia）

```typescript
// stores/dataStore.ts
export const useDataStore = defineStore('data', () => {
  const rawData = ref<SpotifyHistoryItem[]>([]);
  const processedData = ref<ProcessedData | null>(null);
  const filters = ref<DateRange | null>(null);
  
  const filteredData = computed(() => {
    // フィルター適用後のデータ
  });
  
  return { rawData, processedData, filters, filteredData };
});
```

### 4.3 グラフ表示

```typescript
// components/charts/LineChart.vue
import { Line } from 'vue-chartjs';

// Chart.jsの設定でSpotify風のスタイルを適用
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#B3B3B3' }
    }
  },
  scales: {
    x: { ticks: { color: '#B3B3B3' } },
    y: { ticks: { color: '#B3B3B3' } }
  }
};
```

## 5. デザインシステム

### 5.1 カラーパレット

```css
/* Spotify風カラーパレット */
:root {
  --bg-primary: #121212;
  --bg-secondary: #181818;
  --bg-tertiary: #1E1E1E;
  --accent-green: #1DB954;
  --text-primary: #FFFFFF;
  --text-secondary: #B3B3B3;
  --text-muted: #6A6A6A;
  --border-color: #2A2A2A;
}
```

### 5.2 コンポーネントスタイル

- **カード**: 角丸（8px）、影、ホバーエフェクト
- **ボタン**: Spotifyグリーンのアクセント、滑らかなトランジション
- **グラフ**: ダーク背景、グリーンアクセントカラー
- **ランキング**: 番号バッジ、プログレスバー

## 6. パフォーマンス最適化

### 6.1 データ処理の最適化
- Web Workerで大量データ処理を非同期化
- 仮想スクロール（大量ランキング表示時）
- メモ化（computed、useMemo）

### 6.2 レンダリング最適化
- コンポーネントの遅延読み込み（lazy loading）
- グラフの再描画最適化
- 画像・アセットの最適化

## 7. デプロイ設定

### 7.1 Firebase Hosting設定

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 7.2 Cloudflare Pages設定

```yaml
# .cloudflare/pages.yaml
build_command: npm run build
build_output_dir: dist
```

## 8. 今後の拡張計画

### Phase 4: Spotify API連携
- OAuth 2.0認証フロー
- Recently Played Tracks API実装
- 自動データ同期（バックグラウンド処理）
- リアルタイム更新UI

### Phase 5: 高度な機能
- プレイリスト分析
- 音楽トレンド予測
- 他ユーザーとの比較（匿名化）
- エクスポート機能（CSV、PDF）

## 9. セキュリティ考慮事項

- Spotify API認証情報の安全な管理（環境変数）
- CORS設定
- データのローカル保存時のプライバシー保護

