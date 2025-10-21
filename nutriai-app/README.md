# NutriAI - AI-Powered Nutrition Tracking App

NutriAIは、AI技術を活用した栄養管理・健康追跡アプリケーションです。食事記録、運動管理、体調管理を一つのアプリで効率的に行えます。

## 🌟 主要機能

### 📊 **栄養管理**
- 日々のカロリー・栄養素トラッキング
- AI による食事写真からの栄養分析
- カスタム食品・レシピ管理
- 栄養目標設定と進捗確認

### 🏃‍♂️ **運動管理**
- 運動記録とカロリー消費計算
- 運動テンプレート管理
- 進捗グラフと統計

### 📈 **体調管理**
- 体重・体脂肪率などの身体測定値記録
- 健康トレンド分析
- 月次・週次レポート

### 🤖 **AI チャット**
- 栄養相談とアドバイス
- パーソナライズされた提案
- 食事・運動プランの作成

## 🛠️ 技術スタック

### **フロントエンド**
- **[Next.js 15](https://nextjs.org)** - React フレームワーク (App Router)
- **[TypeScript](https://www.typescriptlang.org)** - 型安全な開発
- **[Tailwind CSS](https://tailwindcss.com)** - ユーティリティファーストCSS
- **[Radix UI](https://www.radix-ui.com)** - アクセシブルなUI コンポーネント

### **状態管理・データフェッチング**
- **[Zustand](https://github.com/pmndrs/zustand)** - 軽量状態管理
- **[TanStack Query](https://tanstack.com/query)** - サーバー状態管理
- **[MSW](https://mswjs.io)** - API モック (開発環境)

### **開発ツール**
- **[ESLint](https://eslint.org)** - コード品質チェック
- **[Prettier](https://prettier.io)** - コードフォーマット
- **React Hook Form + Zod** - フォーム管理とバリデーション

## 🚀 セットアップ

### 前提条件
- Node.js 18.0 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd nutriai-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果の確認
npm run start
```

## 📁 プロジェクト構造

```
nutriai-app/
├── app/                    # Next.js App Router
│   ├── (routes)/          # ルートページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── features/         # 機能別コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # 共通UIコンポーネント
├── lib/                   # ライブラリとユーティリティ
│   ├── api/              # API クライアント
│   ├── msw/              # Mock Service Worker
│   └── react-query/      # React Query設定
├── stores/               # Zustand ストア
├── types/                # TypeScript型定義
└── public/               # 静的ファイル
```

## 🌐 デプロイ

### Vercel (推奨)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<repository-url>)

```bash
# Vercel CLI でのデプロイ
npm install -g vercel
vercel
```

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 🧪 テスト

```bash
# 単体テスト実行
npm run test

# E2Eテスト実行
npm run test:e2e

# テストカバレッジ
npm run test:coverage
```

## 📱 PWA 機能

- オフライン対応
- アプリインストール
- プッシュ通知 (今後実装予定)

## 🎨 デザインシステム

- モバイルファーストレスポンシブデザイン
- アクセシビリティ対応
- ダークモード対応 (今後実装予定)
- ブランドカラー: メインカラー #42B883 (ソフトグリーン)

## 🔧 開発ガイドライン

### コーディング規約
- ESLint + Prettier によるコード品質管理
- TypeScript による型安全性
- Atomic Design によるコンポーネント設計

### コミット規約
```
feat: 新機能
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📞 サポート

質問や問題がある場合は、GitHub Issues で報告してください。

---

Made with ❤️ by NutriAI Team
