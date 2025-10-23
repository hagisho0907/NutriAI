# NutriAI 機能一覧

## 1. 概要
- 対象: Phase1 (PWAモック〜API実装直前) のMVP機能。
- 目的: 各機能の目的、関連画面、主要データ、APIを俯瞰し、開発優先度と担当範囲を明確化する。
- 記法: 機能IDは`F-XX`で管理し、ユースケース/画面ID/コンポーネントとのトレーサビリティを確保する。

## 2. MVP機能一覧
| ID | 機能名 | 目的/価値 | 主担当画面 | 主要データ | 想定API/サービス | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | 初期設定 & AI目標提案 | ユーザーの基本情報から現実的な目標をAIが提示し定着行動を開始 | SCR-02 | users, user_profiles, user_goals, ai_inferences | `POST /ai/goals/proposal`, `POST /goals` | モック期はローカルJSONでAI提案を生成 |
| F-02 | ダッシュボードサマリー | 当日の摂取・消費カロリーやタスクを一覧し次の行動へ誘導 | SCR-03 | daily_summaries, body_metrics | `GET /dashboard/today` | モックはスタブJSONを周期的に更新 |
| F-03 | 食事記録(写真AI推定) | 写真+補足からマクロ栄養素を推定し登録負担を最小化 | SCR-04 | meals, meal_items, foods, ai_inferences | `POST /ai/meals/estimate`(Gemini 2.5 Flash-Lite連携), `POST /meals`, `POST /meals/{id}/photo` | Gemini障害時はモック推定にフェイルオーバー |
| F-04 | JANコード検索 | バーコード/キーワードから食品を検索し栄養データを流用 | SCR-05 | foods | `GET /foods/search`, `GET /foods/barcode/{jan}` | 検索結果0件時は手動登録フォームへ |
| F-05 | 運動記録 | 運動内容から消費カロリーを算出し日次サマリーを更新 | SCR-06 | exercise_logs, exercise_templates | `GET /exercises/templates`, `POST /exercises/logs` | MET値はテンプレートデータで管理 |
| F-06 | 体重・体脂肪ログ | 体重推移を可視化し目標との差分をトラッキング | SCR-03, SCR-07 | body_metrics, daily_summaries | `POST /body-metrics`, `GET /analytics/progress` | モックは固定シード+日次入力差分を反映 |
| F-07 | 月次レビュー & TDEE再提案 | 実績からTDEEと目標を見直しモチベーションを維持 | SCR-07 | daily_summaries, user_goals, ai_inferences | `GET /analytics/progress`, `POST /ai/review`, `PATCH /goals/current` | モックではプリセットレビュー文章を返す |
| F-08 | LLMチャット相談 | 栄養・運動・メンタルの相談にAIが即時回答 | SCR-08 | chat_sessions, chat_messages, ai_inferences | `POST /ai/chat` | モックはプリセットレスポンス |
| F-09 | 通知・リマインダー | 記録漏れを防ぎ継続利用を促す | SCR-03 (タスクリスト), Service Worker | reminders (将来), daily_summaries | `GET /dashboard/today`, `POST /notifications/snooze`(将来) | Phase1はタスク表示のみ、PWA通知は後続 |

## 3. 補助機能
| ID | 機能名 | 内容 | 備考 |
| --- | --- | --- | --- |
| S-01 | アカウント管理 | 認証、アカウント設定、ログアウト | Phase1はゲスト/簡易ログインのみ |
| S-02 | エラー & オフライン処理 | API失敗/オフライン時の再送、ローカルキャッシュ | React Query + IndexedDB Queue |
| S-03 | 設定 & サポート | プロフィール編集、問い合わせ導線 | モックでは限定項目のみ |

## 4. 将来拡張候補
| ID | 機能名 | 概要 | 前提 |
| --- | --- | --- | --- |
| E-01 | ウェアラブル連携 | Google Fit / Apple Health等から活動量を同期 | OAuth連携、バッチ処理 |
| E-02 | コミュニティ | 成果共有や仲間の進捗閲覧 | ソーシャルグラフ、モデレーション |
| E-03 | レシピ提案 | 冷蔵庫の食材や目標に合わせて食事案を生成 | 外部レシピAPI + LLM |
| E-04 | 課金(プレミアム) | アドバンスド解析や専属コーチング | 決済基盤導入 |

## 5. トレーサビリティマップ
- ユースケース対応: `UC-01`→`F-01`, `UC-02`→`F-06`, `UC-03`→`F-03`, `UC-04`→`F-04`, `UC-05`→`F-08`, `UC-06`→`F-07`。
- 画面ID対応: `SCR-02`(F-01), `SCR-03`(F-02, F-06, F-09), `SCR-04`(F-03), `SCR-05`(F-04), `SCR-06`(F-05), `SCR-07`(F-06, F-07), `SCR-08`(F-08)。
- コンポーネント対応: `GoalWizard`(F-01), `SummaryCard`/`TaskList`(F-02/F-09), `PhotoCapture`/`MacroAdjuster`(F-03), `BarcodeScanner`(F-04), `ExerciseForm`(F-05), `Charts`(F-06/F-07), `ChatTimeline`(F-08)。
