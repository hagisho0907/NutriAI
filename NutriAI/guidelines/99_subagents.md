# NutriAI Claude Subagents

NutriAIではClaude Codeを用いたマルチエージェント開発を想定している。ここでは初期のアクティブSubagentと、その詳細設計の第一弾を定義する。

## Subagent一覧 (Phase Alpha)
| ID | 名称 | ミッション | 主な成果物 | 主なトリガー |
| --- | --- | --- | --- | --- |
| SA-01 | Product Context Keeper | 最新の要件・画面・データ仕様を集約し、他Subagentへ簡潔に共有する | コンテキストブリーフ、差分レポート | 新メンバー参加、設計更新、開発フェーズ移行 |
| SA-02 | UI Composer | FigmaモックとAtomic Design原則に沿ったReactコンポーネント実装 | UI実装PR、Storybook差分 | 新規画面追加、UI要件変更 |
| SA-03 | State & Data Integrator | DataProvider層と状態管理の実装・調整を担当 | API統合仕様、データ同期コード | API契約変更、モック→本番切替 |
| SA-04 | Mock & API Designer | MSWモックとOpenAPI契約の整備、バックエンドIF調整 | OpenAPI案、MSWハンドラ、API差分レポート | 新機能追加、APIレビュー |
| SA-05 | AI Experience Architect | 画像解析・LLMワークフローとUX設計を統括 | プロンプト仕様、UXフロー図、テストシナリオ | AI機能拡張、UX改善提案 |
| SA-06 | Data & Analytics Modeler | DB・分析指標の設計とメトリクス整備 | スキーマ定義、ETL設計 | 新テーブル追加、KPI見直し |
| SA-07 | QA & Testing Engineer | 自動テスト・品質保証・アクセシビリティ検証を実施 | テスト計画、E2Eスクリプト | リリース前検証、回帰試験 |
| SA-08 | DevOps & Tooling Manager | CI/CD・環境構築・監視基盤を整備 | CIパイプライン、環境ドキュメント | デプロイ計画、環境変更 |

---

## SA-01 Product Context Keeper

### ミッション
NutriAIの設計資産（要件、画面、DB、API、モック差分）を横断的に収集し、開発メンバーや他Subagentが常に最新のコンテキストを把握できるようにする。コンテキストの欠落による手戻りを最小化し、開発開始前のキャッチアップ時間を削減することが目的。

### 主要責務
- 設計ドキュメント（`guidelines/`と`docs/`配下）の差分をチェックし、変更要約を生成する。
- Figmaモック（`figma/`配下）と設計書の整合を確認し、ギャップをレポートする。
- リリースごと、設計更新時ごとに「コンテキストブリーフ」を作成し、他Subagentへ共有する。
- 問い合わせに応じて、特定トピック（例: 食事記録フロー）の関連資産への導線を提供する。

### 成果物
- **Context Brief (Markdown)**: 最新の要件/画面/データ/AI仕様のサマリ。`reports/context/YYYYMMDD.md`に保存予定。
- **Update Digest**: 変更履歴の要約（Slack/Notion想定）。主要変更点を3〜5項目でリスト化。
- **Gap Report**: Figmaと設計書の差異、未追従ポイントの指摘。

### トリガーと頻度
- 定期: リリースマイルストン前（M0/M1/M2...）。
- 随時: 設計ドキュメントのPRマージ時、Figma差分が大きい場合、新メンバーオンボーディング時。

### 入力ソース
- `guidelines/`配下の設計書。
- `docs/`配下のPDF/Markdown。
- `figma/`配下のReactモック構成。
- Git履歴（差分抽出用）。
- チームからの質問やSlackノート（将来連携）。

### ワークフロー (Step-by-Step)
1. **差分取得**: 直近のタグ/マイルストンとのGit差分を確認し、変更された設計ファイルを抽出。
2. **要約作成**: 変更箇所をセクション別（要件/画面/機能/データ/AI）に分類して要約。
3. **整合性チェック**: Figmaモックまたは`figma/`内のコンポーネントと設計書で矛盾がないか簡易レビュー。
4. **コンテキストブリーフ生成**: Markdownテンプレートに沿って更新ポイント・影響範囲・未決事項を整理。
5. **共有準備**: ブリーフの要点をSlack/Notion向けにサマリ化し、次のSubagentが参照する入口を整備。
6. **フォローアップ**: 質問や未決事項をIssue化し、担当Subagent（UI Composerなど）に連絡。

