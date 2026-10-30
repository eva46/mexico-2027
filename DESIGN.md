# 設計系統 — Editorial & Swiss-inspired

> 本檔由 CLAUDE.md 以 `@DESIGN.md` 匯入。所有 UI 實作必須遵守本檔；需要新顏色、字級、間距時，先在本檔新增 token，再在程式中使用，**禁止在元件 SCSS 寫死色碼、px 字級或任意間距**。

## 0. 風格原則

- 雜誌編輯式排版：超大窄黑體標題 + 理性的幾何無襯線內文，強烈對比
- 大地與復古工藝色調（Earth & Heritage Palette）
- **扁平色塊**：不使用投影、漸層、發光；層級完全靠色塊明暗差、網格切割與細線（唯一例外：AI 助理的浮動按鈕與對話框，見 §4）
- 排版密集但結構嚴整，對齊網格
- 單一淺色主題（`color-scheme: light`），不做深色模式

---

## 1. Color Tokens

### Primitive（基礎色，元件不可直接引用）

| Token | 值 | 說明 |
|---|---|---|
| `color-white-cream` | `#F9F7F2` | 暖米白／未漂白紙張色 |
| `color-oatmeal` | `#E2D8C7` | 燕麥奶茶底色 |
| `color-forest-green` | `#4B6634` | 深苔蘚橄欖綠 |
| `color-brick-red` | `#B33E3D` | 復古磚紅／鐵鏽紅 |
| `color-espresso-black` | `#26201D` | 極深暖炭黑，非純黑 |

### Semantic（語意化，元件只能使用這一層）

**Background**
| Token | 對應 | 用途 |
|---|---|---|
| `bg-page` | `color-oatmeal` | 整頁底色 |
| `bg-surface-primary` | `color-oatmeal` | 大面積介面底色、內容詳情區塊 |
| `bg-surface-secondary` | `color-white-cream` | 淺色內嵌卡片、反白區塊、下拉選單面板 |
| `bg-surface-accent-green` | `color-forest-green` | 主打卡片、頁首 Hero |
| `bg-surface-accent-red` | `color-brick-red` | 次級重點卡片、CTA |
| `bg-surface-dark` | `color-espresso-black` | 導覽列、特定文字卡片 |

**Text / Content**
| Token | 對應 | 用途 |
|---|---|---|
| `text-primary` | `color-espresso-black` | 主要標題、內文（取代 #000） |
| `text-inverse` | `color-white-cream` | 深色／綠／紅背景上的文字與圖示 |
| `text-accent` | `color-brick-red` | 大標題次要行、醒目標註（使用限制見 §1.1） |
| `text-muted` | `rgba(38, 32, 29, 0.72)` | 標籤、次要資訊 |

**Interactive / CTA**
| Token | 對應 |
|---|---|
| `btn-primary-bg` | `color-brick-red` |
| `btn-primary-text` | `color-white-cream` |
| `pill-active-bg` | `color-brick-red` |
| `pill-active-text` | `color-white-cream` |
| `pill-inactive-bg` | `transparent`，搭配 `border: 1px solid rgba(38, 32, 29, 0.2)` |
| `focus-ring` | `2px solid color-espresso-black`，`outline-offset: 2px`；在深色／綠／紅底上改用 `color-white-cream` |

**Status（本專案新增，費用頁與物品頁使用）**
| Token | 對應 | 用途 |
|---|---|---|
| `status-done-bg` / `-text` | `color-forest-green` / `color-white-cream` | 已繳清、已勾選完成 |
| `status-warn-bg` / `-text` | `color-brick-red` / `color-white-cream` | 未繳、已過期限 |
| `status-partial-bg` / `-text` | `color-white-cream` / `color-espresso-black` + `border-strong` | 部分繳交 |
| `status-over-bg` / `-text` | `color-espresso-black` / `color-white-cream` | 超繳 |
| `progress-track` | `rgba(38, 32, 29, 0.12)` | 進度條底 |
| `progress-fill` | `color-forest-green` | 進度條填色 |
| `progress-track-inverse` | `rgba(249, 247, 242, 0.24)` | 深色底（費用總覽）上的進度條底（本專案新增） |
| `progress-fill-inverse` | `color-white-cream` | 深色底上的進度條填色（本專案新增；forest-green 在 espresso 上對比不足 3:1） |

