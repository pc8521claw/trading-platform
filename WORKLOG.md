# WORKLOG - Trading Platform

## 2026-05-21

### 修復：起始資金輸入框無法空白

**問題：** 瀏覽器自動填充/自動補零，用戶無法將輸入框留空

**嘗試方案：**
1. 使用 `useState` 控制 → 無法空白
2. 使用 `useRef` + `defaultValue` → 仍然自動補零
3. 移除 `inputMode="numeric"` → 仍然自動補零
4. 加入 `autoComplete="off"` → 仍然自動補零

**最終解決：** 使用 `type="text"` + `defaultValue="10000"` + `useRef` 直接讀取 DOM 值

```typescript
const capitalInputRef = useRef<HTMLInputElement>(null);

const handleBacktest = () => {
  const capitalInput = capitalInputRef.current?.value || '';
  const capital = parseInt(capitalInput) || 10000;
  // ...
};
```

---

### 修復：策略參數調整無效

**問題：** 用戶調整策略參數（slider）時，後面顯示的數值不變，回測結果也不變

**根本原因：**
1. STRATEGIES 配置用中文名稱（如 "短期MA"）作為 param key
2. 但 `runBacktest()` 函數期望英文 key（如 `shortMA`）
3. 導致參數更新時 key 不匹配

**解決方案：**
1. STRATEGIES param 新增 `key` 欄位對應英文 key
```typescript
params: [
  { key: 'shortMA', name: '短期MA', min: 5, max: 50, step: 5, default: 20 },
  { key: 'longMA', name: '長期MA', min: 20, max: 200, step: 10, default: 50 },
]
```
2. BacktestPanel 改用 `param.key` 讀取/更新參數

---

### 修復：參數數值不更新（第三次修復）

**問題：** 參數調整時，label 旁邊的數值不更新

**根本原因：** 使用單一 `useState<Record<string, number>>` 管理所有參數，但更新邏輯混亂

**解決方案：** 完全重寫 BacktestPanel，改用**獨立 useState** 每個參數

```typescript
// 獨立 state
const [shortMA, setShortMA] = useState(20);
const [longMA, setLongMA] = useState(50);
const [rsiPeriod, setRsiPeriod] = useState(14);
const [oversold, setOversold] = useState(30);
const [overbought, setOverbought] = useState(70);
const [bbPeriod, setBbPeriod] = useState(20);
const [bbStd, setBbStd] = useState(2);
const [momentumPeriod, setMomentumPeriod] = useState(10);

// 統一 handler
const handleParamChange = (key: string, value: number) => {
  switch (key) {
    case 'shortMA': setShortMA(value); break;
    case 'longMA': setLongMA(value); break;
    // ...
  }
};

// 取值 helper
const getParamValue = (key: string): number => {
  switch (key) {
    case 'shortMA': return shortMA;
    // ...
  }
};
```

---

### 優化：股票代碼預設值

**問題：** 輸入框有預設值（使用 `selectedSymbol`）

**解決：** `useState('')` 設為空字串

---

### 優化：股票篩選器標示開發中

**問題：** 功能尚未實現但冇說明

**解決：** 
- 頂部加入黃色提示框「🚧 開發中」
- 按鈕停用並顯示「執行篩選 (開發中)」
- 底部說明加上「- 開發中」

---

### 新增：圖表技術指標功能

**功能：** 在股價走勢圖上顯示移動平均線和布林帶

**實現方式：**
- MA20/50/200：使用 `Line` 組件
- 布林帶：使用 `Area` 組件（上下軌）
- 每個指標有獨立開關按鈕

**代碼位置：** `StockChart.tsx`

---

### 新增：成交量柱狀圖紅綠分色

**問題：** 成交量柱狀圖只有單一灰色，無法一眼看出價格漲跌

**解決：** 使用 Recharts 的 `Cell` 組件根據股價漲跌設置顏色

```typescript
// 根據收盤價 vs 開盤價決定顏色
volumeColor: q.close >= (q.open || q.close) ? '#22C55E' : '#EF4444'

// 使用 Cell component
<Bar dataKey="volume" opacity={0.8}>
  {data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.volumeColor} />
  ))}
</Bar>
```

---

### 部署記錄
- 2026-05-21 18:05 - Next.js 重啟，運行於 http://192.168.31.249:3011
- 2026-05-21 18:04 - 成交量柱狀圖紅綠分色完成
- 2026-05-21 18:02 - 圖表技術指標功能完成
- 2026-05-21 17:56 - 股票篩選器標示「開發中」完成
- 2026-05-21 15:56 - 策略參數系統重構完成
- 2026-05-21 15:54 - 股票代碼預設值清空完成
## 2026-05-22

### 修復：市值 (marketCap) 顯示問題

**問題：** 市值一直顯示 N/A 或 0，無法取得市值數據

**根本原因：**
- Yahoo Finance chart endpoint 不穩定返回 marketCap
- 某些股票根本冇 marketCap 數據

**解決方案：**
- 使用 **yfinance** Python 庫取代直接 HTTP 調用 Yahoo API
- yfinance 穩定返回 marketCap 和 sharesOutstanding

