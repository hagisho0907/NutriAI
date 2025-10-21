# NutriAI API設計書

## 1. 基本方針
- アーキテクチャ: RESTful JSON API。将来的にチャットはSSE/WebSocketを追加。
- ベースURL: `https://api.nutriai.com/api/v1` (モック時は`/mock/api/v1`を想定)。
- 認証: 初期はトークンレスのモック。実装時はOAuth2/OIDC(各種SNS)＋短期アクセストークンとリフレッシュトークン。
- レスポンス形式: `application/json; charset=utf-8`。日時はISO 8601 (UTC)。
- バージョニング: URLにバージョン番号を含め、クライアントはAcceptヘッダーでサポートバージョンを明示。

## 2. モック→本番移行戦略
- フロントエンドは`DataProvider`インターフェースでAPIを抽象化。MSW(Mock Service Worker)もしくはNext.js API Routesでモックを提供。
- モックAPIは本番APIと同じエンドポイント構造・JSONスキーマを維持し、OpenAPI定義からTypeScript型を生成して整合性を保証。
- モックデータは`/mock/api/v1`に`GET`/`POST`のシミュレーションを配置し、レスポンス遅延やエラーパターンを切り替える。
- 実装時はBFF(Backend for Frontend)層を用意し、LLM呼び出しや画像解析は非同期ジョブキューに委譲。

## 3. エンドポイント一覧
| カテゴリ | メソッド | パス | 説明 | モック状況 |
| --- | --- | --- | --- | --- |
| Auth | POST | /auth/guest | ゲストログイン | 即時スタブレスポンス |
| Auth | POST | /auth/token | アクセストークン発行 | モックでは固定トークン |
| Users | GET | /users/me | 自分のプロフィール取得 | JSONシードを返却 |
| Users | PATCH | /users/me | プロフィール更新 | モックはローカル状態を書き換え |
| Goals | POST | /goals | 目標作成 | AI提案結果を保存 |
| Goals | GET | /goals/current | 現在の目標取得 | モックで1件を返す |
| Dashboard | GET | /dashboard/today | 当日サマリー | 固定レスポンス(⾃動更新) |
| Meals | GET | /meals | 食事一覧 | クエリ: date, type |
| Meals | POST | /meals | 食事記録作成 | AI推定結果を含む |
| Meals | POST | /meals/{id}/photo | 食事写真アップロード | モックは即時URL返却 |
| Foods | GET | /foods/search | キーワード検索 | モックはローカルインデックス |
| Foods | GET | /foods/barcode/{jan} | JANコード検索 | 見つからない場合404 |
| Exercises | GET | /exercises/templates | テンプレート取得 | JSON配列 |
| Exercises | POST | /exercises/logs | 運動記録 | |
| Analytics | GET | /analytics/progress | 月次集計 | |
| AI | POST | /ai/goals/proposal | 目標提案 | モックはプリセット |
| AI | POST | /ai/meals/estimate | 食事マクロ推定 | 画像URLと補足を受け取る |
| AI | POST | /ai/chat | チャット | モックはテンプレ回答 |
| System | GET | /status | ヘルスチェック | 200/503 スタブ |

## 4. エンドポイント詳細

### 4.1 GET /users/me
- 認証: Bearerトークン(モック時は不要)。
- クエリ: なし。
- レスポンス(200):
```json
{
  "id": "9d9a9f4d-31a9-4ce3-a0b0-0e2fddcf4f09",
  "email": "guest@nutriai.dev",
  "profile": {
    "display_name": "ゲストユーザー",
    "gender": "female",
    "birth_date": "1998-06-18",
    "height_cm": 162.0,
    "activity_level": "light",
    "body_fat_pct": 28.5
  },
  "goals": [
    {
      "id": "d61fe1df-20ab-42d1-86f8-35347e5a9954",
      "goal_type": "loss",
      "target_weight_kg": 55.0,
      "target_body_fat_pct": 24.0,
      "target_calorie_intake": 1800,
      "target_duration_weeks": 12,
      "status": "active"
    }
  ]
}
```
- エラーレスポンス: 401(未認証)、500(サーバエラー)。

