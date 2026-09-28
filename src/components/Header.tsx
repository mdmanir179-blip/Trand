import React from 'react';
import { Upload, Download, RefreshCw, BarChart3, Building2, Package, TableProperties, Zap, FileSpreadsheet } from 'lucide-react';
import { CurrencyCode, CURRENCY_SYMBOLS } from '../utils/analytics';

export type ActiveTab = 'overview' | 'brands' | 'trends' | 'products' | 'datasheet';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onOpenUpload: () => void;
  onDownloadTemplate: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalRecords: number;
  fileName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenUpload,
  onDownloadTemplate,
  onExportCSV,
  onResetData,
  totalRecords,
  fileName
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company Brand: INSTAMART */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                    INSTAMART
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                    Brand Analytics
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  Sales, GMV & Quick Commerce Analytics
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'brands'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-orange-500" />
              Brand Metrics
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              Interval Trends
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-500" />
              SKU & Categories
            </button>
            <button
              onClick={() => setActiveTab('datasheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'datasheet'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5 text-purple-500" />
              Data Sheet
            </button>
          </nav>

          {/* Action Zone: Currency, Upload, Export */}
          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="relative inline-block text-left">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                  <option key={code} value={code}>
                    {symbol} {code}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-2 text-[10px] text-slate-500">▼</span>
            </div>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              title="Export filtered records to CSV"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Template Download */}
            <button
              onClick={onDownloadTemplate}
              title="Download Excel template matching screenshot schema"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Template (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 py-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2 py-1 rounded ${activeTab === 'overview' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-2 py-1 rounded ${activeTab === 'brands' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
          >
            Brand Metrics
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-2 py-1 rounded ${activeTab === 'trends' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-2 py-1 rounded ${activeTab === 'products' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
          >
            SKUs
          </button>
          <button
            onClick={() => setActiveTab('datasheet')}
            className={`px-2 py-1 rounded ${activeTab === 'datasheet' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
          >
            Data Sheet
          </button>
        </div>
      </div>
    </header>
  );
};