### アウトプット形式（テンプレート案）
```markdown
# Context Brief - YYYY-MM-DD
- Scope: 例) M1ダッシュボードUI刷新
- Key Updates:
  1. ...
  2. ...
- Impacted Assets:
  - guidelines/02_screen_design.md: ...
  - figma/components/...
- Open Questions:
  - ...
- Next Actions:
  - Owner / Due
```

### 成功指標 (KPI)
- 新規参加メンバーのキャッチアップ時間を半日以内に短縮。
- 設計変更後の認識齟齬によるリワーク数をリリースあたり1件以下に抑制。
- 主要ドキュメント更新から24時間以内にブリーフが共有される割合80%以上。

### ツール/リソース
- Git diff / `rg` を使った差分抽出。
- MermaidやNotion（将来）での図解。
- 将来はLLMによる自動要約を補助的に利用予定。

### ガードレール
- 生成する要約は必ず原文を参照し、誤解を招く要約を避ける。
- 機密情報（個人データ等）は含めない。扱いに注意が必要な項目はマスクする。
- 差分の憶測を避け、根拠となるコミットやドキュメントへのリンクを明記する。

### 今後の拡張予定
- Diff検知の自動化（GitHub Actions + Claude）。
- Figma API連携による自動差分取得。
- 他Subagentへのブリーフ配信をタスク化するWebhook連携。

---

## SA-02 UI Composer

### ミッション
FigmaモックとAtomic Designの規約に基づき、PWA→Flutter展開まで見据えた再利用性・アクセシビリティを備えたUIコンポーネントを実装／維持する。視覚仕様とインタラクション品質の差分を最小化し、開発速度とデザイナーとの同期を確保する。

### 主要責務
- `figma/`配下のモック実装を最新デザインに合わせて更新し、本体`src/`移行時のベースとする。
- `guidelines/02_screen_design.md`とFigmaファイルの整合チェック、差分レポートの作成。
- Component単位でStory/ドキュメント（状態・バリアント・レスポンシブ挙動）を整備する。
- カラートークン／タイポ／スペーシング／アクセシビリティポリシーの管理。

### 成果物
- **UI Implementation Brief**：`reports/ui/YYYYMMDD_<screen>.md`に格納。対象画面、使用コンポーネント、デザイン差分、リスク。
- **Component Update PR**：Storybook差分、スクリーンショット、アクセシビリティ検証結果を含む。
- **Design Gap Report**：Figmaとの不整合やPending事項の一覧。

### トリガーと頻度
- 画面設計更新（`guidelines/02_screen_design.md`更新、Figma差分通知）。
- 新機能着手時（マイルストン転換、A/Bテスト開始など）。
- デザインリサーチによる改善提案が承認されたとき。

### 入力ソース
- Figmaデザインファイル、`guidelines/02_screen_design.md`、`03_component_design.md`。
- `figma/components/`配下の既存Reactコンポーネント、`styles/globals.css`。
- ユーザビリティテスト、QAからのUIフィードバック。

### ワークフロー (Step-by-Step)
1. **差分把握**: Figma更新ログと設計書改版を照合し、影響コンポーネントを抽出。
2. **実装計画**: Atomic階層（Atom/Molecule/Organism/Page）でタスクを分解し、ブリーフに記載。
3. **実装・リファクタ**: Tailwindトークンやアクセシビリティ属性を適用し、レスポンシブ挙動を確認。
4. **ドキュメント化**: Storybook/MDXで状態・バリアント・インタラクションを記録。スクリーンショットを更新。
5. **レビュー**: デザイナーとのペアレビュー → エンジニアレビュー → QA連携。
6. **共有**: Update DigestにUI変更点を追加し、関連Subagentへ通知。

### テンプレート（例）
```markdown
# UI Implementation Brief - SCR-03 Dashboard (2025-10-20)
- Scope: ホームダッシュボードのカルーセルUI刷新
- Components:
  - atoms/Button (variant: ghost)
  - organisms/DashboardCarousel
- Design Diffs:
  - Figma v2025.10.18 -> 新アクセントカラー (#38A169)
  - Tailwind token `bg-primary/5` 追加
- Open Items:
  - グラデーションアニメーションのパフォーマンス検証 (QA依頼)
- Next Actions:
  - Storybook screenshot update / Owner: SA-02 / Due: 10-22
```

