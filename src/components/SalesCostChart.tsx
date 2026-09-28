import React, { useState, useMemo } from 'react';
import { TimeSeriesPoint, TimeInterval } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber } from '../utils/analytics';
import { TrendingUp, BarChart3, LineChart, Package, Calendar, Award, Zap } from 'lucide-react';

interface SalesCostChartProps {
  data: TimeSeriesPoint[];
  interval: TimeInterval;
  currency: CurrencyCode;
  onIntervalChange?: (interval: TimeInterval) => void;
}

type ChartType = 'area' | 'brandComparison' | 'units';

export const SalesCostChart: React.FC<SalesCostChartProps> = ({
  data,
  interval,
  currency,
  onIntervalChange
}) => {
  const [chartType, setChartType] = useState<ChartType>('brandComparison');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  // Interval definitions
  const intervals: { id: TimeInterval; label: string }[] = [
    { id: 'daily', label: 'Daily (Days)' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  // Aggregated totals for top stats strip
  const { totalGmv, totalUnits, totalOrders, nafaTotalGmv, averxTotalGmv, peakPoint, maxSales, maxBrandSales, maxUnits } = useMemo<{
    totalGmv: number;
    totalUnits: number;
    totalOrders: number;
    nafaTotalGmv: number;
    averxTotalGmv: number;
    peakPoint: TimeSeriesPoint | null;
    maxSales: number;
    maxBrandSales: number;
    maxUnits: number;
  }>(() => {
    let gmv = 0;
    let units = 0;
    let orders = 0;
    let nafaGmv = 0;
    let averxGmv = 0;
    let peak: TimeSeriesPoint | null = null;
    let salesMax = 0;
    let brandSalesMax = 0;
    let unitsMax = 0;

    data.forEach((d) => {
      gmv += d.sales;
      units += d.units;
      orders += d.orders;
      const nSales = d.nafaSales ?? 0;
      const aSales = d.averxSales ?? 0;
      nafaGmv += nSales;
      averxGmv += aSales;

      if (!peak || d.sales > peak.sales) {
        peak = d;
      }
      if (d.sales > salesMax) salesMax = d.sales;
      if (nSales > brandSalesMax) brandSalesMax = nSales;
      if (aSales > brandSalesMax) brandSalesMax = aSales;
      if (d.units > unitsMax) unitsMax = d.units;
    });

    return {
      totalGmv: gmv,
      totalUnits: units,
      totalOrders: orders,
      nafaTotalGmv: nafaGmv,
      averxTotalGmv: averxGmv,
      peakPoint: peak,
      maxSales: Math.max(1000, salesMax * 1.15),
      maxBrandSales: Math.max(1000, brandSalesMax * 1.2),
      maxUnits: Math.max(10, unitsMax * 1.2)
    };
  }, [data]);

  // Handle empty state
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-sm">No sales records found for this selection.</p>
        <p className="text-xs text-slate-400 mt-1">Try selecting a different date range or brand filter.</p>
      </div>
    );
  }

  // Cap density for smooth SVG rendering
  const displayData = data.length > 70 ? data.slice(-70) : data;
  const count = displayData.length;

  // SVG dimensions
  const svgWidth = 920;
  const svgHeight = 340;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / Math.max(1, count - 1)) * innerWidth;
  const getY = (val: number, max: number) => padding.top + innerHeight - (val / Math.max(1, max)) * innerHeight;

  // Generate smooth cubic bezier curve for Area Chart
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const salesPoints = displayData.map((d, i) => ({ x: getX(i), y: getY(d.sales, maxSales) }));
  const smoothLinePath = createSmoothPath(salesPoints);
  const smoothAreaPath = salesPoints.length > 0
    ? `${smoothLinePath} L ${salesPoints[salesPoints.length - 1].x} ${padding.top + innerHeight} L ${salesPoints[0].x} ${padding.top + innerHeight} Z`
    : '';

  // Bar chart measurements
  const slotWidth = innerWidth / count;
  const barGroupWidth = Math.max(8, Math.min(40, slotWidth * 0.75));
  const singleBarWidth = barGroupWidth / 2 - 1.5;

  // Active hover point
  const activePoint = hoveredIndex !== null ? displayData[hoveredIndex] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Top Header with Interval Selector & Chart Type Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  INSTAMART Sales & GMV Velocity
                </h3>
                <span className="text-[11px] uppercase font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {interval} View
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizing NAFA & averX sales volume, units delivered, and order velocity
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interval Quick Switcher */}
          {onIntervalChange && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              {intervals.map((it) => (
                <button
                  key={it.id}
                  onClick={() => onIntervalChange(it.id)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    interval === it.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {it.label}
                </button>
              ))}
            </div>
          )}

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setChartType('brandComparison')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartType === 'brandComparison'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>NAFA vs averX</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Total GMV</span>
            </button>
            <button
              onClick={() => setChartType('units')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartType === 'units'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Units</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 font-semibold block">Total Visible GMV</span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
            {formatCurrency(totalGmv, currency)}
          </span>
        </div>
        <div>
          <span className="text-orange-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> NAFA GMV
          </span>
          <span className="text-base sm:text-lg font-extrabold text-orange-950 font-mono">
            {formatCurrency(nafaTotalGmv, currency)}
          </span>
        </div>
        <div>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> averX GMV
          </span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-950 font-mono">
            {formatCurrency(averxTotalGmv, currency)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block">Peak Period</span>
          <span className="text-sm font-bold text-slate-800">
            {peakPoint ? `${peakPoint.label} (${formatCurrency(peakPoint.sales, currency)})` : 'N/A'}
          </span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Smooth Orange-Yellow Gradient for Total GMV Area */}
            <linearGradient id="gmvAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>

            {/* NAFA Bar Gradient */}
            <linearGradient id="nafaBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>

            {/* averX Bar Gradient */}
            <linearGradient id="averxBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Units Bar Gradient */}
            <linearGradient id="unitsBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * (1 - pct);
            const val = (chartType === 'units' ? maxUnits : chartType === 'brandComparison' ? maxBrandSales : maxSales) * pct;

            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {chartType === 'units' ? formatNumber(val) : formatCurrency(val, currency, true)}
                </text>
              </g>
            );
          })}

          {/* 1. Area Chart Mode */}
          {chartType === 'area' && (
            <g>
              {/* Shaded Area */}
              <path d={smoothAreaPath} fill="url(#gmvAreaGradient)" />

              {/* Bold Trend Line */}
              <path
                d={smoothLinePath}
                fill="none"
                stroke="#ea580c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {count <= 40 && salesPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                />
              ))}
            </g>
          )}

          {/* 2. Brand Comparison Mode (NAFA vs averX side-by-side) */}
          {chartType === 'brandComparison' && (
            <g>
              {displayData.map((d, idx) => {
                const groupCenterX = padding.left + (idx + 0.5) * slotWidth;
                const nafaVal = d.nafaSales ?? 0;
                const averxVal = d.averxSales ?? 0;

                const nafaHeight = Math.max(2, (nafaVal / maxBrandSales) * innerHeight);
                const averxHeight = Math.max(2, (averxVal / maxBrandSales) * innerHeight);

                const nafaX = groupCenterX - singleBarWidth - 1;
                const averxX = groupCenterX + 1;
                const nafaY = padding.top + innerHeight - nafaHeight;
                const averxY = padding.top + innerHeight - averxHeight;

                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx} opacity={hoveredIndex === null || isHovered ? 1 : 0.45}>
                    {/* NAFA Bar */}
                    <rect
                      x={nafaX}
                      y={nafaY}
                      width={singleBarWidth}
                      height={nafaHeight}
                      rx="3"
                      fill="url(#nafaBarGrad)"
                    />
                    {/* averX Bar */}
                    <rect
                      x={averxX}
                      y={averxY}
                      width={singleBarWidth}
                      height={averxHeight}
                      rx="3"
                      fill="url(#averxBarGrad)"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 3. Units Volume Mode */}
          {chartType === 'units' && (
            <g>
              {displayData.map((d, idx) => {
                const groupCenterX = padding.left + (idx + 0.5) * slotWidth;
                const barH = Math.max(3, (d.units / maxUnits) * innerHeight);
                const bX = groupCenterX - barGroupWidth / 2;
                const bY = padding.top + innerHeight - barH;
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx} opacity={hoveredIndex === null || isHovered ? 1 : 0.45}>
                    <rect
                      x={bX}
                      y={bY}
                      width={barGroupWidth}
                      height={barH}
                      rx="4"
                      fill="url(#unitsBarGrad)"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Hover Crosshair & Indicator */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={chartType === 'area' ? getX(hoveredIndex) : padding.left + (hoveredIndex + 0.5) * slotWidth}
                y1={padding.top}
                x2={chartType === 'area' ? getX(hoveredIndex) : padding.left + (hoveredIndex + 0.5) * slotWidth}
                y2={padding.top + innerHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {chartType === 'area' && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(displayData[hoveredIndex].sales, maxSales)}
                  r="6"
                  fill="#ea580c"
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="animate-pulse"
                />
              )}
            </g>
          )}

          {/* X Axis Labels */}
          {displayData.map((d, idx) => {
            // Determine label skip based on density
            const step = Math.max(1, Math.ceil(count / 12));
            if (idx % step !== 0 && idx !== count - 1) return null;

            const x = chartType === 'area' ? getX(idx) : padding.left + (idx + 0.5) * slotWidth;
            const y = padding.top + innerHeight + 18;

            return (
              <text
                key={idx}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#64748b"
              >
                {d.label}
              </text>
            );
          })}

          {/* Interactive Mouse Hover Overlay Rectangles */}
          {displayData.map((_, idx) => {
            const slotX = padding.left + idx * slotWidth;

            return (
              <rect
                key={idx}
                x={slotX}
                y={padding.top}
                width={slotWidth}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div
            className="absolute top-4 right-4 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md min-w-[210px] text-xs transition-all z-20"
          >
            <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center justify-between">
              <span>{activePoint.label}</span>
              <span className="text-[10px] text-orange-400 font-mono uppercase">{interval}</span>
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="font-sans text-slate-300">Total GMV:</span>
                <span className="text-orange-400 font-extrabold">{formatCurrency(activePoint.sales, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-orange-300 text-[11px] pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> NAFA:
                </span>
                <span>{formatCurrency(activePoint.nafaSales ?? 0, currency)} ({activePoint.nafaUnits ?? 0} pcs)</span>
              </div>

              <div className="flex items-center justify-between text-emerald-300 text-[11px]">
                <span className="flex items-center gap-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> averX:
                </span>
                <span>{formatCurrency(activePoint.averxSales ?? 0, currency)} ({activePoint.averxUnits ?? 0} pcs)</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                <span className="font-sans">Units Sold:</span>
                <span>{formatNumber(activePoint.units)} units</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-sans">Orders:</span>
                <span>{formatNumber(activePoint.orders)} orders</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend & Table Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-3 h-3 rounded bg-orange-600"></span>
            <span>NAFA (Electronics & Accessories)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-3 h-3 rounded bg-emerald-600"></span>
            <span>averX (Kitchen & Grooming)</span>
          </div>
        </div>

        <button
          onClick={() => setShowDataTable(!showDataTable)}
          className="text-orange-700 hover:text-orange-900 font-bold hover:underline cursor-pointer"
        >
          {showDataTable ? 'Hide Interval Data Table' : 'Show Detailed Period Breakdown Table ▼'}
        </button>
      </div>

      {/* Optional Detailed Period Breakdown Table */}
      {showDataTable && (
        <div className="mt-4 border border-slate-200 rounded-lg overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3 text-right">NAFA GMV</th>
                <th className="py-2.5 px-3 text-right">averX GMV</th>
                <th className="py-2.5 px-3 text-right">Total GMV (₹)</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {displayData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-sans font-semibold text-slate-900">{d.label}</td>
                  <td className="py-2 px-3 text-right font-bold text-orange-700">{formatCurrency(d.nafaSales ?? 0, currency)}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatCurrency(d.averxSales ?? 0, currency)}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-50/50">{formatCurrency(d.sales, currency)}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{formatNumber(d.units)}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{formatNumber(d.orders)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {formatCurrency(d.orders > 0 ? d.sales / d.orders : 0, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
