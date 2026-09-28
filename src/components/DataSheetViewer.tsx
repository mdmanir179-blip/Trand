import React, { useState, useMemo } from 'react';
import { SaleRecord } from '../types/sales';
import { CurrencyCode, formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, TableProperties } from 'lucide-react';
import { exportRecordsToCSV } from '../utils/excelParser';

interface DataSheetViewerProps {
  records: SaleRecord[];
  currency: CurrencyCode;
}

type SortField = 'orderedDate' | 'brand' | 'city' | 'reaName' | 'storeId' | 'l1Category' | 'productName' | 'baseMrp' | 'unitsSold' | 'gmv';
type SortOrder = 'asc' | 'desc';

export const DataSheetViewer: React.FC<DataSheetViewerProps> = ({ records, currency }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('orderedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records
      .filter(r => {
        if (!q) return true;
        return (
          r.brand.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.l1Category && r.l1Category.toLowerCase().includes(q)) ||
          (r.l2Category && r.l2Category.toLowerCase().includes(q)) ||
          (r.l3Category && r.l3Category.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.reaName && r.reaName.toLowerCase().includes(q)) ||
          (r.storeId && r.storeId.includes(q)) ||
          (r.itemCode && r.itemCode.includes(q)) ||
          (r.orderedDate && r.orderedDate.includes(q)) ||
          (r.date && r.date.includes(q))
        );
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (sortOrder === 'asc') {
          return (Number(valA) > Number(valB)) ? 1 : -1;
        } else {
          return (Number(valA) < Number(valB)) ? 1 : -1;
        }
      });
  }, [records, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-orange-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-orange-600" />
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <TableProperties className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              INSTAMART Sales Report (Excel Data Sheet)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {filteredAndSorted.length.toLocaleString()} matching rows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exact columns matching your Instamart export: BRAND, ORDERED_DATE, CITY, REA_NAME, STORE_ID, L1/L2/L3 CATEGORIES, PRODUCT_NAME, VARIANT, ITEM_CODE, BASE_MRP, UNITS_SOLD, GMV, COS
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter by brand, product, city, store..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => exportRecordsToCSV(filteredAndSorted)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table with EXACT Instamart columns */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 text-slate-400 w-8">#</th>
              <th
                onClick={() => handleSort('brand')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>BRAND</span>
                  {renderSortIcon('brand')}
                </div>
              </th>
              <th
                onClick={() => handleSort('orderedDate')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>ORDERED_DATE</span>
                  {renderSortIcon('orderedDate')}
                </div>
              </th>
              <th
                onClick={() => handleSort('city')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>CITY</span>
                  {renderSortIcon('city')}
                </div>
              </th>
              <th
                onClick={() => handleSort('reaName')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>REA_NAME</span>
                  {renderSortIcon('reaName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('storeId')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>STORE_ID</span>
                  {renderSortIcon('storeId')}
                </div>
              </th>
              <th className="py-2.5 px-3">L1_CATEGORY</th>
              <th className="py-2.5 px-3">L2_CATEGORY</th>
              <th className="py-2.5 px-3">L3_CATEGORY</th>
              <th
                onClick={() => handleSort('productName')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>PRODUCT_NAME</span>
                  {renderSortIcon('productName')}
                </div>
              </th>
              <th className="py-2.5 px-3">VARIANT</th>
              <th className="py-2.5 px-3">ITEM_CODE</th>
              <th
                onClick={() => handleSort('baseMrp')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>BASE_MRP</span>
                  {renderSortIcon('baseMrp')}
                </div>
              </th>
              <th
                onClick={() => handleSort('unitsSold')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>UNITS_SOLD</span>
                  {renderSortIcon('unitsSold')}
                </div>
              </th>
              <th
                onClick={() => handleSort('gmv')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 transition-colors bg-orange-50/50"
              >
                <div className="flex items-center justify-end gap-1 text-orange-950 font-extrabold">
                  <span>GMV (₹)</span>
                  {renderSortIcon('gmv')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {paginatedData.map((row, idx) => {
              const actualIndex = (page - 1) * pageSize + idx;
              const saleAmount = row.gmv || row.grossSales || (row.baseMrp ? row.baseMrp * row.unitsSold : 0);

              return (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-sans text-[10px]">{actualIndex}</td>
                  <td className="py-2 px-3 font-sans font-bold capitalize text-slate-900">{row.brand}</td>
                  <td className="py-2 px-3 text-slate-600">{row.orderedDate || row.date}</td>
                  <td className="py-2 px-3 font-sans capitalize text-slate-700">{row.city}</td>
                  <td className="py-2 px-3 font-sans capitalize text-slate-600">{row.reaName || '-'}</td>
                  <td className="py-2 px-3 text-slate-500">{row.storeId || '-'}</td>
                  <td className="py-2 px-3 font-sans capitalize text-slate-700">{row.l1Category || row.category}</td>
                  <td className="py-2 px-3 font-sans text-slate-500">{row.l2Category || '-'}</td>
                  <td className="py-2 px-3 font-sans text-slate-500">{row.l3Category || '-'}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900 whitespace-normal min-w-[220px]" title={row.productName}>
                    {row.productName}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-500">{row.variant || '-'}</td>
                  <td className="py-2 px-3 text-slate-600">{row.itemCode}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{row.baseMrp}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{row.unitsSold}</td>
                  <td className="py-2 px-3 text-right font-bold text-orange-700 bg-orange-50/30">
                    {formatCurrency(saleAmount, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-semibold"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Prev
          </button>
          <span className="px-2 text-slate-600 font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