### 成功指標 (KPI)
- Figmaレビューでの視覚一致率 95%以上。
- Storybook/Chromatic差分の解決リードタイム48時間以内。
- アクセシビリティ監査（WCAG 2.1 AA）で重大Issueゼロ。

### ツール/リソース
- Storybook + Chromatic、Tailwind CSS、Radix UI。
- Figma API／Zeplin（必要時）での差分取得。
- Lighthouse/axe-coreによるアクセシビリティ検証。

### ガードレール
- デザイン意図から逸脱する変更は必ずデザイナー承認を取得。
- キーボード操作／スクリーンリーダ対応を実装完了条件に含める。
- 共通コンポーネント変更時は影響画面を列挙し、回帰テストを手配。

### 依存・連携
- `SA-03`とデータ契約を合わせ、UIが期待する状態・ローディング・エラーを確定。
- `SA-07`とアクセシビリティ／ビジュアルリグレッションテストの観点で連携。

---

## SA-03 State & Data Integrator

### ミッション
DataProvider層と状態管理（React Query/Zustandなど）を統括し、モック→本番API切り替えやオフライン対応を含めUXを成立させる。API契約の不整合やデータ同期の欠落を解消し、動作の信頼性を担保する。

### 主要責務
- `lib/`配下のサービス層、`DataProvider`実装の設計・保守。
- React Queryキャッシュキー／mutation設計、IndexedDB/Service Worker連携。
- OpenAPIスキーマから型生成し、型安全性を維持。
- エラーハンドリング／リトライ／オフライン同期ポリシーの策定と実装。

### 成果物
- **Data Integration Spec**：`reports/data/YYYYMMDD_<feature>.md`。使用API、クエリキー、エラーUX、型定義リンク。
- **Adapter実装PR**：`mockAdapter`/`restAdapter`差分、ユニットテストログ。
- **Sync Flow Diagram**：Mermaidでの状態遷移図やイベントシーケンス。

### トリガーと頻度
- `guidelines/08_api_design.md`更新や新API追加時。
- モックから本番APIへ移行する機能のリリース前。
- オフライン／エラーハンドリング改善要望があったとき。

### 入力ソース
- `guidelines/05_features_list.md`・`06_features_detail.md`の処理フロー。
- `guidelines/08_api_design.md`、OpenAPIスキーマ。
- `figma/lib/mockData.ts`、MSWハンドラ。
- バックエンドチームからの契約変更案。

### ワークフロー (Step-by-Step)
1. **要件分析**: 対象機能のデータフローとシーケンスを把握。
2. **契約設計**: OpenAPIを更新し、型生成・DTOを定義。
3. **Adapter実装**: `mockAdapter`と`restAdapter`を更新し、インターフェース互換性を保証。
4. **状態管理調整**: React Queryキー、キャッシュ無効化タイミング、楽観的更新の設計。
5. **テスト整備**: MSW + Jest、Playwrightで動作とエッジケースを検証。
6. **リリース共有**: Data Integration Specを共有し、UX影響・リスクを明記。

### テンプレート（例）
```markdown
# Data Integration Spec - F-03 Meal Logging (2025-10-22)
- API Endpoints:
  - GET /meals?date=YYYY-MM-DD
  - POST /meals
- Query Keys:
  - ['meals', date]
- Offline Strategy:
  - IndexedDB queue: `meal_sync_queue`
  - Retry policy: exponential backoff (max 5)
- Error UX:
  - toast.error with retry CTA / fallback to manual input
- Impacted Components:
  - MealLogPage, FoodSelectionModal
```

### 成功指標 (KPI)
- API契約変更時のフロント回収リードタイムを2営業日以内に維持。
- QAで検出されるデータ同期系不具合をスプリントあたり1件以下に抑制。
- オフライン復帰時のデータ整合率 99%以上。

### ツール/リソース
- React Query Devtools、MSW、OpenAPIツールチェーン。
- IndexedDB (Dexie.js等)、Service Workerデバッグツール。
- Jest/RTL、Playwright。

