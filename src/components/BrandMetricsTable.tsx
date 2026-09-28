import React, { useState, useMemo } from 'react';
import { BrandMetric } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber } from '../utils/analytics';
import { ArrowUpDown, ArrowUp, ArrowDown, Building2, Search, Store, MapPin, Tag, Check, Award } from 'lucide-react';

interface BrandMetricsTableProps {
  brandMetrics: BrandMetric[];
  currency: CurrencyCode;
  selectedBrand: string;
  onSelectBrand: (brandName: string) => void;
}

type SortField = 'totalSales' | 'totalUnits' | 'totalOrders' | 'aov' | 'asp';
type SortOrder = 'asc' | 'desc';

export const BrandMetricsTable: React.FC<BrandMetricsTableProps> = ({
  brandMetrics,
  currency,
  selectedBrand,
  onSelectBrand
}) => {
  const [sortField, setSortField] = useState<SortField>('totalSales');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [search, setSearch] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Strictly filter to NAFA and averX brands as requested
  const nafaAndAverxMetrics = useMemo(() => {
    const filtered = brandMetrics.filter(b => {
      const lower = b.brand.toLowerCase();
      return lower.includes('nafa') || lower.includes('averx');
    });
    return filtered.length > 0 ? filtered : brandMetrics;
  }, [brandMetrics]);

  const nafaMetric = nafaAndAverxMetrics.find(b => b.brand.toLowerCase().includes('nafa'));
  const averxMetric = nafaAndAverxMetrics.find(b => b.brand.toLowerCase().includes('averx'));

  const filteredAndSorted = useMemo(() => {
    return nafaAndAverxMetrics
      .filter(b => 
        b.brand.toLowerCase().includes(search.toLowerCase()) || 
        b.topProduct.toLowerCase().includes(search.toLowerCase()) ||
        (b.topCity && b.topCity.toLowerCase().includes(search.toLowerCase())) ||
        (b.topCategory && b.topCategory.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [nafaAndAverxMetrics, search, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-orange-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-orange-600" />
    );
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Head-to-Head Comparison: NAFA vs averX Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NAFA Card */}
        {nafaMetric && (
          <div
            onClick={() => onSelectBrand(nafaMetric.brand)}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedBrand.toLowerCase().includes('nafa')
                ? 'bg-orange-50/70 border-orange-400 shadow-sm ring-2 ring-orange-500/20'
                : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                  NAFA
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    NAFA
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Electronics, Gadgets & Accessories
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                selectedBrand.toLowerCase().includes('nafa')
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedBrand.toLowerCase().includes('nafa') ? 'Filter Active' : 'Click to Filter'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gross GMV</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(nafaMetric.totalSales, currency, true)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Units Sold</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatNumber(nafaMetric.totalUnits)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Orders</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatNumber(nafaMetric.totalOrders)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100/60">
              <span className="truncate max-w-[220px]">
                <strong className="text-slate-800">Top SKU:</strong> {nafaMetric.topProduct}
              </span>
              <span className="text-slate-500 font-medium">
                AOV: <strong className="text-slate-800">{formatCurrency(nafaMetric.aov, currency)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* averX Card */}
        {averxMetric && (
          <div
            onClick={() => onSelectBrand(averxMetric.brand)}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedBrand.toLowerCase().includes('averx')
                ? 'bg-orange-50/70 border-orange-400 shadow-sm ring-2 ring-orange-500/20'
                : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                  averX
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    averX
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Personal Grooming & Kitchen Essentials
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                selectedBrand.toLowerCase().includes('averx')
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedBrand.toLowerCase().includes('averx') ? 'Filter Active' : 'Click to Filter'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gross GMV</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(averxMetric.totalSales, currency, true)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Units Sold</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatNumber(averxMetric.totalUnits)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Orders</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatNumber(averxMetric.totalOrders)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100/60">
              <span className="truncate max-w-[220px]">
                <strong className="text-slate-800">Top SKU:</strong> {averxMetric.topProduct}
              </span>
              <span className="text-slate-500 font-medium">
                AOV: <strong className="text-slate-800">{formatCurrency(averxMetric.aov, currency)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Brand Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Brand Metrics Index (NAFA & averX)
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                {filteredAndSorted.length} Brands
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sales, units, basket size (AOV), darkstore reach, and category velocity for NAFA & averX
            </p>
          </div>

          {/* Quick Brand Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onSelectBrand('')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                !selectedBrand ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Brands
            </button>
            <button
              onClick={() => onSelectBrand('NAFA')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                selectedBrand.toLowerCase() === 'nafa' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NAFA
            </button>
            <button
              onClick={() => onSelectBrand('averX')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                selectedBrand.toLowerCase() === 'averx' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              averX
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Brand</th>
                <th
                  onClick={() => handleSort('totalSales')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross GMV (Sales)</span>
                    {renderSortIcon('totalSales')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalUnits')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Units Sold</span>
                    {renderSortIcon('totalUnits')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalOrders')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Orders</span>
                    {renderSortIcon('totalOrders')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aov')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AOV (Basket)</span>
                    {renderSortIcon('aov')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('asp')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ASP (Per Unit)</span>
                    {renderSortIcon('asp')}
                  </div>
                </th>
                <th className="py-3 px-4">Top Category & SKU</th>
                <th className="py-3 px-4">Darkstores & City</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAndSorted.map((item) => {
                const isSelected = selectedBrand.toLowerCase() === item.brand.toLowerCase();
                const isNafa = item.brand.toLowerCase().includes('nafa');

                return (
                  <tr
                    key={item.brand}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-orange-50/60 font-semibold' : ''
                    }`}
                  >
                    {/* Brand */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs uppercase ${
                          isNafa
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}>
                          {item.brand.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">
                            {item.brand}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Instamart Official Partner
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gross GMV */}
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                      {formatCurrency(item.totalSales, currency)}
                    </td>

                    {/* Units */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold">
                      {formatNumber(item.totalUnits)}
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {formatNumber(item.totalOrders)}
                    </td>

                    {/* AOV */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatCurrency(item.aov, currency)}
                    </td>

                    {/* ASP */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatCurrency(item.asp, currency)}
                    </td>

                    {/* Top Category & SKU */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="truncate text-slate-900 font-semibold" title={item.topProduct}>
                        {item.topProduct}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 capitalize mt-0.5">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.topCategory || 'General'}</span>
                      </div>
                    </td>

                    {/* Coverage: Top city & Stores */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold capitalize">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{item.topCity || 'bangalore'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Store className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.activeStoresCount} darkstores</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectBrand(item.brand)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Filter'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
