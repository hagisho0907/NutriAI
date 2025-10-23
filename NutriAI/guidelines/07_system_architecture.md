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
- **Phase 1 (API導入)**: フロントエンドはVercel上にホスティングしたNext.js PWAを採用。バックエンドはSupabase(Edge Functions + Postgres + Storage + Auth)を中心に構成し、Edge FunctionがBFFとしてLLM/画像解析APIを呼び出す。モックとのインターフェースは同一定義。
- **Phase 2 (マルチクライアント)**: Flutterアプリ、将来的な外部連携(API)がBFFを経由。GraphQLゲートウェイやリアルタイムチャネル(SSE/WebSocket)を追加。

## 3. データフロー
1. ユーザーが食事を登録 → PWAが画像/補足テキストを`DataProvider`経由で送信。
2. モック環境ではローカルでAI推定JSONを返し即時登録。本番環境ではBFF→REST API→イベントキューに投入。
3. 画像はオブジェクトストレージへ保存。Visionサービスがマクロ推定を実施し`ai_inferences`に結果を記録。
4. REST APIが`daily_summaries`を更新し、ユーザーのダッシュボードに反映。
5. チャットは将来的にSSEでストリーミング返却。モックではプリセット文を即時返却。

## 4. インフラ構成案
- **PWA**: Vercelでホスティング。Preview/ProductionをGitHub連携で自動デプロイし、Service Workerでオフラインキャッシュと通知基盤を整備。
- **BFF/Edge Functions**: Supabase Edge Functions(Deno)でBFFロジックを提供し、LLM・画像推定など外部APIへの接続を集約。環境変数とFeature FlagをSupabase側で管理。
- **DB**: Supabase Postgres(マネージドPostgreSQL)。RLSでユーザー毎アクセス制御を実施し、スキーマは`supabase/db`配下でマイグレーション管理。
- **オブジェクトストレージ**: Supabase Storage。食事写真を署名付きURL経由でアップロードし、一定期間後にクリーンアップを実施。
- **LLM/Vision**: LLMはOpenAI GPT-4o miniとAnthropic Claude Haikuを用途別に使い分ける。画像推定はGoogle Gemini 2.5 Flash-Liteを第一候補とし、フォールバックとしてモック推定を保持。Geminiからの構造化レスポンスを解析して栄養データ補完ロジックに接続する。
- **監視**: フロントはVercel Analytics + Sentry、Supabaseはログ・pg_stat_statementsで監視。必要に応じてLogflare/Datadog連携を検討。

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

## 7. LLM・画像推定サービス方針
- **LLM選定**: コストとレスポンス品質のバランスから、相談チャットや目標提案はOpenAI GPT-4o miniを基本とし、長文回答や日本語の自然さを優先するケースではAnthropic Claude Haikuを併用する。Edge Functionから直接呼び出し、応答内容は`ai_inferences`に保存。
- **画像推定**: 食事写真のマクロ推定はGemini 2.5 Flash-Liteに画像＋補足文を同時投入して実施する。Geminiの生成結果はJSON形式（食品候補、栄養推定、信頼度）で返させ、NutriAI側で食材辞書・過去データと突合して補正処理を行う。Gemini障害時やレート超過時はモック推定(フロント/サーバ共通ロジック)にフェイルオーバーし、ユーザーには fallback モードを表示する。将来的には別モデル（LogMeal等）への切り替えもFeature Flagで制御可能にする。
- **コスト管理**: Geminiはトークン課金のため、Edge Function/BFFでユーザーごとの日次・月次クォータを監視し、呼び出し回数・レスポンスサイズをSupabaseに記録。利用上限を超える前に警告通知とモック切り替えを行う。料金状況はGoogle CloudのBilling APIとダッシュボードでモニタリング。
- **コスト管理**: LLM/画像APIの呼び出し回数をログ化し、ユーザー当たりのクォータ制御をEdge Functionで実装。定期的にAPI利用料金を監視し、閾値超過前にプラン変更やモデル切り替えを判断する。
