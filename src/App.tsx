import React, { useState, useMemo } from 'react';
import { SaleRecord, FilterState } from './types/sales';
import { INITIAL_SALES_DATA } from './data/mockInstamartData';
import {
  CurrencyCode,
  filterRecords,
  computeKPISummary,
  aggregateTimeSeries,
  computeBrandMetrics,
  computeCategoryMetrics,
  computeTopProducts
} from './utils/analytics';
import { generateSampleExcelWorkbook, exportRecordsToCSV } from './utils/excelParser';
import { Header, ActiveTab } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterBar } from './components/FilterBar';
import { SalesCostChart } from './components/SalesCostChart';
import { BrandMetricsTable } from './components/BrandMetricsTable';
import { ProductBreakdown } from './components/ProductBreakdown';
import { DataSheetViewer } from './components/DataSheetViewer';
import { ExecutiveInsights } from './components/ExecutiveInsights';
import { UploadModal } from './components/UploadModal';
import { FileSpreadsheet, RotateCcw, Upload, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_DATA = 'instamart_sales_records_v3';
const STORAGE_KEY_FILE = 'instamart_loaded_filename_v3';

export default function App() {
  // Raw Data State with LocalStorage Persistence
  const [records, setRecords] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading stored records:', e);
    }
    return INITIAL_SALES_DATA;
  });

  const [loadedFileName, setLoadedFileName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILE);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'Instamart_sales.xlsx';
  });

  const isCustomUploaded = useMemo(() => {
    return loadedFileName !== 'Instamart_sales.xlsx';
  }, [loadedFileName]);

  // Navigation & Settings
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedBrands: [],
    selectedCategories: [],
    selectedCities: [],
    selectedReaNames: [],
    timeInterval: 'monthly',
    startDate: '',
    endDate: '',
    selectedCity: 'ALL'
  });

  // Extract all unique brands, categories, and cities
  const availableBrands = useMemo(() => {
    return Array.from(new Set(records.map(r => r.brand))).sort();
  }, [records]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(records.map(r => r.category))).sort();
  }, [records]);

  const availableCities = useMemo(() => {
    return Array.from(new Set(records.map(r => r.city).filter((c): c is string => Boolean(c)))).sort();
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  // Analytical aggregates
  const summary = useMemo(() => {
    return computeKPISummary(filteredRecords);
  }, [filteredRecords]);

  const timeSeries = useMemo(() => {
    return aggregateTimeSeries(filteredRecords, filters.timeInterval);
  }, [filteredRecords, filters.timeInterval]);

  const brandMetrics = useMemo(() => {
    return computeBrandMetrics(filteredRecords);
  }, [filteredRecords]);

  const categoryMetrics = useMemo(() => {
    return computeCategoryMetrics(filteredRecords);
  }, [filteredRecords]);

  const topProducts = useMemo(() => {
    return computeTopProducts(filteredRecords, 10);
  }, [filteredRecords]);

  // Save to localStorage whenever data changes
  const handleDataLoaded = (newRecords: SaleRecord[], fileName: string) => {
    setRecords(newRecords);
    setLoadedFileName(fileName);
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newRecords));
      localStorage.setItem(STORAGE_KEY_FILE, fileName);
    } catch (e) {
      console.warn('LocalStorage limit exceeded, data kept in memory:', e);
    }

    // Reset brand and category filters to avoid orphaned selections
    setFilters(prev => ({
      ...prev,
      selectedBrands: [],
      selectedCategories: [],
      searchQuery: '',
      startDate: '',
      endDate: ''
    }));
  };

  const handleResetData = () => {
    setRecords(INITIAL_SALES_DATA);
    setLoadedFileName('Instamart_sales.xlsx');
    try {
      localStorage.removeItem(STORAGE_KEY_DATA);
      localStorage.removeItem(STORAGE_KEY_FILE);
    } catch {
      // ignore
    }
    setFilters({
      searchQuery: '',
      selectedBrands: [],
      selectedCategories: [],
      selectedCities: [],
      selectedReaNames: [],
      timeInterval: 'monthly',
      startDate: '',
      endDate: '',
      selectedCity: 'ALL'
    });
  };

  const handleDownloadTemplate = () => {
    generateSampleExcelWorkbook(records);
  };

  const handleExportCSV = () => {
    exportRecordsToCSV(filteredRecords, `Instamart_Filtered_Sales_${filters.timeInterval}.csv`);
  };

  const handleSelectBrand = (brandName: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brandName) ? [] : [brandName],
      searchQuery: ''
    }));
  };

  const handleSelectProduct = (productName: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: productName
    }));
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenUpload={() => setIsUploadOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        totalRecords={records.length}
        fileName={loadedFileName}
      />

      {/* Active Data Source Banner */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500">Active Excel Data:</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              {loadedFileName}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              <strong>{records.length.toLocaleString()}</strong> rows total
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              <strong>{filteredRecords.length.toLocaleString()}</strong> matching filters
            </span>
            {isCustomUploaded && (
              <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Custom Excel Uploaded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-md border border-emerald-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Excel
            </button>
            {isCustomUploaded && (
              <button
                onClick={handleResetData}
                title="Reset to default Instamart dataset"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Universal Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          availableBrands={availableBrands}
          availableCategories={availableCategories}
          availableCities={availableCities}
          totalFilteredCount={filteredRecords.length}
          totalRawCount={records.length}
        />

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <KPICards summary={summary} currency={currency} />

            {/* Sales & COS Chart (Daily / Weekly / Monthly / Yearly) */}
            <SalesCostChart
              data={timeSeries}
              interval={filters.timeInterval}
              currency={currency}
            />

            {/* Grid: Brand Metrics + Top SKUs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BrandMetricsTable
                  brandMetrics={brandMetrics}
                  currency={currency}
                  onSelectBrand={handleSelectBrand}
                  selectedBrand={filters.selectedBrands[0] || ''}
                />
              </div>
              <div className="lg:col-span-1">
                <ProductBreakdown
                  topProducts={topProducts}
                  categoryMetrics={categoryMetrics}
                  currency={currency}
                  onSelectProduct={handleSelectProduct}
                />
              </div>
            </div>

            {/* Strategic Insights */}
            <ExecutiveInsights
              summary={summary}
              brandMetrics={brandMetrics}
              timeSeries={timeSeries}
              currency={currency}
            />
          </div>
        )}

        {/* Tab 2: Sales & COS Trends */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <KPICards summary={summary} currency={currency} />
            <SalesCostChart
              data={timeSeries}
              interval={filters.timeInterval}
              currency={currency}
            />
            <ExecutiveInsights
              summary={summary}
              brandMetrics={brandMetrics}
              timeSeries={timeSeries}
              currency={currency}
            />
          </div>
        )}

        {/* Tab 3: Brand Performance */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <BrandMetricsTable
              brandMetrics={brandMetrics}
              currency={currency}
              onSelectBrand={handleSelectBrand}
              selectedBrand={filters.selectedBrands[0] || ''}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductBreakdown
                topProducts={topProducts}
                categoryMetrics={categoryMetrics}
                currency={currency}
                onSelectProduct={handleSelectProduct}
              />
              <ExecutiveInsights
                summary={summary}
                brandMetrics={brandMetrics}
                timeSeries={timeSeries}
                currency={currency}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Product & Category Breakdown */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <ProductBreakdown
              topProducts={topProducts}
              categoryMetrics={categoryMetrics}
              currency={currency}
              onSelectProduct={handleSelectProduct}
            />
            <BrandMetricsTable
              brandMetrics={brandMetrics}
              currency={currency}
              onSelectBrand={handleSelectBrand}
              selectedBrand={filters.selectedBrands[0] || ''}
            />
          </div>
        )}

        {/* Tab 5: Detailed Raw Data Sheet */}
        {activeTab === 'datasheet' && (
          <div className="space-y-6">
            <DataSheetViewer
              records={filteredRecords}
              currency={currency}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            InstaSales Analytics & COS Intelligence Dashboard &bull; Ready for Vercel deployment
          </div>
          <div className="flex items-center gap-3">
            <span>Client-side Processing &bull; 100% Private</span>
            <span>&bull;</span>
            <button
              onClick={handleResetData}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Reset to Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Excel Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