### 4.2 POST /ai/goals/proposal
- 認証: 必須(モックでは省略)。
- リクエスト:
```json
{
  "height_cm": 172,
  "weight_kg": 74.5,
  "body_fat_pct": 23.2,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate",
  "goal_preference": "loss",
  "desired_change_kg": -4.0,
  "deadline_weeks": 12
}
```
- レスポンス(200):
```json
{
  "suggested_goal": {
    "target_weight_kg": 70.5,
    "target_body_fat_pct": 19.5,
    "target_calorie_intake": 2100,
    "target_calorie_burn": 500,
    "duration_weeks": 12,
    "weekly_checkpoints": [
      {"week": 1, "weight_kg": 73.8},
      {"week": 4, "weight_kg": 72.5}
    ]
  },
  "rationale": "現在の活動量と目標から、週あたり0.3kgの減量が現実的です。",
  "confidence": 0.78
}
```
- エラー: 422(入力値が不足)、429(利用制限)。
- モック実装: 入力値からテンプレートで補完(減量なら300kcal差等)。

### 4.3 POST /meals
- 認証: 必須。
- リクエスト:
```json
{
  "logged_at": "2024-04-02T07:30:00Z",
  "meal_type": "breakfast",
  "source": "photo",
  "photo_url": "https://example.com/mock.jpg",
  "notes": "オートミール＋ギリシャヨーグルト",
  "items": [
    {
      "food_id": "7bb6a921-7d8e-4ba3-b104-3a9c1ab5d0a4",
      "quantity": 1.0,
      "unit": "serving",
      "calories": 420,
      "protein_g": 28,
      "fat_g": 10,
      "carb_g": 52,
      "confidence": 0.82
    }
  ]
}
```
- レスポンス(201):
```json
{
  "id": "2f5fdba1-061e-48bd-89aa-5ca9f0d9a9d0",
  "logged_at": "2024-04-02T07:30:00Z",
  "meal_type": "breakfast",
  "macro_totals": {
    "calories": 420,
    "protein_g": 28,
    "fat_g": 10,
    "carb_g": 52
  }
}
```
- モック実装: `items`が空の時はAI推定スタブを呼んで自動生成する。

### 4.4 POST /ai/chat
- 認証: 必須(モックではスキップ)。
- リクエスト:
```json
{
  "session_id": "e8f79b2d-9bd3-4c39-a8f8-4ba1c5b0cb8c",
  "message": "夜にどうしても甘いものを食べたくなります。",
  "topic": "nutrition"
}
```
- レスポンス(200):
```json
{
  "reply": "夕食後にタンパク質を多めに摂ると血糖値が安定し、甘い物欲求が落ち着きやすいです。温かいハーブティーもおすすめです。",
  "suggested_actions": [
    {"type": "habit", "title": "夕食後にハイプロテインスナック", "description": "ギリシャヨーグルトやプロテインバーをストックしておきましょう。"}
  ],
  "confidence": 0.74
}
```
- モック実装: topic別にプリセット文を返し、`confidence`も固定値。

## 5. 認証・認可
- アクセス保護が必要なエンドポイントは`Authorization: Bearer <token>`ヘッダーで検証。
- トークンは15分有効の短期アクセストークン＋90日のリフレッシュトークン。モックではローカルストレージで管理。
- 画像アップロードは事前署名URL(`POST /meals/{id}/photo`)を返却し、クライアントが直接オブジェクトストレージへPUT。

## 6. エラーハンドリング
- 標準エラーフォーマット:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "体重は正の数値である必要があります。",
    "details": [
      {"field": "weight_kg", "issue": "min_value", "min": 0.1}
    ],
    "trace_id": "req_12345"
  }
}
```
- HTTPステータス: 400(バリデーション), 401/403(認証・権限), 404(未存在), 409(重複), 422(処理不能), 429(レート制限), 500/503(サーバ)。
- モック期間はエラー比率を設定し、UIでのリカバリ挙動をテスト可能にする。

## 7. スロットリングとレート制限
- デフォルト: ユーザー毎に分間60リクエスト。AIエンドポイントは分間10リクエスト。
- レート超過時は`429`と`Retry-After`ヘッダー。モックでは設定でオン/オフ切り替え。

## 8. APIテストとドキュメント化
- OpenAPI 3.1でスキーマ管理。`/docs/openapi.yaml`をソースオブトゥルースとして、Mock/Server双方が参照。
- Contractテスト: Prism等でモックサーバを自動生成し、PWAのE2Eテストを実施。
- テストデータ: `mock/api/v1/seeds/*.json`に保持し、CIで最新スキーマとの差分チェックを行う。

## 9. 今後の拡張
- SSEエンドポイント`/ai/chat/stream`でトークナイズされた回答を逐次送信。
- WebhookでJANコード未登録食品のレビューリクエストを管理者へ通知。
- GraphQLゲートウェイを導入し、Flutterアプリで柔軟なデータ取得を可能にする検討。
