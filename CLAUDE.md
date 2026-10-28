You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

# 墨西哥自由行網站 — 專案規格

> 本檔放在專案根目錄，Claude Code 每次啟動會自動讀取。修改需求時請直接更新本檔。
> 視覺設計規範在獨立檔案，透過下一行自動匯入；任何 UI 工作都必須遵守。

@DESIGN.md

## 專案概要

- 用途：7 人墨西哥自由行的旅遊資訊網站
- 旅遊期間：2027-05-20 ～ 2027-05-28（共 9 天，Day1 = 5/20，Day9 = 5/28）
- 使用者：旅伴，主要以手機瀏覽，但電腦也要能舒適瀏覽（Mobile-first + Responsive）
- 維護者：只有一人（網站擁有者）。所有資料都由擁有者手動修改 JSON 後 commit，網站本身**沒有任何寫入功能、沒有登入、沒有後端**

## 技術架構

| 項目 | 選擇 |
|---|---|
| 前端框架 | Angular（最新穩定版），standalone components + signals |
| UI | 自訂 SCSS；必要時可用 Angular CDK（例如 Overlay 做下拉選單），不強制 Angular Material |
| 樣式 | SCSS + CSS custom properties（design tokens，見 DESIGN.md），Mobile-first、Responsive |
| 字型 | Google Fonts：Anton、Inter、Noto Sans TC（見 DESIGN.md §2） |
| 路由 | `provideRouter(routes, withHashLocation())`，避免 GitHub Pages 重新整理 404 |
| 資料 | 靜態 JSON，放在 `public/data/`，執行時以 `HttpClient` 讀取 `data/xxx.json`（相對路徑，需相容 base-href） |
| 託管 | GitHub Pages（public repo），網址 `https://<帳號>.github.io/<repo名>/` |
| 部署 | GitHub Actions：push 到 `main` 自動驗證 JSON → build → 部署 |
| SSR | 不使用（`--ssr=false`） |

### 目錄結構（目標）

```
CLAUDE.md
DESIGN.md                  # 設計系統（由本檔匯入）
public/
  data/
    itinerary.json
    packing.json
    payments.json
src/styles/
  _tokens.scss             # 所有 design tokens（CSS custom properties）
  _breakpoints.scss        # bp() mixin
  _typography.scss         # 字級工具類別
src/styles.scss
src/app/
  app.routes.ts
  app.config.ts
  core/
    data.service.ts        # 讀取三個 JSON，回傳型別化資料
    models.ts              # 所有 interface
    date.util.ts           # 日期工具（純函式，需有單元測試）
  pages/
    itinerary/             # 行程頁
    packing/               # 攜帶物品頁
    costs/                 # 費用頁
  shared/
    nav/                   # 導覽列（手機底部、桌機頂部；行程／物品／費用）
scripts/
  validate-data.mjs        # JSON 格式與欄位驗證，CI 會執行
.github/workflows/
  deploy.yml
```

## 共通規則

- `index.html` 加上 `<meta name="robots" content="noindex, nofollow">`，避免被搜尋引擎收錄
- 不得在任何檔案中放入個資：只用**暱稱**，不放全名、護照號碼、電話、帳號、訂位代碼
- 一律用 `{{ }}` 綁定文字，禁止 `innerHTML`
- 金額以新台幣顯示，千分位格式（例如 `NT$50,000`），使用 Angular `DecimalPipe` 或 `Intl.NumberFormat('zh-TW')`
- 介面語言：繁體中文
- JSON 讀取失敗時顯示友善錯誤訊息，不可整頁空白
- 所有色彩、字級、間距、圓角都必須使用 DESIGN.md 的 token，不可寫死

## Responsive 規則

斷點定義見 DESIGN.md §6（mobile < 768、tablet ≥ 768、desktop ≥ 1024）。

- 最小支援寬度 360px，任何寬度都不可出現水平捲動
- 內容區最大寬度 1200px 置中，兩側留白依 `layout-screen-padding`
- 導覽列：手機固定在底部（頁面內容需留出導覽列高度＋safe-area）；tablet 以上改為頁面頂部橫列
- 可點擊區域至少 44×44px（手機觸控）；桌機需有 hover 狀態，所有互動元素需有可見的 `:focus-visible` 樣式
- 各頁版面：