**Chat（本專案新增，AI 助理對話框使用）**
| Token | 對應 | 用途 |
|---|---|---|
| `chat-bubble-user-bg` / `-text` | `color-brick-red` / `color-white-cream` | 使用者送出的訊息 |
| `chat-bubble-ai-bg` / `-text` | `color-oatmeal` / `color-espresso-black` | AI 回覆 |
| `fab-bg` / `fab-text` | `color-espresso-black` / `color-white-cream` | 右下角浮動按鈕 |

### 1.1 對比度檢查結果（WCAG AA：一般文字 ≥ 4.5，大字 ≥ 3）

| 組合 | 對比 | 結論 |
|---|---|---|
| espresso 文字 / oatmeal 底 | 11.39 | ✅ |
| espresso 文字 / cream 底 | 15.01 | ✅ |
| cream 文字 / forest-green 底 | 6.04 | ✅ |
| cream 文字 / brick-red 底 | 5.34 | ✅ |
| cream 文字 / espresso 底 | 15.01 | ✅ |
| brick-red 文字 / cream 底 | 5.34 | ✅ |
| forest-green 文字 / oatmeal 底 | 4.58 | ✅（勉強，避免小字） |
| **brick-red 文字 / oatmeal 底** | **4.05** | ⚠️ 只能用於大字（≥ 24px，或 ≥ 18.66px 粗體） |
| **muted 原值 0.6 透明度 / oatmeal 底** | **3.79** | ❌ 不合格 → 已改為 **0.72**（oatmeal 5.31、cream 6.15） |

規則：
- `text-accent` 在 `bg-surface-primary`（oatmeal）上**只用於大標題**；小字醒目標註改放在 cream 卡片上，或改用 `status-warn` 色塊
- 不可只靠顏色傳達狀態，狀態標籤一律同時有文字（例如「已繳清」）

---

## 2. Typography Tokens

### Font Families

原設計的 Druk 為付費字型，改用 Google Fonts 的免費替代，並**必須**加上中文 fallback（拉丁字型沒有中文字）：

| Token | 字型堆疊 | 用途 |
|---|---|---|
| `font-family-display` | `"Anton", "Noto Sans TC", "Impact", sans-serif` | 超大視覺標題 |
| `font-family-body` | `"Inter", "Noto Sans TC", "Helvetica Neue", sans-serif` | 標籤、按鈕、正文 |

載入（`index.html`，使用 `preconnect` + `display=swap`）：
- Anton 400
- Inter 400、700
- Noto Sans TC 400、700、900

注意：
- Anton 只有一種粗細，本身即為極粗窄體。display 樣式設 `font-weight: 900` 是給中文 fallback（Noto Sans TC Black）用的，同時**必須**加 `font-synthesis: none`，避免瀏覽器對 Anton 產生假粗體
- `text-transform: uppercase` 與 `letter-spacing` 對中文無效，屬正常現象

### Type Scale（mobile → desktop 用 `clamp()` 流動縮放）

| Token | 字級 | line-height | weight | 其他 |
|---|---|---|---|---|
| `font-size-display-xl` | `clamp(48px, 7vw + 20px, 96px)` | 拉丁 `0.9`；含中文時 `1.05` | 900 | `letter-spacing: -0.02em` |
| `font-size-heading-md` | `clamp(20px, 1vw + 16px, 28px)` | 1.1（中文 1.25） | 700 | |
| `font-size-heading-sm` | `clamp(16px, 0.5vw + 14px, 20px)` | 1.2（中文 1.35） | 700 | |
| `font-size-body` | `clamp(14px, 0.25vw + 13px, 16px)` | 1.5 | 400 | |
| `font-size-caption-caps` | 拉丁 `11px`；中文 `12px` | 1.2 | 700 | `uppercase`，`letter-spacing: 0.05em` |
| `font-size-input` | `16px` | 1.5 | 400 | 文字輸入框專用（本專案新增；小於 16px 時 iOS 聚焦會自動放大畫面） |

與原設計的差異與原因：
- body 原為 13～14px，因主要內容是中文，下限設為 14px，桌機放大到 16px
- 中文 caption 最小 12px，10～11px 的中文在手機上幾乎無法閱讀
- line-height 0.9 會讓中文上下裁切或撞行，含中文的標題放寬

