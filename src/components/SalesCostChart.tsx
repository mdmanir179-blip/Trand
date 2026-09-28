import React, { useState, useMemo } from 'react';
import { TimeSeriesPoint, TimeInterval } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber } from '../utils/analytics';
import { TrendingUp, BarChart, ShoppingBag, Box } from 'lucide-react';

interface SalesCostChartProps {
  data: TimeSeriesPoint[];
  interval: TimeInterval;
  currency: CurrencyCode;
}

type ChartViewMode = 'sales' | 'salesAndUnits' | 'orders';

export const SalesCostChart: React.FC<SalesCostChartProps> = ({
  data,
  interval,
  currency
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('salesAndUnits');

  // Chart Dimensions
  const height = 320;
  const padding = { top: 25, right: 50, bottom: 45, left: 65 };

  // Calculate scales
  const { maxSales, maxUnits } = useMemo(() => {
    let salesMax = 0;
    let unitsMax = 0;
    data.forEach(d => {
      if (d.sales > salesMax) salesMax = d.sales;
      if (d.units > unitsMax) unitsMax = d.units;
    });
    return {
      maxSales: Math.max(1000, salesMax * 1.15),
      maxUnits: Math.max(10, unitsMax * 1.2)
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        <BarChart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-sm">No sales records found for this selection.</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your brand, product, or date filters.</p>
      </div>
    );
  }

  // Cap density for smooth rendering
  const displayData = data.length > 80 ? data.slice(-80) : data;
  const count = displayData.length;

  const chartWidth = 900;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / Math.max(1, count - 1)) * innerWidth;
  const getY = (val: number, max: number) => padding.top + innerHeight - (val / Math.max(1, max)) * innerHeight;

  // Bar dimensions
  const barWidth = Math.max(4, Math.min(32, (innerWidth / count) * 0.65));

  // Generate path for Units Sold line
  const unitsPath = useMemo(() => {
    if (count < 2) return '';
    return displayData.map((d, i) => {
      const x = getX(i);
      const y = getY(d.units, maxUnits);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [displayData, maxUnits, count]);

  const activePoint = hoveredIndex !== null ? displayData[hoveredIndex] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <BarChart className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              INSTAMART Sales & GMV Velocity
            </h3>
            <span className="text-xs uppercase bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
              {interval} View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking Gross GMV (Sales) and volume delivered across selected intervals
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setChartViewMode('salesAndUnits')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'salesAndUnits'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GMV & Units
          </button>
          <button
            onClick={() => setChartViewMode('sales')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'sales'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GMV Only
          </button>
          <button
            onClick={() => setChartViewMode('orders')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Legend & Stats Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-orange-500"></span>
            <span className="text-slate-700 font-semibold">Gross GMV (₹)</span>
          </div>
          {viewMode === 'salesAndUnits' && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-600"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 -ml-2.5"></span>
              <span className="text-slate-700 font-semibold ml-1">Units Sold</span>
            </div>
          )}
          {viewMode === 'orders' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
              <span className="text-slate-700 font-semibold">Orders Count</span>
            </div>
          )}
        </div>

        {activePoint ? (
          <div className="font-mono text-xs flex items-center gap-3 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="font-bold text-slate-900">{activePoint.label}:</span>
            <span className="text-orange-700 font-bold">
              GMV: {formatCurrency(activePoint.sales, currency)}
            </span>
            <span className="text-blue-700 font-bold">
              Units: {formatNumber(activePoint.units)}
            </span>
            <span className="text-slate-700">
              Orders: {formatNumber(activePoint.orders)}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">
            Hover over any bar to view exact details
          </span>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + innerHeight * (1 - pct);
            const val = maxSales * pct;
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-medium"
                >
                  {formatCurrency(val, currency, true)}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis for Units if enabled */}
          {viewMode === 'salesAndUnits' && [0, 0.5, 1].map((pct) => {
            const y = padding.top + innerHeight * (1 - pct);
            const val = Math.round(maxUnits * pct);
            return (
              <text
                key={`units-${pct}`}
                x={chartWidth - padding.right + 8}
                y={y + 3}
                textAnchor="start"
                className="text-[10px] font-mono fill-blue-600 font-bold"
              >
                {val} u
              </text>
            );
          })}

          {/* Bars */}
          {displayData.map((d, i) => {
            const x = getX(i) - barWidth / 2;
            const primaryVal = viewMode === 'orders' ? d.orders : d.sales;
            const primaryMax = viewMode === 'orders' ? Math.max(...displayData.map(p => p.orders)) * 1.2 : maxSales;
            const y = getY(primaryVal, primaryMax);
            const barHeight = Math.max(2, padding.top + innerHeight - y);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.periodKey}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Highlight background column */}
                {isHovered && (
                  <rect
                    x={x - barWidth * 0.4}
                    y={padding.top}
                    width={barWidth * 1.8}
                    height={innerHeight}
                    fill="#ffedd5"
                    opacity="0.3"
                    rx="4"
                  />
                )}

                {/* Main bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={viewMode === 'orders' ? '#3b82f6' : '#f97316'}
                  rx="3"
                  className="transition-all duration-150"
                  opacity={hoveredIndex === null || isHovered ? 1 : 0.65}
                />
              </g>
            );
          })}

          {/* Units Sold Trendline */}
          {viewMode === 'salesAndUnits' && unitsPath && (
            <g pointerEvents="none">
              <path
                d={unitsPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {displayData.map((d, i) => {
                const cx = getX(i);
                const cy = getY(d.units, maxUnits);
                const isHovered = hoveredIndex === i;
                return (
                  <circle
                    key={`dot-${d.periodKey}`}
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 2.5}
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />
                );
              })}
            </g>
          )}

          {/* X-Axis labels */}
          {displayData.map((d, i) => {
            const step = Math.ceil(count / 10);
            if (i % step !== 0 && i !== count - 1) return null;

            const x = getX(i);
            const y = height - padding.bottom + 16;
            return (
              <text
                key={`label-${d.periodKey}`}
                x={x}
                y={y}
                textAnchor="middle"
                className="text-[10px] font-sans fill-slate-500 font-medium"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Period-by-Period Breakdown Table */}
      <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="pb-2">Period</th>
              <th className="pb-2 text-right">Gross GMV (₹)</th>
              <th className="pb-2 text-right">Units Sold</th>
              <th className="pb-2 text-right">Total Orders</th>
              <th className="pb-2 text-right">AOV (Basket)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {displayData.slice(-6).reverse().map((p) => {
              const aov = p.orders > 0 ? p.sales / p.orders : 0;
              return (
                <tr key={p.periodKey} className="hover:bg-slate-50">
                  <td className="py-1.5 font-sans font-bold text-slate-800">{p.label}</td>
                  <td className="py-1.5 text-right font-bold text-orange-700">
                    {formatCurrency(p.sales, currency)}
                  </td>
                  <td className="py-1.5 text-right text-slate-800">{formatNumber(p.units)}</td>
                  <td className="py-1.5 text-right text-slate-700">{formatNumber(p.orders)}</td>
                  <td className="py-1.5 text-right text-slate-600">{formatCurrency(aov, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
