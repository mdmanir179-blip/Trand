export type TimeInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SaleRecord {
  id: string;
  // Core Instamart Excel columns from screenshot
  brand: string;           // BRAND (e.g., averx, nafa)
  orderedDate: string;     // ORDERED_DATE (YYYY-MM-DD)
  date: string;            // alias for orderedDate
  city: string;            // CITY (e.g., bangalore, chennai, delhi, pune)
  reaName: string;         // REA_NAME / Darkstore Hub Area (e.g., btm, whitefield, koramangala)
  storeId: string;         // STORE_ID (e.g., 1402444)
  l1Category: string;      // L1_CATEGORY (e.g., electronics and appliances, beauty and grooming)
  l2Category: string;      // L2_CATEGORY (e.g., cameras and accessories, beauty accessories)
  l3Category: string;      // L3_CATEGORY (e.g., tripods, comb, charging cables)
  category: string;        // alias pointing to l1Category
  productName: string;     // PRODUCT_NAME
  variant?: string;        // VARIANT (e.g., 2 pieces, 1 unit)
  itemCode: string;        // ITEM_CODE (e.g., 137799, 730434)
  combo?: string;          // COMBO (e.g., No / Yes)
  mboItemCode?: string;    // MBO_ITEM_CODE
  baseMrp: number;         // BASE_MRP (e.g., 499, 1499)
  unitsSold: number;       // UNITS_SOLD
  gmv: number;             // GMV (Gross Merchandise Value / Sales)
  grossSales: number;      // alias pointing to gmv
  costOfSales: number;     // COS (Ad spend + commission + marketing costs)
  orders: number;          // Order count
  channel?: string;        // e.g., 'Instamart'
}

export interface BrandMetric {
  brand: string;
  totalGmv: number;
  totalSales: number;      // alias for totalGmv
  totalCos: number;
  cosPercentage: number;
  totalUnits: number;
  totalOrders: number;
  marketSharePercentage: number;
  growthRateYoY: number;
  topProduct: string;
  topCategory: string;
  topCity: string;
  activeStoresCount: number;
  aov: number;
  asp: number;
}

export interface TimeSeriesPoint {
  label: string;
  periodKey: string;
  date: string;
  sales: number;
  gmv: number;
  cos: number;
  netSales: number;
  cosPercentage: number;
  units: number;
  orders: number;
  nafaSales?: number;
  averxSales?: number;
  nafaUnits?: number;
  averxUnits?: number;
}

export interface CategoryMetric {
  category: string;
  sales: number;
  cos: number;
  units: number;
  share: number;
  l2Count?: number;
}

export interface FilterState {
  searchQuery: string; // Brand or product name
  selectedBrands: string[];
  selectedCategories: string[];
  selectedCities: string[];
  selectedReaNames: string[];
  timeInterval: TimeInterval;
  startDate: string;
  endDate: string;
  selectedCity: string;
}

export interface KPISummary {
  totalSales: number;
  totalCos: number;
  overallCosPercentage: number;
  netRevenue: number;
  totalUnits: number;
  totalOrders: number;
  averageOrderValue: number;
  averageSellingPrice: number;
  activeBrandsCount: number;
  activeProductsCount: number;
  activeStoresCount: number;
  periodGrowthSales?: number;
  periodGrowthCos?: number;
}