**修改檔案：**
1. `app/api/stock/quote/route.ts` - 使用 child_process 執行 Python yfinance 腳本
2. `src/types/stock.ts` - 加入 sharesOutstanding 可選欄位
3. `src/lib/stock-api.ts` - 支援新的直接返回格式

**Python yfinance 代碼：**
```python
import yfinance as yf
ticker = yf.Ticker("AAPL")
info = ticker.info
marketCap = info.get('marketCap')  # 穩定返回
```

**驗證結果：**
```json
{
  "marketCap": 4479496749056,  // 約 $4.48T
  "sharesOutstanding": 14687356000,
  "price": 304.99,
  "symbol": "AAPL"
}
```

**部署狀態：** http://192.168.31.249:3011

## 2026-05-24

### 新增：價格預測趨勢圖表

**功能：**
- 預測趨勢線（紫色）
- 95% 信心區間（紫色區域）
- 信心區間隨預測天數擴大
- 顯示預測區間數值（最低→預測→最高）

**修改檔案：**
- `src/lib/indicators.ts` - predictPrice 函數加入 predictedPrices（含 upper/lower）
- `src/types/stock.ts` - Prediction interface 加入 predictedPrices
- `src/components/PredictionPanel.tsx` - 使用 ComposedChart + Area 顯示信心區間

**信心區間計算：**
- 標準誤差基於歷史擬合殘差
- 95% 區間使用 1.96 倍標準誤差
- 區間寬度 = 標準誤差 × 1.96 × (1 + 天數/總天數×2)

## 2026-05-25 - 港股搜尋功能 + 基本篩選器

### 新增功能 1: 港股搜尋
- 更新 `/api/stock/search` 直接從 Yahoo Finance 取名稱
- 港股公司名稱直接顯示（Yahoo 有中文就出中文，否則出英文）
- 熱門股票快捷按鈕：騰訊、匯豐、阿里、小米、比亞迪、友邦、平安、工行

### 新增功能 2: 基本股票篩選器
- 篩選條件：市值（大型/中型/小型）、股價範圍、成交量、行業板塊
- 顯示符合條件的股票列表
- 支援重置篩選

### 修改檔案
- `src/app/api/stock/search/route.ts` - 簡化搜尋邏輯，直接用 Yahoo 名稱
- `src/components/StockSearch.tsx` - 新增搜尋元件（取代 StockInput）
- `src/components/ScreenerPanel.tsx` - 重寫加入真實篩選功能
- `src/app/page.tsx` - 引入 StockSearch

## 2026-05-26 - RSI 技術指標新增

### 功能
- StockChart 加入 RSI 按鈕
- 點擊顯示 RSI 走勢圖（獨立區塊）
- RSI > 70 顯示超買提示
- RSI < 30 顯示超賣提示
- 使用 LineChart + ReferenceLine 顯示

### 修復
- RSI slice 計算錯誤：`slice(i-14, i+1)` 而非 `slice(i-13, i+1)`
- RSI 需要 14 次價格變化（15 個價格數據點）

### 修改檔案
- `src/components/StockChart.tsx` - 加入 RSI 計算與顯示

## 2026-05-26 - 多模型預測系統

### 新增功能
- 4個預測模型：線性回歸、均值回歸、動量、價格通道
- 集成加權平均預測
- 可切換顯示全部模型或只看集成平均
- 模型權重與置信度顯示

### 修改檔案
- `src/lib/indicators.ts` - 新增 `predictPriceEnsemble` 函數
- `src/components/PredictionPanel.tsx` - 重寫顯示多模型結果

### 修復
- 置信度計算錯誤：從用未來價格 R-squared 改為用歷史價格穩定性（變異系數）

## 2026-05-26 - 多模型置信度修復

### 問題
所有模型顯示相同置信度（67% → 20%）

### 修復
- 每個模型使用不同基礎置信度（75/70/55/65）
- 加入模型穩定性權重（0.8/0.85/0.6/0.7）
- 動量模型最波動（基礎55%），線性回歸最穩定（75%）

### 修改
- `src/lib/indicators.ts` - predictPriceEnsemble 置信度計算

## 2026-05-28 - 基本面數據新增

### 新增功能
- 基本面數據面板（P/E、EPS、帳面價值、增長率、股息率等）
- 港股顯示 HK$ 單位（較細較淺色）
- 美股不顯示單位

### 修改檔案
- `src/app/api/stock/quote/route.ts` - 新增基本面數據
- `src/types/stock.ts` - 更新 StockInfo interface
- `src/lib/stock-api.ts` - 傳遞基本面數據
- `src/components/StockInfo.tsx` - 重寫顯示版面

### 修復問題
- 基本面數據全部 N/A：因 stock-api.ts 未傳遞數據
- 股息率顯示為小數而非百分比：已修正格式化

## 2026-05-28 - 單位顯示修正

### 修改
- 港股/美股統一顯示 $ 符號（細字淺灰色）
- 港股顯示 HK$，美股顯示 $
- 市值、52週高/低、EPS、帳面價值 都顯示 $