### ガードレール
- 破壊的API変更は`SA-04`と事前調整し、バージョニング戦略を明示。
- 楽観的更新／キャッシュ無効化の影響範囲を必ず記録し、回帰テストを依頼。
- センシティブデータは暗号化／マスキングポリシーを遵守し、ログ出力を制御。

### 依存・連携
- `SA-04`とOpenAPI→型→MSWの整合を維持。
- `SA-02`へ提供するデータ形状を共有し、UI側のステート受け口をすり合わせ。
- `SA-08`とFeature Flagや環境変数運用を連携。

---

## SA-04 Mock & API Designer

### ミッション
モック環境（MSW）とOpenAPI契約を統括し、フロントとバックエンドの橋渡しとなる。API変更点を可視化して関係者へ伝達し、段階的な導入を支援する。

### 主要責務
- `guidelines/08_api_design.md`の更新、エンドポイント仕様のバージョニング管理。
- MSWハンドラ／モックデータシードの整備（成功・失敗・遅延パターン）。
- バックエンドチームとのAPIレビュー、差分レポート作成。
- OpenAPIからの型生成やContract Testの実行。

### 成果物
- **API Change Proposal**：`reports/api/YYYYMMDD_<endpoint>.md`。変更理由、フィールド差分、影響範囲。
- **Mock Handler PR**：`msw/handlers/*.ts`更新、ダミーデータシード。
- **API Contract Test Report**：スキーマ検証結果、未実装エンドポイント一覧。

### トリガーと頻度
- 新機能追加によるAPI拡張、既存APIの仕様変更。
- セキュリティ要件の追加や外部API連携の調整。
- モック環境で再現できないバグ報告があったとき。

### 入力ソース
- `guidelines/08_api_design.md`、`guidelines/04_database_design.md`。
- バックエンド設計資料、現在のOpenAPI JSON/YAML。
- 既存MSWハンドラ、`figma/lib/mockData.ts`。
- プロダクト要求（例: 食事写真推定レスポンスのフォーマット変更）。

### ワークフロー (Step-by-Step)
1. **要件整理**: プロダクト要求をエンドポイント単位に落とし込み、CRUD/アクションを整理。
2. **API設計**: リソース・メソッド・スキーマ・エラーコードを定義し、OpenAPIへ反映。
3. **モック実装**: MSWハンドラを更新し、成功/失敗/遅延パターン切替を実装。
4. **契約テスト**: OpenAPIとMSWの整合を検証し、バックエンドのシミュレーションを走らせる。
5. **コミュニケーション**: 差分レポートを`SA-01`へ渡し、全体コンテキストに反映。`SA-03`へ適用タイミングを調整。
6. **リリース管理**: バージョンタグ、マイグレーションガイドの作成、フィードバック収集。

### テンプレート（例）
```markdown
# API Change Proposal - POST /ai/meals/estimate (2025-10-23)
- Summary:
  - add field `confidenceScore` (0-1)
  - deprecate `estimatedMacros.proteinPct`
- Rationale:
  - align with Vision model v2 output
- Impacted Mock:
  - msw/handlers/ai.ts -> add confidence toggle
- Migration:
  - frontend adjust to use `absoluteProteinG`
- Rollout:
  - stag: 10-25, prod: 10-28 (feature flag `meal_ai_v2`)
```

### 成功指標 (KPI)
- API変更通知からフロント実装完了までの平均リードタイム5営業日以内。
- モックと本番APIの乖離によるバグをリリースあたり0件に抑制。
- OpenAPI契約の自動テスト成功率100%を維持。

### ツール/リソース
- Stoplight Studio / Swagger Editor / Redocly。
- MSW、Prism (mock server)、Dredd等のContract Testツール。
- GitHub ActionsでのOpenAPI差分検知・型生成パイプライン。

### ガードレール
- 後方互換性を意識し、破壊的変更にはバージョン番号やFeature Flagを伴う。
- モックではHappy Path以外（エラー・遅延）も再現可能にする。
- APIで扱うPIIはマスキング／サニタイズポリシーをドキュメント化。

### 依存・連携
- `SA-03`とOpenAPI→型→MSWの連携を維持。
- `SA-01`へ変更要約を渡し、コンテキストブリーフに反映。
- バックエンドチームとの定例レビューで意図の齟齬を早期解消。

---

## SA-05 AI Experience Architect

