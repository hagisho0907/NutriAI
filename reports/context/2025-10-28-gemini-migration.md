# Context Brief - 2025-10-28
- **スコープ/対象リリース**: Phase1 AI写真推定機能 (F-03) Gemini 2.5 Flash-Lite連携導入
- **作成者**: Codex (SA-05支援)

## Key Updates (3-5項目)
1. Vision推定サービスを暫定LogMeal案からGoogle Gemini 2.5 Flash-Lite活用へ再変更し、画像＋補足文を同時解析する方針に統一。
2. 設計書（05/06/07/08/99）をGemini前提の仕様へ更新し、JSONレスポンス＋フォールバック戦略を整理。
3. `/api/vision/analyze` のロードマップをGeminiプロキシ＋モックフォールバック構成で再策定。
4. コスト/クォータ監視をGeminiトークン課金前提で再定義し、SA-05の責務に反映。

## Impacted Assets
- 設計書: `guidelines/05_features_list.md`, `guidelines/06_features_detail.md`, `guidelines/07_system_architecture.md`, `guidelines/08_api_design.md`, `guidelines/99_subagents.md`
- コード/PR（要更新）: `lib/services/vision.ts`, `app/api/vision/analyze/route.ts`, `lib/services/vision-client.ts`, `components/features/meals/AiPhotoEstimatePage.tsx`
- モック/外部資料: Google AI Studio / Gemini API Docs, 料金ダッシュボード, 既存モック推定仕様

## Open Questions
- Gemini APIキー発行とプロジェクト課金設定は完了しているか？
- JSON出力フォーマットの最終形（items構造・信頼度など）はどうするか？
- Supabase Edge Functionを使うか（署名付きURL生成/非同期化）あるいはNext.js Routeで完結させるか？

## Next Actions
- Owner: Codex & SA-05
- Due: 2025-11-05 (実装＋検証完了目標)
- Notes:
  - `GeminiVisionService` 実装とAPIルート更新（prompt設計、JSONパース、エラー分類）
  - レート制限・利用量ログ（Supabase `ai_inferences`＋トークン計測）整備
  - UI文言・トーストのGemini表記、フォールバック通知確認
  - 環境変数・デプロイ手順書をGemini前提で更新

## 参考リンク
- guidelines/07_system_architecture.md
- guidelines/08_api_design.md
- Google AI Studio / Gemini API ドキュメント（社内共有URL）