### 排版慣例（建立編輯風格的關鍵）
- 大標題以**英文或數字**為主視覺，中文作為次要行，例如：
  - 行程頁：`DAY 03`（display）＋「瓜納華托古城散步」（heading-md）
  - 費用頁：`PAYMENT`（display）＋「團費繳交狀況」
  - 物品頁：`PACKING`（display）＋「出發前準備清單」
- 類別小標使用 caption-caps，例如 `MUST HAVE`、`DUE IN 45 DAYS`、`MEMBER`
- 時間、金額這類數字可用 display 字型放大，強化雜誌感

---

## 3. Spacing & Radius Tokens

### Spacing（固定值）
| Token | 值 | 用途 |
|---|---|---|
| `spacing-xs` | 4px | 文字與微型標籤 |
| `spacing-sm` | 8px | 標籤內距、卡片內項目垂直間距 |
| `spacing-md` | 12px | 卡片間 gutter（手機）、卡片 padding（手機） |
| `spacing-md-plus` | 16px | 卡片間 gutter、卡片 padding（平板以上） |
| `spacing-lg` | 24px | 區塊間距 |
| `spacing-xl` | 32px | 區塊主標題至內容流 |
| `spacing-2xl` | 48px | 桌機大區塊間距（本專案新增） |

### Layout（語意化，依斷點變化）
| Token | 手機 | 平板 | 桌機 |
|---|---|---|---|
| `layout-screen-padding` | 20px | 24px | 32px |
| `layout-gutter` | 12px | 16px | 16px |
| `layout-max-width` | — | — | 1200px（置中） |
| `layout-nav-height` | 64px | 64px | 64px（本專案新增；手機底部導覽列高度，內容需預留） |
| `touch-target-min` | 44px | 44px | 44px（本專案新增；可點擊區域最小尺寸） |
| `icon-size-md` | 24px | 24px | 24px（本專案新增；導覽列等線條圖示） |
| `z-nav` | 100 | 100 | 100（本專案新增；導覽列層級） |
| `z-fab` | 110 | 110 | 110（本專案新增；AI 浮動按鈕與對話框，需高於導覽列） |
| `fab-size` | 56px | 56px | 56px（本專案新增；AI 浮動按鈕直徑） |
| `chat-panel-width` | 100%（左右各留 `spacing-md`） | 380px | 400px（本專案新增；AI 對話框寬度） |
| `chat-panel-height` | `min(70dvh, 560px)` | `min(70dvh, 560px)` | `min(70dvh, 560px)`（本專案新增；AI 對話框高度） |

### Border Radius
| Token | 值 | 用途 |
|---|---|---|
| `radius-sm` | 8px | Tag / Pill |
| `radius-md` | 12px | 內容卡片、功能區塊 |
| `radius-lg` | 24px | Floating CTA、大區塊外框 |
| `radius-full` | 9999px | 圓形圖示按鈕 |

---

## 4. Elevation & Borders

| Token | 值 | 用途 |
|---|---|---|
| `elevation-none` | `box-shadow: none` | 全站預設；除下兩列外不得使用其他陰影 |
| `elevation-fab` | `0 4px 12px rgba(38, 32, 29, 0.32)` | **例外**：僅限 AI 浮動按鈕（本專案新增） |
| `elevation-panel` | `0 12px 32px rgba(38, 32, 29, 0.24)` | **例外**：僅限 AI 對話框（本專案新增） |
| `border-subtle` | `1px solid rgba(38, 32, 29, 0.12)` | 規格線、欄位分隔線 |
| `border-strong` | `1px solid rgba(38, 32, 29, 0.2)` | Pill 外框、浮動面板外框（本專案新增） |
| `border-subtle-inverse` | `1px solid rgba(249, 247, 242, 0.24)` | 深色底（費用總覽）上的分隔線（本專案新增） |
| `line-width-thin` | `1px` | 細線寬度；上述 border token 與 pill 透明外框使用（本專案新增） |
| `line-width-thick` | `2px` | 粗線寬度；focus-ring、勾選框外框、hover／完成狀態的底線與刪除線（本專案新增） |

浮動層（例如日期下拉選單面板）同樣不用投影，以 `bg-surface-secondary` + `border-strong` 區隔。

---

## 5. Motion

- 展開／收合、V 符號旋轉 180°：`200ms ease-out`（token：`motion-expand`）
- 不做其他裝飾性動畫
- 遵守 `@media (prefers-reduced-motion: reduce)`：移除所有過渡