| 頁面 | mobile | tablet | desktop |
|---|---|---|---|
| 行程 | 單欄：Hero → 項目列表 | 單欄，Hero 加寬 | 兩欄：左側 Hero＋日期選單（`position: sticky`），右側項目列表 |
| 攜帶物品 | 單欄卡片 | 2 欄格線 | 3 欄格線；極度重要區塊橫跨整列 |
| 費用 | 總覽 → 成員列表單欄 | 總覽與列表同欄，成員列內資訊橫向排列 | 總覽在左（sticky），成員列表在右；成員列為「暱稱／金額／進度條／狀態／V」橫排對齊 |

- 驗收時需在 360px、768px、1280px 三種寬度檢查

## 頁面一：行程頁（預設首頁 `/#/itinerary`）

### 功能
- 一次只顯示**一天**的行程
- 頂部有日期下拉選單：平時只顯示目前選中的「Day N · 5/20（四）」，**點擊才展開**選單列出 Day1～Day9
- 選單需可用鍵盤操作、點擊外部自動收合
- 支援網址參數 `?day=N`（例如 `/#/itinerary?day=3`），方便分享；切換天數時同步更新網址

### 預設顯示哪一天（優先順序）
1. 網址有合法的 `?day=N` → 顯示該天
2. 今天的**裝置本地日期**落在 2027-05-20～2027-05-28 → 顯示對應天（例：今天 5/22 → Day3）
3. 其他情況一律顯示 Day1

### 日期處理注意
- **禁止** `new Date('2027-05-20')`（會被解析為 UTC，可能差一天）
- 用 `new Date(2027, 4, 20)` 建構，或將今天轉為本地 `YYYY-MM-DD` 字串後比對
- 判斷邏輯寫成純函式放在 `date.util.ts`，並撰寫單元測試涵蓋：行前、第一天、中間某天、最後一天、行程結束後

### itinerary.json 結構
```json
{
  "startDate": "2027-05-20",
  "days": [
    {
      "day": 1,
      "date": "2027-05-20",
      "title": "出發・抵達墨西哥城",
      "city": "Mexico City",
      "items": [
        {
          "time": "08:00",
          "title": "桃園機場集合",
          "location": "第二航廈",
          "note": "",
          "mapUrl": ""
        }
      ],
      "stay": "飯店名稱"
    }
  ]
}
```
- `time`、`location`、`note`、`mapUrl`、`stay` 皆可為空字串；空值欄位不顯示
- `mapUrl` 有值時顯示「地圖」連結，`target="_blank" rel="noopener"`

## 頁面二：攜帶物品頁（`/#/packing`）

### 功能
- 分三個層級，視覺上差異明顯（色彩對應見 DESIGN.md §7）：
  1. **極度重要**（磚紅色塊、置頂、較大卡片）：機票、簽證、旅遊保險、護照
  2. **建議攜帶**（森林綠色塊）
  3. **其他**（米白卡片＋細框）
- 每個物品可設定「準備期限」，顯示倒數天數，例如「剩 45 天」
  - 已過期 → `status-warn` 實心標籤「已過期限」
  - 30 天內 → 加粗並以 `status-warn` 小標籤強調
- 每個物品有勾選框，勾選狀態存在 `localStorage`（只影響本人裝置，讀寫需包 try/catch）

### packing.json 結構
```json
{
  "categories": [
    {
      "level": "critical",
      "label": "極度重要",
      "items": [
        { "id": "flight", "name": "機票", "deadline": "2027-01-31", "note": "確認姓名與護照相同" },
        { "id": "visa", "name": "簽證", "deadline": "2027-03-31", "note": "" },
        { "id": "insurance", "name": "旅遊保險", "deadline": "2027-05-10", "note": "" },
        { "id": "passport", "name": "護照", "deadline": "2027-02-28", "note": "效期需超過 6 個月" }
      ]
    },
    { "level": "recommended", "label": "建議攜帶", "items": [] },
    { "level": "other", "label": "其他", "items": [] }
  ]
}
```
- `level` 只能是 `critical` / `recommended` / `other`
- `deadline` 可為空字串（不顯示倒數）
- `id` 全檔唯一，作為 localStorage 的 key

