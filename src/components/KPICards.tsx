import React from 'react';
import { KPISummary } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import { TrendingUp, TrendingDown, ShoppingBag, Box, Store, Tag } from 'lucide-react';

interface KPICardsProps {
  summary: KPISummary;
  currency: CurrencyCode;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, currency }) => {
  const aov = summary.averageOrderValue ?? (summary.totalOrders > 0 ? summary.totalSales / summary.totalOrders : 0);
  const asp = summary.averageSellingPrice ?? (summary.totalUnits > 0 ? summary.totalSales / summary.totalUnits : 0);
  const salesGrowth = summary.periodGrowthSales ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Gross GMV (Sales) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Total Gross GMV</span>
          <div className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xs">
            ₹
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatCurrency(summary.totalSales, currency, true)}
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[11px]">
          {salesGrowth >= 0 ? (
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{formatPercent(salesGrowth)}
            </span>
          ) : (
            <span className="text-rose-600 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> {formatPercent(salesGrowth)}
            </span>
          )}
          <span className="text-slate-400">· vs prior</span>
        </div>
      </div>

      {/* 2. Total Units Sold */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Units Sold</span>
          <Box className="w-4 h-4 text-orange-600" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatNumber(summary.totalUnits)}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
          <span>Total items delivered</span>
        </div>
      </div>

      {/* 3. Total Orders */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Total Orders</span>
          <ShoppingBag className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatNumber(summary.totalOrders)}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
          <span>Fulfilled customer orders</span>
        </div>
      </div>

      {/* 4. Average Order Value (AOV) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Average Order Value</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">AOV</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatCurrency(aov, currency)}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
          <span>Per order basket size</span>
        </div>
      </div>

      {/* 5. Average Selling Price (ASP) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Average Selling Price</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">ASP</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatCurrency(asp, currency)}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
          <span>Per unit average value</span>
        </div>
      </div>

      {/* 6. Active Brands & Stores */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
          <span>Darkstores Covered</span>
          <Store className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {formatNumber(summary.activeStoresCount || 1)}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-500 font-semibold flex items-center gap-1">
          <Tag className="w-3 h-3 text-orange-500" />
          <span>{summary.activeBrandsCount} Brands Active</span>
        </div>
      </div>
    </div>
  );
};
