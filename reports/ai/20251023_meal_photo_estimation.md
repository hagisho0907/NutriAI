# AI Prompt Spec - Meal Photo Estimation v1 (2025-10-23)

## Goal
食事写真から栄養価（カロリー、PFC）を推定し、ユーザーの食事記録を支援する

## API Provider
- Primary: Replicate (食品推定モデル)
- Fallback: Google Cloud Vision API + 栄養DB照合
- Future: Nanobanana (コスト削減後)

## Prompt Structure

### 1. Image Analysis Request
```json
{
  "version": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "input": {
    "image": "<base64_encoded_image>",
    "prompt": "Analyze this food photo and identify all food items with their estimated portions. For each item provide: name (in Japanese), quantity, unit, and nutritional content (calories, protein, fat, carbohydrates).",
    "negative_prompt": "text, watermark, low quality",
    "num_outputs": 1,
    "guidance_scale": 7.5
  }
}
```

### 2. Context Enhancement (with description)
When user provides description:
```
Additional context: [user_description]
Please use this information to improve accuracy of food identification and portion estimation.
```

## Response Processing

### Expected Format
```json
{
  "items": [
    {
      "name": "白米ご飯",
      "quantity": 150,
      "unit": "g",
      "calories": 252,
      "protein": 3.8,
      "fat": 0.5,
      "carbs": 55.7,
      "confidence": 0.85
    }
  ],
  "totalNutrition": {
    "calories": 650,
    "protein": 28.5,
    "fat": 18.3,
    "carbs": 82.4
  },
  "overallConfidence": 0.82
}
```

## Response Guidelines
- 日本の一般的な食事を優先的に認識
- ポーション推定は日本の標準的な1人前基準
- 栄養価は日本食品成分表に基づく
- 信頼度70%未満の項目は除外

## Error Handling
- API timeout: 30秒
- Retry policy: 最大3回、exponential backoff
- Fallback to manual input UI

## Evaluation Metrics
- Accuracy: 実際の栄養価との誤差±20%以内
- Response time: 3秒以内（画像アップロード除く）
- User satisfaction: 推定結果の採用率80%以上

## Test Dataset
- 50種類の日本食写真
- 各食事タイプ（朝食、昼食、夕食、間食）
- 単品・定食・弁当のバリエーション

## Rollout Plan
1. Development: MSWモックで動作確認
2. Staging: Replicate APIをfeature flag制御
3. Production: 段階的ロールアウト（10% → 50% → 100%）

## Cost Management
- 月間クォータ: 10,000リクエスト
- ユーザー別制限: 1日30回まで
- 超過時はmanual inputへ誘導

## Privacy & Security
- 画像は処理後即座に削除
- APIへは画像のみ送信（ユーザー情報除外）
- HTTPS通信必須