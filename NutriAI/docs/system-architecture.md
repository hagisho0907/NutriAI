# NutriAI システム構成図

## 1. 全体構成
```mermaid
flowchart TD
    User((ユーザー)) -->|操作| PWA[Webクライアント<br/>React/Next.js PWA]
    subgraph Client[PWAクライアント]
        UI[UIレイヤー<br/>Atomic Design]
        DataLayer[Data Provider<br/>(モック/本番切替)]
        Cache[Service Worker<br/>IndexedDB]
    end
    PWA --> UI
    UI --> DataLayer
    DataLayer --> MockAPI{{Mock API Server<br/>MSW / Next.js API Routes}}
    DataLayer -. API切替 .-> BFF[BFF / API Gateway]
    subgraph Backend[将来のサーバサイド]
        BFF --> RESTAPI[REST API<br/>FastAPI or Node]
        RESTAPI --> DB[(PostgreSQL)]
        RESTAPI --> Storage[(Object Storage)]
        RESTAPI --> Event[Event Queue<br/>(SQS/Cloud Tasks)]
        Event --> Vision[Vision推定サービス]
        Event --> LLM[LLMオーケストレーター]
        RESTAPI --> Analytics[(DWH/BI)]
    end
    Vision --> Storage
    LLM --> RESTAPI
    Analytics --> BI[BIダッシュボード]
```

## 2. フェーズ別構成
- **Phase 0 (現行モック)**: PWAがブラウザ内でMSWを通じモックデータを取得。IndexedDBにローカルキャッシュを保持し、画像アップロード・AI推定はスタブ関数で即時レスポンス。
- **Phase 1 (API導入)**: VercelなどのPaaSにデプロイしたBFFがフロントからのリクエストを受け、REST API/LLM/画像解析マイクロサービスへ振り分ける。モックとのインターフェースは同一定義。
- **Phase 2 (マルチクライアント)**: Flutterアプリ、将来的な外部連携(API)がBFFを経由。GraphQLゲートウェイやリアルタイムチャネル(SSE/WebSocket)を追加。

## 3. データフロー
1. ユーザーが食事を登録 → PWAが画像/補足テキストを`DataProvider`経由で送信。
2. モック環境ではローカルでAI推定JSONを返し即時登録。本番環境ではBFF→REST API→イベントキューに投入。
3. 画像はオブジェクトストレージへ保存。Visionサービスがマクロ推定を実施し`ai_inferences`に結果を記録。
4. REST APIが`daily_summaries`を更新し、ユーザーのダッシュボードに反映。
5. チャットは将来的にSSEでストリーミング返却。モックではプリセット文を即時返却。

## 4. インフラ構成案
- **PWA**: Vercel/Netlifyでホスティング。Service Workerでオフラインキャッシュと通知基盤を整備。
- **BFF/REST API**: AWS Fargate or Cloud Run。CI/CDはGitHub Actionsで自動デプロイ。
- **DB**: Amazon RDS (PostgreSQL)。開発時はSupabaseやNeonでマネージド環境利用。
- **オブジェクトストレージ**: Amazon S3。食事写真・AI推論ファイルを保存。
- **LLM/Vision**: 外部API(OpenAI, Azure OpenAI, Google Vertex)をオーケストレーションサービス経由で呼び出す。
- **監視**: CloudWatch/Datadogでメトリクスを収集。フロントはSentryでエラートラッキング。

## 5. セキュリティ・運用
- 認証はOAuth/OIDC。アクセストークン検証はBFFで実施し、下流サービスにはユーザーIDのみ伝播。
- 画像アップロードは署名付きURLで直接ストレージに保存し、BFFはメタデータのみ処理。
- バックエンドはゼロトラスト構成を意識し、LLM呼び出しのリトライ/タイムアウトを制御する。
- 個人データ暗号化: データベース透過暗号化＋アプリ層のフィールドレベル暗号化(体脂肪率など)。
- バックアップ: DBは毎日スナップショット。ストレージはバージョニングを有効化。

## 6. モック環境の実装メモ
- MSWを使いブラウザ内でAPIモック。`/mock/api/v1/*`を捕捉し、OpenAPI契約に沿ったレスポンスを返す。
- LLM/画像APIはフロント内で`Promise`を使ったダミー処理。レスポンス遅延やエラーをスイッチで制御。
- E2EテストはPlaywrightでモックサーバを利用しながらUIフローを検証。後日CIで実API版を追加。

