import React, { useState } from 'react';
import { CategoryMetric } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber } from '../utils/analytics';
import { Package, Layers } from 'lucide-react';

interface ProductBreakdownProps {
  topProducts: {
    productName: string;
    brand: string;
    category: string;
    sales: number;
    cos: number;
    cosPercentage: number;
    units: number;
    orders: number;
  }[];
  categoryMetrics: CategoryMetric[];
  currency: CurrencyCode;
  onSelectProduct: (productName: string) => void;
}

export const ProductBreakdown: React.FC<ProductBreakdownProps> = ({
  topProducts,
  categoryMetrics,
  currency,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              SKU & Category Performance
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Top grossing products and sales contribution across categories
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top SKUs ({topProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categories ({categoryMetrics.length})
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Product / SKU Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Gross GMV</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Orders</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topProducts.map((p, index) => {
                return (
                  <tr key={p.productName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[280px]">
                      {p.productName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 capitalize font-medium">
                      {p.brand}
                    </td>
                    <td className="py-3 px-4 text-slate-500 capitalize">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(p.sales, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {formatNumber(p.units)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatNumber(p.orders)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectProduct(p.productName)}
                        className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors cursor-pointer"
                      >
                        Filter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">L1 Category</th>
                <th className="py-3 px-4 text-right">Gross GMV</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Sub-categories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryMetrics.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 capitalize">
                    {c.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(c.sales, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatNumber(c.units)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {c.l2Count ? `${c.l2Count} sub-segments` : 'Standard'}
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
