# 📈 Trading Platform

港股/美股智能交易平台，結合技術分析、策略回測和價格預測。

🔗 **Live Demo:** https://trading-platform-ten.vercel.app/

---

## 📌 重點功能

| 功能 | 說明 |
|------|------|
| 📊 實時報價 | 港股/美股實時股票報價 |
| 📈 蠟燭圖 | 互動式 K 線圖表，支援技術指標 |
| 🔍 股票搜尋 | 快速搜尋港股/美股代碼 |
| 📉 策略回測 | 5 種技術指標策略回測 |
| 🧮 技術分析 | MA、RSI、MACD、布林帶、動量指標 |
| 🔮 價格預測 | 多模型 AI 價格預測 |
| 💰 資金管理 | 可自訂起始資金計算回報 |

---

## 📖 詳細功能說明

### 股票搜尋
- 輸入股票代碼或名稱搜尋
- 支援港股（5位數）和美股
- 快速切換不同股票

### K 線圖表
- 顯示股票歷史價格走勢
- 可查看不同時間週期
- 疊加技術指標線

### 技術指標

| 指標 | 說明 |
|------|------|
| **MA (移動平均線)** | 短期/長期 MA 交叉信號 |
| **RSI (相對強弱指數)** | 超買/超賣判斷 |
| **MACD (平滑異同移動平均線)** | 趨勢判斷 |
| **布林帶 (Bollinger Bands)** | 價格波動範圍 |
| **動量指標 (Momentum)** | 價格變化速率 |

### 策略回測
- 基於上述技術指標的交易策略
- 可調整策略參數（週期、天數等）
- 計算回測收益率
- 顯示買入/賣出信號

### 價格預測
- 多模型價格預測
- 預測未來趨勢
- 參考價值（非投資建議）

---

## 🛠 技術棧

| 技術 | 用途 |
|------|------|
| **Next.js 15** | React 框架 |
| **TypeScript** | 程式語言 |
| **Tailwind CSS** | 樣式設計 |
| **Recharts** | 圖表渲染 |
| **Vercel API** | Serverless Functions |
| **Finance API** | 股票數據 |

---

## 🏗 架構

```
trading-platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── stock/           ← API 路由
│   │   │       ├── quote/       ← 實時報價
│   │   │       ├── search/      ← 股票搜尋
│   │   │       └── history/     ← 歷史數據
│   │   ├── page.tsx             ← 主頁面
│   │   └── layout.tsx           ← 佈局
│   └── types/
│       └── stock.ts             ← 類型定義
└── public/                      ← 靜態資源
```

### 主要組件

| 組件 | 功能 |
|------|------|
| `StockSearch` | 股票搜尋輸入 |
| `StockChart` | K 線圖表 + 指標 |
| `BacktestPanel` | 策略參數 + 回測結果 |
| `PredictionPanel` | 價格預測顯示 |

---

## ⚠️ 投資警告

- 本平台僅供學習和參考用途
- 過去表現不代表未來回報
- 實際投資需自行承擔風險
- 請勿將預測結果作為投資建議

---

## 📝 License

MIT License

Copyright (c) 2026 Raymond Lam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
