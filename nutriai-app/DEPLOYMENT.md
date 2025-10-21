# NutriAI Deployment Guide

## Vercel Deployment

### 準備完了済み ✅

このアプリケーションは以下の設定でVercelへのデプロイが準備されています：

- ✅ Next.js App Router対応
- ✅ TypeScript型定義完備
- ✅ Zustandによる状態管理
- ✅ MSWによるAPI モック
- ✅ React Queryによるデータフェッチング
- ✅ ビルドエラー修正済み
- ✅ PWAマニフェスト設定済み

### デプロイ手順

1. **Vercelアカウントの準備**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **プロジェクトのデプロイ**
   ```bash
   cd nutriai-app
   vercel
   ```

3. **環境変数の設定**
   Vercelダッシュボードで以下の環境変数を設定：
   ```
   NEXT_PUBLIC_USE_MOCK_API=true
   NEXT_PUBLIC_API_BASE_URL=https://api.nutriai.app
   NEXT_PUBLIC_API_TIMEOUT=10000
   NEXT_PUBLIC_API_RETRIES=3
   ```

### 設定ファイル

#### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["hnd1"],
  "headers": [
    {
      "source": "/mockServiceWorker.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ],
  "env": {
    "NEXT_PUBLIC_USE_MOCK_API": "true"
  }
}
```

### ビルド確認

```bash
npm run build
npm run start
```

### 主要機能

- 📱 **レスポンシブデザイン**: モバイルファースト設計
- 🔄 **オフライン対応**: Service Workerによるキャッシュ
- 🎯 **型安全**: 完全なTypeScript対応
- 🚀 **高速**: Next.js App RouterとReact Query最適化
- 📊 **データ管理**: ZustandとReact Queryの組み合わせ
- 🧪 **開発体験**: MSWによるAPI モック

### トラブルシューティング

#### ビルドエラーが発生する場合
```bash
npm run lint:fix
npm run type-check
npm run build
```

#### MSWが動作しない場合
- `/public/mockServiceWorker.js`が存在することを確認
- ブラウザのService Workerが正しく登録されていることを確認

#### 環境変数が反映されない場合
- `NEXT_PUBLIC_`プレフィックスが付いていることを確認
- Vercelダッシュボードで設定後、再デプロイを実行

### パフォーマンス

- ⚡ **Core Web Vitals**: 最適化済み
- 📦 **Bundle Size**: コード分割とTree Shaking
- 🎨 **CSS**: Tailwind CSS最適化
- 🖼️ **Images**: Next.js Image最適化

### セキュリティ

- 🔐 **認証**: JWT トークンベース
- 🛡️ **XSS対策**: Next.jsビルトイン保護
- 🔒 **HTTPS**: Vercel自動SSL

### 今後の拡張

1. **リアルAPI統合**: MSWからリアルAPIへの切り替え
2. **プッシュ通知**: Web Push API実装
3. **オフライン同期**: IndexedDBとの同期機能
4. **A/Bテスト**: Vercel Edge Functions活用

### サポート

問題が発生した場合は、以下を確認してください：
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- プロジェクトの`README.md`