# NutriAI コンポーネント設計書

## 1. コンポーネント構成概要
- アプリはAtomic Designに準拠し、`foundation`(Atoms/Molecules)、`layout`、`features`の3レイヤーで構成する。
- ルーティングはReact Router(Next.js利用時はApp Router)で管理し、AppShell配下でタブナビゲーションとモーダルスタックを制御する。
- データ取得は`DataProvider`を介し、モック/本番APIを差し替え可能とする。状態同期はReact Query + Zustand(軽量グローバルステート)を想定。

## 2. 主要コンポーネント相関図
```mermaid
flowchart TD
    AppShell[AppShell] --> AuthGuard[AuthGuard]
    AuthGuard --> Router[Route Switch]
    Router --> DashboardPage[DashboardPage (SCR-03)]
    Router --> MealPage[MealLogPage (SCR-04)]
    Router --> BarcodePage[BarcodeSearchPage (SCR-05)]
    Router --> ExercisePage[ExerciseLogPage (SCR-06)]
    Router --> AnalyticsPage[AnalyticsPage (SCR-07)]
    Router --> ChatPage[ChatPage (SCR-08)]
    Router --> GoalWizard[GoalWizard (SCR-02)]
    DashboardPage --> SummaryCard[SummaryCard]
    DashboardPage --> TaskList[TaskList]
    MealPage --> PhotoCapture[PhotoCapture]
    MealPage --> MacroAdjuster[MacroAdjuster]
    BarcodePage --> BarcodeScanner[BarcodeScanner]
    ExercisePage --> ExerciseForm[ExerciseForm]
    AnalyticsPage --> Charts[Charts]
    ChatPage --> ChatComposer[ChatComposer]
    ChatPage --> ChatTimeline[ChatTimeline]
    subgraph Services[サービスレイヤー]
        DataProvider[DataProvider]
        MockProvider[MockDataProvider]
        ApiProvider[RestDataProvider]
        AIService[AI Service Hooks]
    end
    SummaryCard --> DataProvider
    TaskList --> DataProvider
    PhotoCapture --> AIService
    MacroAdjuster --> DataProvider
    BarcodeScanner --> DataProvider
    ExerciseForm --> DataProvider
    Charts --> DataProvider
    ChatTimeline --> AIService
    DataProvider --> MockProvider
    DataProvider --> ApiProvider
```

## 3. レイヤー別役割
- **foundation**: カラーパレット、ボタン、入力フィールド、カード等のUI規約を担う。Storybookで単体検証しテーマ切替を容易にする。
- **layout**: `AppShell`, `TabNavigator`, `ModalHost`など、レイアウトとレスポンシブ制御を担当。Service Workerのオンライン/オフライン状態バナーもここでハンドリング。
- **features**: 各画面に対応するFeatureスライス。`features/dashboard`, `features/meals`などでHooks・コンテキスト・モジュール境界を定義する。
- **services**: API呼び出し、モック切替、AI推定スタブを提供。OpenAPIスキーマから型生成し、`useXxxQuery`/`useXxxMutation`で利用。

## 4. モック→本番切替フロー
1. `AppShell`で`<DataProviderContext value={mockAdapter}>`を注入し、PWAモードでモックデータを利用。
2. 実API接続時は環境変数またはFeature Flagで`restAdapter`へ差し替え。コンポーネント側は依存注入された`useAppServices`経由でアクセスするため変更不要。
3. 画像アップロードやAI推定は`AIService`フックを通じて処理。モック期間はPromiseで即時解決、API導入時はBFFエンドポイントを呼び出す。

## 5. 将来拡張ポイント
- Flutter導入時は`DataProvider`契約を共有し、コンポーネント単位でBFFレスポンスに依存しない形へ整理する。
- LLMのストリーミング回答に対応するため、`ChatTimeline`をSSE/WebSocket対応コンポーネントに置換可能なインターフェースにする。
- PWAのプッシュ通知を扱う`NotificationCenter`コンポーネントをlayout層に追加し、モバイルアプリでも再利用する。