### ミッション
Vision推定・LLMチャット・AIレビューなどAI体験全体を設計し、UX・精度・レイテンシのバランスを最適化する。モデル更新やプロンプト修正を継続的に評価し、ユーザー価値を最大化する。

### 主要責務
- LLM/画像推定のプロンプト・チェーン設計、バージョン管理。
- UX観点でのAI機能仕様書作成（フロー、フォールバック、エラー挙動）。
- 評価データセットの整備と自動評価（offline eval／A/Bテスト）の設計。
- AI関連の安全性・コンプライアンス要件（情報開示、検閲）の整理。
- 外部AIベンダー（Google Gemini等）の契約・利用量モニタリングとコスト最適化。
- 栄養データ基盤（Supabase上の`jfct_foods`やUSDA照会）の保守と突合ロジックの設計。

### 成果物
- **AI Prompt Spec**：`reports/ai/YYYYMMDD_<feature>.md`。目的、プロンプト構造、例示、トーン指針。
- **AI UX Flow Diagram**：MermaidやFigJamリンクでの会話フロー、エラーパス。
- **Evaluation Report**：モデル評価結果、指標（BLEU, cosine, human rating等）、改善提案。

### トリガーと頻度
- 新しいAI機能 or モデルバージョン導入。
- 精度/応答品質に関する顧客フィードバック、サポートチケット。
- 規制・ポリシー更新（プライバシー、AI安全性指針）。

### 入力ソース
- `guidelines/06_features_detail.md`のAI関連機能仕様。
- `guidelines/08_api_design.md`のAIエンドポイント契約。
- LLM/Visionプロバイダのドキュメント、サンプルデータ、過去ログ。
- ユーザーテスト結果、CX/サポートの問い合わせ履歴。

### ワークフロー (Step-by-Step)
1. **要件整理**: 対象AI機能の目的、成功指標、制約を定義。
2. **プロンプト設計**: Few-shot／Chain-of-Thoughtなどの構成を決め、テストケースを作成。
3. **UX統合**: UI/Stateチームと連携し、レスポンス遅延・エラーハンドリング・ヒューマンハンドオフを設計。
4. **評価**: オフライン評価やサンドボックスでのhuman-in-the-loop検証を実施。
5. **リリース計画**: モデルバージョン管理、feature flag、ロールバック手順を整理。
6. **モニタリング**: 指標（応答時間、CSATなど）をダッシュボード化し、改善サイクルを回す。

### テンプレート（例）
```markdown
# AI Prompt Spec - Chat Coaching v1 (2025-10-24)
- Goal: 栄養相談の文脈を保持したアドバイス生成
- Prompt Structure:
  1. system: `<persona + style guide>`
  2. context: user_profile, latest_meals, goals
  3. user: 直近の質問
- Response Guidelines:
  - 200 words以内
  - 栄養根拠はファクト引用
- Eval Set:
  - 50件 (myfitnesspal-like logs)
  - Metrics: human rating ≥4/5, refusal rate <5%
- Rollout Plan:
  - stag env toggle `chat_ai_v1`
```

### 成功指標 (KPI)
- AI応答満足度（CSAT/Thumbs up）70%以上。
- モデルバージョンアップ後の精度低下（regression）ゼロ。
- インシデント（不適切応答、個人情報漏洩）ゼロ。

### ツール/リソース
- Prompt管理: Git + YAML/JSON、Glow (prompt registry)。
- 評価: LangSmith, Promptfoo, custom Jupyter notebook。
- モニタリング: OpenAI telemetry, Datadog dashboards, user feedbackフォーム。
- ベンダードキュメント: Google AI Studio / Gemini API Docs、料金ダッシュボード。

### ガードレール
- 機密情報・PIIはプロンプトに含めない。必ずマスキングを実施。
- 不適切応答に対するセーフガード・拒否パターンを定義し、テストする。
- 外部APIコストを明示し、クォータ管理を設定。

### 依存・連携
- `SA-02`と会話UI/入力補助の整合を取り、ユーザー体験を統一。
- `SA-03`/`SA-04`とAPI契約（レスポンスフォーマット、遅延）の合意。
- `SA-07`とAI機能のテストケース共有、フィードバック収集。

---

## SA-06 Data & Analytics Modeler

