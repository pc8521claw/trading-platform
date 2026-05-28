"use client";

import { useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StockQuote, Prediction } from '@/types/stock';
import { predictPrice, predictPriceEnsemble, EnsemblePrediction } from '@/lib/indicators';

interface PredictionPanelProps {
  quotes: StockQuote[];
  symbol: string;
  currentPrice: number;
}

// Model colors
const MODEL_COLORS = {
  '線性回歸': '#3B82F6',
  '均值回歸': '#10B981',
  '動量': '#F59E0B',
  '價格通道': '#EC4899',
  '集成平均': '#8B5CF6',
};

interface MultiModelPrediction extends Prediction {
  ensemblePrediction: EnsemblePrediction;
}

export default function PredictionPanel({ quotes, symbol, currentPrice }: PredictionPanelProps) {
  const [days, setDays] = useState(30);
  const [prediction, setPrediction] = useState<MultiModelPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  const handlePredict = () => {
    if (quotes.length < 30) {
      alert('需要更多歷史數據進行預測');
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      // Get single model prediction (for backwards compatibility)
      const singleResult = predictPrice(quotes, days);
      
      // Get multi-model ensemble prediction
      const ensembleResult = predictPriceEnsemble(quotes, days);
      
      setPrediction({
        symbol,
        currentPrice,
        predictedPrice: singleResult.predictedPrice,
        expectedChange: singleResult.expectedChange,
        confidence: singleResult.confidence,
        days,
        predictedPrices: singleResult.predictedPrices,
        ensemblePrediction: ensembleResult,
      });
      setLoading(false);
    }, 800);
  };

  // Prepare chart data with all model predictions
  const chartData = prediction?.predictedPrices ? [
    // Historical prices (last 30 days)
    ...quotes.slice(-30).map((q, i, arr) => ({
      day: -(arr.length - 1 - i),
      price: q.close,
      type: 'historical',
    })),
    // Current day
    {
      day: 0,
      price: currentPrice,
      type: 'current',
    },
    // Predicted prices with confidence interval
    ...prediction.predictedPrices.map(p => ({
      day: p.day,
      price: p.price,
      upper: p.upper,
      lower: p.lower,
      type: 'predicted',
    })),
  ] : null;

  // Multi-model chart data
  const multiModelChartData = prediction?.ensemblePrediction ? 
    prediction.ensemblePrediction.ensemblePrices.map((price, i) => {
      const data: any = { day: i + 1 };
      
      // Add each model's prediction at day i
      prediction.ensemblePrediction.models.forEach(model => {
        data[model.name] = model.predictedPrices[i];
      });
      data['集成平均'] = price;
      
      return data;
    }) : null;

  if (!symbol) {
    return (
      <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
        請先選擇股票
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 價格預測</h3>
      
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            預測天數
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>7 天</option>
            <option value={14}>14 天</option>
            <option value={30}>30 天</option>
            <option value={60}>60 天</option>
            <option value={90}>90 天</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setShowAllModels(!showAllModels)}
            className={`px-4 py-2 rounded-lg transition ${
              showAllModels 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showAllModels ? '隱藏模型' : '顯示全部'}
          </button>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || quotes.length < 30}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {loading ? '計算中...' : '執行多模型預測'}
      </button>

      {prediction && (
        <div className="mt-6 space-y-4">
          {/* Multi-Model Chart */}
          {multiModelChartData && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase mb-2">多模型預測比較</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={multiModelChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `+${value}`}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                    axisLine={{ stroke: '#d1d5db' }}
                    width={50}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name as string]}
                    labelFormatter={(label) => `第 ${label} 天`}
                    contentStyle={{ fontSize: 11 }}
                  />
                  
                  {/* Show individual model lines if toggled */}
                  {showAllModels && prediction.ensemblePrediction.models.map(model => (
                    <Line
                      key={model.name}
                      type="monotone"
                      dataKey={model.name}
                      stroke={MODEL_COLORS[model.name as keyof typeof MODEL_COLORS] || '#999'}
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="5 5"
                      connectNulls
                    />
                  ))}
                  
                  {/* Ensemble average line */}
                  <Line
                    type="monotone"
                    dataKey="集成平均"
                    stroke={MODEL_COLORS['集成平均']}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {showAllModels && prediction.ensemblePrediction.models.map(model => (
                  <span key={model.name} className="flex items-center gap-1 text-xs">
                    <span 
                      className="w-3 h-0.5" 
                      style={{ backgroundColor: MODEL_COLORS[model.name as keyof typeof MODEL_COLORS] }}
                    ></span>
                    {model.name}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-3 h-0.5 bg-purple-500"></span>
                  集成平均
                </span>
              </div>
            </div>
          )}

          {/* Model Comparison Table */}
          {prediction.ensemblePrediction && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase mb-2">模型權重與置信度</p>
              <div className="grid grid-cols-2 gap-2">
                {prediction.ensemblePrediction.models.map(model => (
                  <div key={model.name} className="bg-white rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{model.name}</span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: MODEL_COLORS[model.name as keyof typeof MODEL_COLORS] + '20',
                          color: MODEL_COLORS[model.name as keyof typeof MODEL_COLORS]
                        }}
                      >
                        {(model.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${model.confidence}%`,
                          backgroundColor: MODEL_COLORS[model.name as keyof typeof MODEL_COLORS]
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      置信: {model.confidence.toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">集成平均置信度</span>
                  <span className="text-sm font-bold text-purple-600">
                    {prediction.ensemblePrediction.avgConfidence.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ensemble Stats */}
          {prediction.ensemblePrediction && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">現在</p>
                <p className="text-lg font-bold">${currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-purple-500 uppercase">30天目標</p>
                <p className="text-lg font-bold text-purple-600">
                  ${prediction.ensemblePrediction.ensemblePrices[29]?.toFixed(2) || '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">預期變化</p>
                <p className={`text-lg font-bold ${prediction.expectedChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {prediction.expectedChange >= 0 ? '+' : ''}{prediction.expectedChange.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500 uppercase">模型準確率</p>
              <p className="text-sm font-bold">{prediction.confidence.toFixed(0)}%</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * 預測僅供參考，不構成投資建議
            </p>
          </div>
        </div>
      )}
    </div>
  );
}