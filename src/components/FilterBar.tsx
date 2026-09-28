import React from 'react';
import { FilterState, TimeInterval } from '../types/sales';
import { Search, X, Calendar, Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableBrands: string[];
  availableCategories: string[];
  availableCities: string[];
  totalFilteredCount: number;
  totalRawCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  availableBrands,
  availableCategories,
  availableCities,
  totalFilteredCount,
  totalRawCount
}) => {
  const intervals: { id: TimeInterval; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleClearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };

  const handleIntervalChange = (interval: TimeInterval) => {
    setFilters(prev => ({ ...prev, timeInterval: interval }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(prev => ({
      ...prev,
      selectedBrands: val ? [val] : []
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(prev => ({
      ...prev,
      selectedCategories: val ? [val] : []
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      selectedCity: e.target.value
    }));
  };

  const handleDatePreset = (preset: 'all' | 'sep2026' | '2026' | '2025' | '2024') => {
    if (preset === 'all') {
      setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
      return;
    }

    if (preset === 'sep2026') {
      setFilters(prev => ({ ...prev, startDate: '2026-09-01', endDate: '2026-09-30' }));
      return;
    }

    if (preset === '2026') {
      setFilters(prev => ({ ...prev, startDate: '2026-01-01', endDate: '2026-12-31' }));
      return;
    }

    if (preset === '2025') {
      setFilters(prev => ({ ...prev, startDate: '2025-01-01', endDate: '2025-12-31' }));
      return;
    }

    if (preset === '2024') {
      setFilters(prev => ({ ...prev, startDate: '2024-01-01', endDate: '2024-12-31' }));
      return;
    }
  };

  const resetAllFilters = () => {
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

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedBrands.length > 0 ||
    filters.selectedCategories.length > 0 ||
    (filters.selectedCity && filters.selectedCity !== 'ALL') ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 mb-6 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input: matches Brand or Product Name */}
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Brand (averx, nafa...) or Product (tripod, comb, selfie stick, chopper, cable)..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 font-medium transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Time Interval Selector (Days, Weekly, Monthly, Yearly) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {intervals.map((it) => (
            <button
              key={it.id}
              onClick={() => handleIntervalChange(it.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                filters.timeInterval === it.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Second Row: Granular Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Brand:</span>
            <select
              value={filters.selectedBrands[0] || ''}
              onChange={handleBrandChange}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 capitalize cursor-pointer"
            >
              <option value="">All Brands ({availableBrands.length})</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Category:</span>
            <select
              value={filters.selectedCategories[0] || ''}
              onChange={handleCategoryChange}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 capitalize cursor-pointer"
            >
              <option value="">All Categories ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">City:</span>
            <select
              value={filters.selectedCity}
              onChange={handleCityChange}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 capitalize cursor-pointer"
            >
              <option value="ALL">All Hubs & Cities</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-600 pl-2 border-l border-slate-200">
            <span className="text-slate-400 font-medium">Period:</span>
            <button
              onClick={() => handleDatePreset('all')}
              className={`px-2 py-0.5 rounded font-semibold ${
                !filters.startDate && !filters.endDate
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handleDatePreset('sep2026')}
              className={`px-2 py-0.5 rounded font-semibold ${
                filters.startDate === '2026-09-01'
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Sep 2026
            </button>
            <button
              onClick={() => handleDatePreset('2026')}
              className={`px-2 py-0.5 rounded font-semibold ${
                filters.startDate === '2026-01-01'
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              2026
            </button>
            <button
              onClick={() => handleDatePreset('2025')}
              className={`px-2 py-0.5 rounded font-semibold ${
                filters.startDate === '2025-01-01'
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => handleDatePreset('2024')}
              className={`px-2 py-0.5 rounded font-semibold ${
                filters.startDate === '2024-01-01'
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              2024
            </button>
          </div>
        </div>

        {/* Status Count and Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-slate-500 font-mono">
            {totalFilteredCount.toLocaleString()} / {totalRawCount.toLocaleString()} rows
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