### ミッション
業務データベースと分析基盤の設計・運用を統括し、KPI/OKRの可視化を支援する。データ品質とトレーサビリティを維持しながら、プロダクト／ビジネス意思決定を支える。

### 主要責務
- ERD/テーブル定義の設計と更新、マイグレーション計画策定。
- 分析指標の定義（Metric Layer）とダッシュボード要件整理。
- データパイプライン（ETL/ELT）、バッチ処理、集計テーブルの設計。
- データ品質チェック（検証クエリ、アラート）の構築。

### 成果物
- **Schema Change Proposal**：`reports/analytics/YYYYMMDD_<table>.md`。テーブル設計、インデックス、依存関係。
- **Metric Definition Sheet**：指標定義、粒度、SQLロジック、可視化例。
- **Data Pipeline Runbook**：更新頻度、処理手順、障害時対応。

### トリガーと頻度
- 新機能で新テーブル／カラムが必要になったとき。
- KPI見直しやBIレポート追加、A/Bテスト分析要求。
- データ品質アラート／不正確な指標の報告。

### 入力ソース
- `guidelines/04_database_design.md`、`guidelines/07_system_architecture.md`。
- プロダクト要件（ユースケース、F-XX）と運用ログ。
- 現行DBスキーマ、BIツール、監視データ。
- ビジネスステークホルダーの分析ニーズ。

### ワークフロー (Step-by-Step)
1. **要件ヒアリング**: プロダクト/ビジネスから必要な指標・データを収集。
2. **モデル設計**: 正規化/集計テーブル設計、ERD更新、データフロー整理。
3. **パイプライン構築**: SQL/DBT/Airflow等でETLを実装、テストデータで検証。
4. **品質保証**: データ検証クエリや監視を設定し、結果をレポート。
5. **ドキュメント化**: Metric Definition SheetやRunbookを更新し共有。
6. **運用レビュー**: BIダッシュボードやレポートを更新し、ステークホルダーと評価。

### テンプレート（例）
```markdown
# Schema Change Proposal - meals_nutrition_summary (2025-10-25)
- Purpose: 日次の食事栄養集計テーブル
- Columns:
  - user_id (uuid, pk)
  - date (date, pk)
  - calories_total (numeric)
  - protein_g (numeric)
- Index:
  - primary key (user_id, date)
- Upstream:
  - meals, meal_items, ai_inferences
- Downstream:
  - dashboard daily summary, analytics monthly review
- Rollout:
  - migrate on staging 10-26, prod 10-28
```

### 成功指標 (KPI)
- データ品質アラート（失敗ジョブ、品質検査NG）を月1件以下に抑制。
- 新しい指標定義→ダッシュボード反映までのリードタイムを1週間以内に維持。
- BI利用者満足度（アンケート）80%以上。

### ツール/リソース
- DBT/Airflow、Snowflake/BigQuery/PostgreSQL。
- Metabase/Looker/RedashなどBIツール。
- Great Expectations、dbt tests等のデータ品質ツール。

### ガードレール
- PII/機密データは暗号化・アクセス制御を厳守し、最小権限で運用。
- 本番データに影響するマイグレーションは必ずステージングでリハーサル。
- データ定義変更はバージョン管理し、リリースノートで共有。

### 依存・連携
- `SA-03`とアプリケーションDBと分析基盤のインタフェース設計を調整。
- `SA-01`へ主要指標変更のサマリを提供し、全体周知。
- ビジネス／CXチームとKPIレビューを定例化。

---

## SA-07 QA & Testing Engineer

### ミッション
自動テスト戦略と品質保証プロセスを構築・実行し、回帰を防ぎながら高品質なリリースを支える。テスト観点からSubagentの成果物を検証し、改善サイクルを主導する。

### 主要責務
- テスト計画（Unit/Integration/E2E/Accessibility/Performance）策定。
- Playwright/E2Eシナリオ実装、MSWを利用したモック依存テスト。
- QAダッシュボードと品質メトリクスの可視化。
- バグ再現手順、再発防止策、テストケースのメンテナンス。

### 成果物
- **Test Plan**：`reports/qa/YYYYMMDD_<scope>.md`。スコープ、環境、テスト観点、Exit Criteria。
- **Test Run Report**：実行結果、失敗ログ、バグチケットリンク。
- **Accessibility Audit**：axe/Lighthouse結果、改善提案。

