# NutriAI UI Implementation Brief
**作成者**: SA-02 UI Composer  
**作成日**: 2025-10-21  
**目的**: FigmaモックとAtomic Design規約に基づく実装状況の分析と改善提案

## 1. 実装状況サマリー

### 1.1 ディレクトリ構成分析
現在、プロジェクトには2つの実装ディレクトリが存在：
- `NutriAI/figma/` - Figmaモック実装（開発中）
- `nutriai-app/` - 本番Next.js実装

**推奨事項**: figma/ディレクトリの実装を最新デザインに合わせて更新し、本番移行時のベースとする。

### 1.2 Atomic Design準拠状況
```
現状の構成:
- components/ui/ (Atoms/Molecules) ✅ 実装済み
- components/layout/ (Organisms) ✅ 実装済み  
- components/features/ (Templates) ✅ 実装済み
- pages/ (Pages) ✅ App Routerで実装
```

**評価**: Atomic Design構造は適切に実装されている。

## 2. デザイントークン実装状況

### 2.1 カラーパレット
**設計書定義**:
- プライマリ: #42B883 ✅ 実装済み
- アクセント: #2F855A ✅ 実装済み
- 背景: #FFFFFF/#F5FBF6 ✅ 実装済み

**実装状況**:
- `figma/styles/globals.css` - CSS変数として定義
- `nutriai-app/app/globals.css` - HSL形式で定義（要統一）

### 2.2 タイポグラフィ
**設計書定義**:
- 見出し: Noto Sans JP Bold
- 本文: Noto Sans JP Regular
- 英数字: Inter

**実装状況**: ❌ フォントファミリーの明示的な定義が不足

### 2.3 スペーシング
**設計書定義**: 8pxベースのグリッド

**実装状況**: ✅ Tailwindのデフォルトスペーシング（4pxベース）を使用

## 3. 画面別実装状況

### 3.1 ホームダッシュボード (SCR-03)
**設計書との差分**:

| 要素 | 設計書 | 実装状況 | 差分 |
|------|--------|----------|------|
| ヘッダー | ロゴ大きく、🍏アイコン | ✅ 実装済み | なし |
| 日付ナビゲーション | bg-gray-50 | ✅ 実装済み | なし |
| カルーセル | カロリー・栄養素カード | ✅ 実装済み | なし |
| 背景色 | bg-primary/5 | ✅ 実装済み | なし |
| 体重カード | Collapsible入力 | ✅ 実装済み | なし |

### 3.2 食事記録 (SCR-04)
**設計書との差分**:

| 要素 | 設計書 | 実装状況 | 差分 |
|------|--------|----------|------|
| 日次サマリー | bg-primary/10 | ❌ bg-gray-100 | 背景色不一致 |
| カロリー表記 | kcal単位明記 | ✅ 実装済み | なし |
| タブ統合 | マイミール・マイフード | ✅ 実装済み | なし |
| 追加ボタン | hover:font-semibold | ✅ 実装済み | なし |

### 3.3 運動記録 (SCR-06)
**設計書との差分**:

| 要素 | 設計書 | 実装状況 | 差分 |
|------|--------|----------|------|
| 日次サマリー | bg-primary/10 | ❌ 未実装 | 背景色不一致 |
| その他選択時 | カロリー自由入力 | ✅ 実装済み | なし |
| 強度選択 | 条件付き表示 | ✅ 実装済み | なし |

### 3.4 進捗・分析 (SCR-07)
**設計書との差分**:

| 要素 | 設計書 | 実装状況 | 差分 |
|------|--------|----------|------|
| 月次レビュー | 最上部配置 | ✅ 実装済み | なし |
| 目標進捗カード | bg-white | ✅ 実装済み | なし |
| ヘッダー説明文 | あり | ✅ 実装済み | なし |

## 4. コンポーネント品質分析

### 4.1 ボタンコンポーネント
```typescript
// 現状の実装
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // ...
      }
    }
  }
);
```

**評価**: 
- ✅ バリアント管理が適切
- ✅ アクセシビリティ考慮（focus-visible）
- ❌ 設計書の「+ 追加」ボタンスタイルが未定義

### 4.2 レスポンシブ対応
**現状**: モバイルファーストで実装されているが、タブレット以上のレイアウトが未実装。

## 5. 改善提案

### 5.1 即時対応項目
1. **タイポグラフィ設定**
   ```css
   /* globals.cssに追加 */
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap');
   
   body {
     font-family: 'Noto Sans JP', 'Inter', sans-serif;
   }
   ```

2. **カラートークン統一**
   - figmaとnutriai-appで異なる形式（HEX vs HSL）を統一
   - CSS変数名の一貫性確保

3. **背景色の修正**
   - 食事記録の日次サマリー: bg-gray-100 → bg-primary/10
   - 運動記録の日次サマリー: 背景色追加

### 5.2 中期改善項目
1. **Storybook導入**
   - UIコンポーネントの単体テストとドキュメント化
   - デザイナーとの仕様同期強化

2. **デザイントークンの集約管理**
   ```typescript
   // tokens/index.ts
   export const tokens = {
     colors: {
       primary: '#42B883',
       accent: '#2F855A',
       // ...
     },
     spacing: {
       base: 8,
       // ...
     },
     typography: {
       fontFamily: {
         heading: 'Noto Sans JP',
         body: 'Noto Sans JP',
         numeric: 'Inter'
       }
     }
   };
   ```

3. **アクセシビリティ強化**
   - aria-label追加
   - キーボードナビゲーション改善
   - コントラスト比の検証

### 5.3 長期展望
1. **Flutter対応準備**
   - プラットフォーム非依存のデザイントークン形式
   - コンポーネントインターフェースの抽象化

2. **PWA最適化**
   - Service Worker実装
   - オフライン対応UI
   - インストール促進UI

## 6. 実装優先順位

### Phase 1（今週）
- [ ] タイポグラフィ設定の追加
- [ ] 背景色の不整合修正
- [ ] 「+ 追加」ボタンスタイルの実装

### Phase 2（来週）
- [ ] デザイントークンの集約
- [ ] Storybook環境構築
- [ ] レスポンシブレイアウト拡張

### Phase 3（来月）
- [ ] アクセシビリティ監査と改善
- [ ] パフォーマンス最適化
- [ ] Flutter移行準備

## 7. 成功指標
- デザイン仕様との差分: 0件
- Lighthouse Accessibilityスコア: 95以上
- 初回読み込み時間: 3秒以内
- Storybookカバレッジ: 80%以上

---

**次のアクション**: 
1. このブリーフをデザイナーとレビュー
2. Phase 1項目の実装開始
3. 週次での進捗確認ミーティング設定