import React from 'react';
import { KPISummary, BrandMetric, TimeSeriesPoint } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber } from '../utils/analytics';
import { Sparkles, TrendingUp, Award, Zap, Store } from 'lucide-react';

interface ExecutiveInsightsProps {
  summary: KPISummary;
  brandMetrics: BrandMetric[];
  timeSeries: TimeSeriesPoint[];
  currency: CurrencyCode;
}

export const ExecutiveInsights: React.FC<ExecutiveInsightsProps> = ({
  summary,
  brandMetrics,
  timeSeries,
  currency
}) => {
  if (brandMetrics.length === 0) return null;

  // 1. Top Grossing Brand
  const topBrand = [...brandMetrics].sort((a, b) => b.totalSales - a.totalSales)[0];

  // 2. Highest Volume / Units Brand
  const topVolumeBrand = [...brandMetrics].sort((a, b) => b.totalUnits - a.totalUnits)[0];

  // 3. Peak sales period
  const peakPeriod = [...timeSeries].sort((a, b) => b.sales - a.sales)[0];

  // 4. Highest AOV Brand
  const highestAovBrand = [...brandMetrics].sort((a, b) => b.aov - a.aov)[0];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-orange-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          INSTAMART Executive Sales Highlights
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Insight 1: Top GMV Leader */}
        {topBrand && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-orange-700 font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Revenue Leader</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 capitalize">
              {topBrand.brand}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Generated <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(topBrand.totalSales, currency, true)}</span> Gross GMV across {topBrand.totalOrders.toLocaleString()} orders.
            </div>
          </div>
        )}

        {/* Insight 2: Volume Velocity */}
        {topVolumeBrand && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Top Volume Mover</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 capitalize">
              {topVolumeBrand.brand}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Delivered <span className="font-bold text-blue-700 tabular-nums">{formatNumber(topVolumeBrand.totalUnits)}</span> total units with top SKU: {topVolumeBrand.topProduct}.
            </div>
          </div>
        )}

        {/* Insight 3: Peak Demand Interval */}
        {peakPeriod && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Peak Demand Interval</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {peakPeriod.label}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Recorded <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(peakPeriod.sales, currency, true)}</span> across {peakPeriod.orders.toLocaleString()} orders.
            </div>
          </div>
        )}

        {/* Insight 4: Basket Size (AOV) Leader */}
        {highestAovBrand && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>Highest Basket Value</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 capitalize">
              {highestAovBrand.brand}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Leads average basket value at <span className="font-bold text-purple-700 tabular-nums">{formatCurrency(highestAovBrand.aov, currency)}</span> per order.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