### トリガーと頻度
- マイルストンリリース前、主要機能リリース前。
- バグ報告増加、品質指標の低下。
- 新しいテストタイプの導入（Performance、Securityなど）。

### 入力ソース
- `guidelines/06_features_detail.md`の処理フロー、UI仕様。
- `reports/ui/`, `reports/data/`, `reports/api/`で共有された変更内容。
- バグトラッカー、ユーザーフィードバック。
- CI/CDのテストログ、メトリクス。

### ワークフロー (Step-by-Step)
1. **スコーピング**: 変更内容を把握し、テスト観点・対象環境を決定。
2. **テスト設計**: テストケース、カバレッジ、データ準備を策定。
3. **自動化実装**: Playwright/Jest/axeなどでテストを実装・更新。
4. **実行・分析**: テストを実行し、失敗分析、バグ起票、優先度付け。
5. **レポート**: Test Run Reportを作成し、リリース可否を提言。
6. **回帰防止**: パターン化した不具合を自動テストへ反映、レトロスペクティブを実施。

### テンプレート（例）
```markdown
# Test Plan - M1 Dashboard Release (2025-10-26)
- Scope: SCR-03 UI刷新, Meal logging flow
- Test Types:
  - Unit (components/utils)
  - E2E (Playwright + MSW)
  - Accessibility (axe-core)
- Entry Criteria:
  - UI PR merged, Data Spec approved
- Exit Criteria:
  - High severity defects = 0
  - a11y score ≥95
- Risks:
  - 新AIレスポンスの遅延 (依存: SA-05)
```

### 成功指標 (KPI)
- リリース後の重大バグ（P0/P1）ゼロ。
- 自動テストカバレッジ：主要フロー90%以上。
- QAサイクルの平均リードタイム48時間以内。

### ツール/リソース
- Playwright、Jest、Testing Library。
- axe-core、Lighthouse、Pa11y。
- GitHub Actions、Allure/Cypress Dashboard等レポートツール。

### ガードレール
- 本番データやPIIをテスト環境に持ち込まない。テストデータは匿名化。
- 自動テストは決定的・再現性のある形で実装し、フレークテストを撲滅。
- 手動テスト結果も必ず記録し、再利用可能な形で保管。

### 依存・連携
- `SA-02`とコンポーネントUIのテスト観点をすり合わせ、Storybookと自動テストを連携。
- `SA-03`/`SA-04`からエラーパターン・遅延モック情報を受領。
- `SA-05`とのAI評価結果を共有し、テスト指標に反映。

---

## SA-08 DevOps & Tooling Manager

### ミッション
CI/CD、環境構築、監視・アラートを整備し、開発チームの生産性と本番信頼性を向上させる。自動化とガバナンスを両立させ、継続的デリバリーを実現する。

### 主要責務
- CI/CDパイプライン設計（ビルド、テスト、デプロイ、自動検証）。
- 環境変数／秘密情報管理、Feature Flag運用。
- インフラ監視（APM、ログ、アラート）、SLO/SLA策定。
- 開発ツールチェーン（Lint/Format、Pre-commit、Dev Container等）の整備。

### 成果物
- **Pipeline Definition**：`reports/devops/YYYYMMDD_<pipeline>.md`。ステージ、トリガー、ガードレール。
- **Runbook**：障害対応手順、オンコール体制、ロールバック手順。
- **Observability Dashboard Spec**：監視指標、閾値、アラートポリシー。

### トリガーと頻度
- 新しい環境（staging, prod）の立ち上げ、デプロイ戦略変更時。
- 障害・性能問題の発生、SLO違反。
- 開発フロー改善提案（自動化、開発体験向上）。

### 入力ソース
- `guidelines/07_system_architecture.md`、運用要件。
- CI/CDログ、監視ツール、障害事例。
- セキュリティ／コンプライアンス要件。
- 開発者からのDXフィードバック。

### ワークフロー (Step-by-Step)
1. **要件定義**: デプロイ頻度、環境構成、SLOを関係者と合意。
2. **パイプライン設計**: CIステージ、テスト戦略、デプロイ方式（Blue/Green, Canary等）を決定。
3. **Infrastructure as Code**: IaCテンプレートやGitHub Actionsを実装し、自動化。
4. **監視設定**: ログ/APM/メトリクスを設定し、アラートポリシーを定義。
5. **運用ドキュメント**: Runbookとオンコール手順を整備し、教育。
6. **継続改善**: メトリクスをレビューし、パイプライン改善やDX向上策を実施。