## 頁面三：費用頁（`/#/costs`）

### 功能
- 唯讀，不提供任何新增、編輯、刪除功能
- 頂部顯示：每人應繳金額、全團已繳總額／應繳總額
- 列出每位成員一列：
  - 暱稱
  - 「已繳金額 / 應繳金額」（前端自動加總該成員 `payments` 的 `amount`）
  - 進度條
  - 狀態標籤（色彩對應 DESIGN.md 的 status tokens）：未繳（0 元）、部分繳交、已繳清（已繳 = 應繳）、超繳（已繳 > 應繳，提醒會退差額）
  - 右側「V」符號，點擊展開／收合該成員的繳費明細（符號旋轉 180°）
- 明細每筆顯示：轉帳日期、轉帳金額；無記錄時顯示「尚無繳費記錄」
- 明細依日期由舊到新排序

### payments.json 結構（只存三種資料：暱稱、轉帳日期、轉帳金額）
```json
{
  "due": 50000,
  "members": [
    {
      "nickname": "小明",
      "payments": [
        { "date": "2026-11-03", "amount": 20000 },
        { "date": "2026-12-15", "amount": 30000 }
      ]
    },
    { "nickname": "小華", "payments": [] }
  ]
}
```
- `due`：每人應繳金額（所有人相同）
- `date`：`YYYY-MM-DD`
- `amount`：正整數

## 資料驗證腳本 `scripts/validate-data.mjs`

用 Node 原生（不安裝額外套件）檢查 `public/data/` 三個檔案，任何錯誤即 `process.exit(1)` 並印出**哪個檔案、哪個位置、什麼錯**（中文訊息）：

- 三個檔案皆可被 `JSON.parse`
- itinerary：`days` 長度為 9；`day` 為 1～9 且連續；`date` 從 2027-05-20 連續到 2027-05-28
- packing：`level` 值合法；所有 `id` 唯一；`deadline` 為空字串或合法 `YYYY-MM-DD`
- payments：`due` 為正整數；`nickname` 非空且不重複；每筆 `date` 為合法 `YYYY-MM-DD`；`amount` 為正整數；不允許出現 `nickname`、`date`、`amount`、`payments`、`members`、`due` 以外的欄位（避免誤放個資）

`package.json` 加入 `"validate": "node scripts/validate-data.mjs"`。

## 部署 `.github/workflows/deploy.yml`

- 觸發：push 到 `main`，以及手動 `workflow_dispatch`
- 權限：`contents: read`、`pages: write`、`id-token: write`
- concurrency：group `pages`，`cancel-in-progress: true`
- 步驟：
  1. checkout
  2. setup-node（LTS，啟用 npm cache）
  3. `npm ci`
  4. `npm run validate`（失敗則停止，網站維持舊版）
  5. `npx ng build --configuration production --base-href "/${{ github.event.repository.name }}/"`
  6. 上傳 `dist/<專案名>/browser` 為 Pages artifact
  7. deploy-pages
- 使用官方 actions：`actions/checkout`、`actions/setup-node`、`actions/configure-pages`、`actions/upload-pages-artifact`、`actions/deploy-pages`（使用各自最新主版本）

## 日後資料更新流程（擁有者）

1. 到 github.com 的 repo，打開 `public/data/payments.json`（或其他 JSON）
2. 點鉛筆圖示編輯 → Commit changes
3. 到 Actions 分頁等待綠勾（約 1～2 分鐘）
4. 若出現紅叉，點進去看 validate 步驟的錯誤訊息修正即可；失敗期間網站維持舊版

## 第二階段（可選，先不做）

- PWA 離線瀏覽（`@angular/pwa`），讓旅途中網路不穩時仍能看行程
  - `ngsw-config.json` 中 `data/*.json` 必須設為 `dataGroups` 的 `freshness` 策略，避免看到舊的繳費資料
- 行程項目加入每日天氣或匯率資訊