---

## 6. Responsive 斷點

| 名稱 | 範圍 | 說明 |
|---|---|---|
| mobile | < 768px | 預設樣式（mobile-first，以 360px 為最小設計寬度） |
| tablet | ≥ 768px | |
| desktop | ≥ 1024px | |

SCSS 以 mixin 寫斷點：`@include bp(tablet) { … }`，只用 `min-width`。

---

## 7. 元件對應

| 元件 | 樣式 |
|---|---|
| 頁面 | `bg-page`，內容區 `layout-max-width` 置中，左右 `layout-screen-padding` |
| 導覽列 | 手機：固定底部、`bg-surface-dark`、`text-inverse`，項目為圖示＋caption-caps，目前頁面以 `pill-active` 標示；需加 `padding-bottom: env(safe-area-inset-bottom)`。桌機：改為頁面頂部橫列，同色系 |
| 行程 Hero | `bg-surface-accent-green`、`text-inverse`、`radius-md`；`DAY 03` 用 display-xl，日期與城市用 caption-caps |
| 日期下拉選單 | 收合時為 pill（`pill-inactive` 樣式＋V 圖示）；展開面板 `bg-surface-secondary` + `border-strong` + `radius-md`；目前選中的日期用 `pill-active` |
| 行程項目 | `bg-surface-secondary` 卡片；時間以 display 字型、`heading-md` 尺寸置左；項目間以 `border-subtle` 分隔 |
| 物品：極度重要 | `bg-surface-accent-red`、`text-inverse`，置頂且卡片較大 |
| 物品：建議攜帶 | `bg-surface-accent-green`、`text-inverse` |
| 物品：其他 | `bg-surface-secondary`、`text-primary`、`border-subtle` |
| 物品期限 | caption-caps 顯示 `DUE IN 45 DAYS`／中文「剩 45 天」；30 天內加粗並以 `status-warn` 小 pill 標示；已過期以 `status-warn` 實心 pill「已過期限」 |
| 費用總覽 | `bg-surface-dark` 區塊，金額用 display 字型 |
| 成員列 | `bg-surface-secondary`、`radius-md`；暱稱 heading-sm、金額 body、狀態用對應 status pill；明細列以 `border-subtle` 分隔 |
| 按鈕（若有） | `btn-primary-*`、`radius-lg` |
| AI 浮動按鈕 | 右下角固定、`fab-bg`／`fab-text`、`radius-full`、`elevation-fab`，文字「AI」；手機位於底部導覽列上方 |
| AI 對話框 | `bg-surface-secondary`、`radius-md`、`elevation-panel`；使用者訊息 `chat-bubble-user-*` 靠右，AI 回覆 `chat-bubble-ai-*` 靠左；關閉即清空紀錄 |

---

## 8. 實作方式

- `src/styles/_tokens.scss`：以 CSS custom properties 定義於 `:root`，命名與本檔相同並加 `--` 前綴（例如 `--bg-surface-primary`）
- `src/styles/_breakpoints.scss`：`bp()` mixin
- `src/styles/_typography.scss`：`.t-display-xl`、`.t-heading-md`、`.t-heading-sm`、`.t-body`、`.t-caption-caps` 工具類別；預設為拉丁字的 line-height／字級，以中文為主的文字再加 `.t-zh`（放寬 line-height、caption 改 12px）
- §2 的數值另拆成 token：`font-weight-regular/bold/black`、`line-height-*`（含 `-zh` 版本）、`font-size-caption-caps-zh`、`letter-spacing-display`、`letter-spacing-caps`
- `focus-ring` 拆為 `focus-ring`（深色）、`focus-ring-inverse`（cream，用於深／綠／紅底）、`focus-ring-offset`
- 元件 SCSS 以 `@use 'breakpoints' as *;` 引入 mixin（`angular.json` 已設定 `stylePreprocessorOptions.includePaths: ["src/styles"]`）
- `src/styles.scss` 依序引入上述檔案並設定 `body { background: var(--bg-page); color: var(--text-primary); font-family: var(--font-family-body); }`
- 元件 SCSS 只能使用 `var(--…)`，primitive 色只在 `_tokens.scss` 內被引用
- 圖示使用線條風格 SVG（inline 或 `currentColor`），顏色繼承文字色