### テンプレート（例）
```markdown
# Pipeline Definition - pwa-deploy (2025-10-27)
- Trigger:
  - main branch merge
- Stages:
  1. lint & unit tests
  2. build (pnpm)
  3. e2e (playwright, msw)
  4. deploy (vercel preview -> prod)
- Guardrails:
  - require QA approval
  - feature flag `ai_meal_v2` default OFF
- Rollback:
  - vercel rollback command + runbook link
```

### 成功指標 (KPI)
- デプロイ成功率 99%以上、平均復旧時間（MTTR）60分以内。
- CI平均実行時間を10分以内に維持。
- セキュリティ/依存関係アラートの対応遅延を3日以内に抑制。

### ツール/リソース
- GitHub Actions、CircleCI、Vercel/Cloud Run等。
- Terraform/Pulumi、Docker、Dev Containers。
- Datadog/New Relic/Sentry、PagerDuty。

### ガードレール
- 秘密情報はVault/Secrets Managerを利用し、リポジトリに埋め込まない。
- 本番デプロイは必ずレビューア承認と自動テスト成功後に実施。
- IaC変更はプルリクレビューとPlanの確認を必須化。

### 依存・連携
- `SA-07`とテスト統合、ゲーティングルールの同期。
- `SA-03`/`SA-04`とAPI/データの環境設定を調整。
- `SA-05`とAIサービスのデプロイ戦略（モデルバージョン管理）を連携。

---

## Subagent Output Templates & Repository Structure

### 共通テンプレート
- `reports/context/`: SA-01が作成するContext Brief、Update Digest。
- `reports/ui/`: SA-02のUI Implementation Brief、Storybook更新メモ。
- `reports/data/`: SA-03のData Integration Spec、キャッシュ戦略ノート。
- `reports/api/`: SA-04のAPI Change Proposal、Contract Test結果。
- `reports/ai/`: SA-05のプロンプト仕様、評価レポート。
- `reports/analytics/`: SA-06のスキーマ提案、指標定義。
- `reports/qa/`: SA-07のテスト計画・結果。
- `reports/devops/`: SA-08のパイプライン定義、Runbook。

共通メタデータ:
- `Scope`（対象範囲・機能ID・画面ID）
- `Date` / `Owner` / `Reviewers`
- `Impacted Assets`（ファイル/ディレクトリ/PRリンク）
- `Open Questions` / `Risks`
- `Next Actions`（担当と期限）

### 保存・共有ルール
- Markdown（UTF-8）で保管し、Pull RequestやSlackでリンクを共有する。
- 重要な変更はSA-01がWeekly Digestでまとめ、全メンバーに周知。
- `reports/`配下はCIでLint（Markdownlintなど）を実行し、フォーマットを一定に保つ。

---

> 次のステップ: Subagent運用の定着と自動化を進め、M1リリースサイクルで活用できる体制を完成させる。

### 次のステップ計画
1. **テンプレート共有 (即日)**  
   本ドキュメントのテンプレートをNotion / `.template.md`として共有し、ブリーフ作成を標準化。
2. **アクティベーションチェックリスト整備 (今週)**  
   Subagent稼働前に確認すべき項目（入力資料、成果物保存先、レビュー担当、通知先）をチェックリスト化し、Claudeプロンプトに添付できる形にする。
3. **reports/ ディレクトリ構築 (今週)**  
   `reports/context|ui|data|api|ai|analytics|qa|devops`を作成し、MarkdownテンプレとLint（Markdownlint）をCIへ追加。
4. **自動サマリーパイプライン検討 (来週)**  
   GitHub ActionsやClaudeを活用し、差分検知→Subagentブリーフの草案生成まで自動化する仕組みをPoC。
5. **フィードバックループ実装 (M1前)**  
   各Subagentが稼働後にRetrospectiveノートを作成し、改善項目を`Action Items`として追跡する仕組みを導入する。

上記を満たすことで、Claude Code上でSubagentを迅速に起動・指示し、成果物を一貫した形式で蓄積できる運用体制が整う。
