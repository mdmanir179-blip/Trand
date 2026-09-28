import * as XLSX from 'xlsx';
import { SaleRecord, BrandMetric } from '../types/sales';

export interface ColumnMapping {
  brand: string;
  orderedDate: string;
  city: string;
  reaName: string;
  storeId: string;
  l1Category: string;
  l2Category: string;
  l3Category: string;
  productName: string;
  variant: string;
  itemCode: string;
  combo: string;
  mboItemCode: string;
  baseMrp: string;
  unitsSold: string;
  gmv: string;
  cos: string;
  // Aliases for legacy/generic
  date?: string;
  category?: string;
  grossSales?: string;
  costOfSales?: string;
  orders?: string;
}

export interface ParseResult {
  success: boolean;
  records: SaleRecord[];
  brandMetrics?: BrandMetric[];
  sheetNames: string[];
  selectedSheet: string;
  totalRows: number;
  detectedColumns: Partial<ColumnMapping>;
  message?: string;
  headers: string[];
  rawRowsPreview?: Record<string, unknown>[];
}

/**
 * Normalize header string for fuzzy matching
 */
function cleanKey(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fuzzy matches table headers to standardized Instamart keys
 */
export function detectHeaderMapping(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};

  for (const h of headers) {
    if (!h) continue;
    const clean = cleanKey(h);

    // BRAND
    if (!mapping.brand && (clean === 'brand' || clean.includes('brand') || clean.includes('maker') || clean.includes('manufacturer'))) {
      mapping.brand = h;
    }
    // ORDERED_DATE / DATE
    else if (!mapping.orderedDate && (clean.includes('ordereddate') || clean.includes('orderdate') || clean === 'date' || clean.includes('date') || clean === 'day')) {
      mapping.orderedDate = h;
      mapping.date = h;
    }
    // CITY
    else if (!mapping.city && (clean === 'city' || clean.includes('city') || clean.includes('region') || clean.includes('location'))) {
      mapping.city = h;
    }
    // REA_NAME / AREA
    else if (!mapping.reaName && (clean === 'reaname' || clean.includes('rea') || clean.includes('area') || clean.includes('locality') || clean.includes('hub'))) {
      mapping.reaName = h;
    }
    // STORE_ID
    else if (!mapping.storeId && (clean === 'storeid' || clean.includes('store') || clean.includes('darkstore') || clean.includes('pod'))) {
      mapping.storeId = h;
    }
    // L1_CATEGORY
    else if (!mapping.l1Category && (clean === 'l1category' || clean.includes('l1') || clean === 'category' || clean.includes('dept'))) {
      mapping.l1Category = h;
      mapping.category = h;
    }
    // L2_CATEGORY
    else if (!mapping.l2Category && (clean === 'l2category' || clean.includes('l2') || clean.includes('subcat'))) {
      mapping.l2Category = h;
    }
    // L3_CATEGORY
    else if (!mapping.l3Category && (clean === 'l3category' || clean.includes('l3') || clean.includes('type'))) {
      mapping.l3Category = h;
    }
    // PRODUCT_NAME
    else if (!mapping.productName && (clean === 'productname' || clean.includes('product') || clean.includes('itemname') || clean.includes('item') || clean.includes('title'))) {
      mapping.productName = h;
    }
    // VARIANT
    else if (!mapping.variant && (clean === 'variant' || clean.includes('variant') || clean.includes('pack') || clean.includes('size'))) {
      mapping.variant = h;
    }
    // ITEM_CODE
    else if (!mapping.itemCode && (clean === 'itemcode' || clean.includes('itemcode') || clean.includes('sku') || clean.includes('code'))) {
      mapping.itemCode = h;
    }
    // COMBO
    else if (!mapping.combo && (clean === 'combo' || clean.includes('combo'))) {
      mapping.combo = h;
    }
    // MBO_ITEM_CODE
    else if (!mapping.mboItemCode && (clean === 'mboitemcode' || clean.includes('mbo'))) {
      mapping.mboItemCode = h;
    }
    // BASE_MRP
    else if (!mapping.baseMrp && (clean === 'basemrp' || clean === 'mrp' || clean.includes('mrp') || clean.includes('price'))) {
      mapping.baseMrp = h;
    }
    // UNITS_SOLD / UNITS
    else if (!mapping.unitsSold && (clean === 'unitssold' || clean.includes('unit') || clean.includes('qty') || clean.includes('quantity') || clean.includes('sold'))) {
      mapping.unitsSold = h;
    }
    // GMV / GROSS SALES
    else if (!mapping.gmv && (clean === 'gmv' || clean.includes('gmv') || clean.includes('sales') || clean.includes('revenue') || clean.includes('amount') || clean.includes('turnover'))) {
      mapping.gmv = h;
      mapping.grossSales = h;
    }
    // COS (Cost of Sales / Ad spend)
    else if (!mapping.cos && (clean === 'cos' || clean.includes('costofsales') || clean.includes('adspend') || clean.includes('marketing') || clean.includes('cost') || clean.includes('cogs') || clean.includes('spend'))) {
      mapping.cos = h;
      mapping.costOfSales = h;
    }
  }

  return mapping;
}

/**
 * Score a row of strings based on how many Instamart sales header keywords it matches
 */
function scoreHeaderCandidate(row: unknown[]): number {
  if (!Array.isArray(row)) return 0;
  let score = 0;
  const keywords = [
    'brand', 'ordereddate', 'date', 'city', 'reaname', 'area', 'storeid', 'store',
    'l1category', 'l2category', 'l3category', 'productname', 'product', 'itemcode',
    'basemrp', 'unitssold', 'units', 'gmv', 'sales', 'cos', 'variant', 'combo'
  ];

  for (const cell of row) {
    if (cell === null || cell === undefined) continue;
    const clean = cleanKey(cell);
    if (!clean) continue;
    for (const kw of keywords) {
      if (clean === kw || clean.includes(kw)) {
        score += 3;
        break;
      }
    }
  }
  return score;
}

/**
 * Robust date parser for various Excel, string, and timestamp formats
 */
export function parseDateString(rawDate: unknown): string {
  if (!rawDate) {
    return new Date().toISOString().split('T')[0];
  }

  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    return rawDate.toISOString().split('T')[0];
  }

  if (typeof rawDate === 'number') {
    // Excel serial date format (days since Dec 30, 1899)
    if (rawDate > 10000 && rawDate < 60000) {
      const excelEpoch = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(excelEpoch.getTime())) {
        return excelEpoch.toISOString().split('T')[0];
      }
    }
  }

  const str = String(rawDate).trim();

  // Standard ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;

    if (month > 12 && day <= 12) {
      const tmp = day;
      day = month;
      month = tmp;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Clean numeric values removing currency symbols, commas, spaces
 */
export function parseNumeric(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse an Excel or CSV file from ArrayBuffer
 */
export async function parseExcelOrCsv(
  fileBuffer: ArrayBuffer,
  fileName: string,
  preferredSheet?: string
): Promise<ParseResult> {
  try {
    const workbook = XLSX.read(fileBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    const sheetNames = workbook.SheetNames;
    if (!sheetNames || sheetNames.length === 0) {
      return {
        success: false,
        records: [],
        sheetNames: [],
        selectedSheet: '',
        totalRows: 0,
        headers: [],
        detectedColumns: {},
        message: 'No sheets found in the uploaded workbook.'
      };
    }

    // Determine target sheet
    let targetSheetName = sheetNames[0];
    if (preferredSheet && sheetNames.includes(preferredSheet)) {
      targetSheetName = preferredSheet;
    } else {
      const bestMatch = sheetNames.find(s => {
        const lower = s.toLowerCase();
        return lower.includes('sales') || lower.includes('report') || lower.includes('instamart') || lower.includes('data');
      });
      if (bestMatch) {
        targetSheetName = bestMatch;
      }
    }

    const worksheet = workbook.Sheets[targetSheetName];

    // Read sheet as 2D row array
    const rawMatrix: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (!rawMatrix || rawMatrix.length === 0) {
      return {
        success: false,
        records: [],
        sheetNames,
        selectedSheet: targetSheetName,
        totalRows: 0,
        headers: [],
        detectedColumns: {},
        message: `Sheet "${targetSheetName}" has no data rows.`
      };
    }

    // Find the best header row within first 15 rows
    let bestHeaderRowIndex = 0;
    let highestScore = -1;

    const maxCheckRows = Math.min(rawMatrix.length, 15);
    for (let i = 0; i < maxCheckRows; i++) {
      const row = rawMatrix[i];
      if (Array.isArray(row) && row.length > 0) {
        const score = scoreHeaderCandidate(row);
        if (score > highestScore) {
          highestScore = score;
          bestHeaderRowIndex = i;
        }
      }
    }

    // Extract headers
    const rawHeaderRow = rawMatrix[bestHeaderRowIndex] || [];
    const headers: string[] = rawHeaderRow.map((cell, idx) => {
      const str = String(cell || '').trim();
      return str || `Column_${idx + 1}`;
    });

    const mapping = detectHeaderMapping(headers);

    // Read rows
    const parsedRecords: SaleRecord[] = [];
    const rawPreview: Record<string, unknown>[] = [];

    for (let r = bestHeaderRowIndex + 1; r < rawMatrix.length; r++) {
      const rowData = rawMatrix[r];
      if (!Array.isArray(rowData) || rowData.length === 0) continue;

      const rowObj: Record<string, unknown> = {};
      let hasData = false;

      headers.forEach((h, colIdx) => {
        const val = rowData[colIdx] ?? '';
        rowObj[h] = val;
        if (val !== '' && val !== null && val !== undefined) {
          hasData = true;
        }
      });

      if (!hasData) continue;

      if (rawPreview.length < 10) {
        rawPreview.push(rowObj);
      }

      // Exact Instamart mappings
      const brand = mapping.brand && rowObj[mapping.brand]
        ? String(rowObj[mapping.brand]).trim()
        : 'averx';

      const dateField = mapping.orderedDate || mapping.date;
      const orderedDate = parseDateString(dateField ? rowObj[dateField] : null);

      const city = mapping.city && rowObj[mapping.city]
        ? String(rowObj[mapping.city]).trim().toLowerCase()
        : 'bangalore';

      const reaName = mapping.reaName && rowObj[mapping.reaName]
        ? String(rowObj[mapping.reaName]).trim().toLowerCase()
        : 'btm';

      const storeId = mapping.storeId && rowObj[mapping.storeId]
        ? String(rowObj[mapping.storeId]).trim()
        : `140${1000 + (r % 5000)}`;

      const l1Category = mapping.l1Category && rowObj[mapping.l1Category]
        ? String(rowObj[mapping.l1Category]).trim()
        : 'General Retail';

      const l2Category = mapping.l2Category && rowObj[mapping.l2Category]
        ? String(rowObj[mapping.l2Category]).trim()
        : '';

      const l3Category = mapping.l3Category && rowObj[mapping.l3Category]
        ? String(rowObj[mapping.l3Category]).trim()
        : '';

      const productName = mapping.productName && rowObj[mapping.productName]
        ? String(rowObj[mapping.productName]).trim()
        : `${brand} Product #${r}`;

      const variant = mapping.variant && rowObj[mapping.variant]
        ? String(rowObj[mapping.variant]).trim()
        : '1 unit';

      const itemCode = mapping.itemCode && rowObj[mapping.itemCode]
        ? String(rowObj[mapping.itemCode]).trim()
        : `${100000 + (r * 17) % 899999}`;

      const combo = mapping.combo && rowObj[mapping.combo]
        ? String(rowObj[mapping.combo]).trim()
        : 'No';

      const mboItemCode = mapping.mboItemCode && rowObj[mapping.mboItemCode]
        ? String(rowObj[mapping.mboItemCode]).trim()
        : '0';

      const unitsSold = mapping.unitsSold
        ? Math.max(1, parseNumeric(rowObj[mapping.unitsSold]))
        : 1;

      let baseMrp = mapping.baseMrp
        ? parseNumeric(rowObj[mapping.baseMrp])
        : 0;

      let gmv = mapping.gmv
        ? parseNumeric(rowObj[mapping.gmv])
        : 0;

      if (gmv === 0 && baseMrp > 0) {
        gmv = baseMrp * unitsSold;
      } else if (baseMrp === 0 && gmv > 0 && unitsSold > 0) {
        baseMrp = Math.round(gmv / unitsSold);
      } else if (gmv === 0 && baseMrp === 0) {
        baseMrp = 499;
        gmv = 499 * unitsSold;
      }

      // COS (Cost of Sales / Ad spend)
      let costOfSales = mapping.cos || mapping.costOfSales
        ? parseNumeric(rowObj[(mapping.cos || mapping.costOfSales)!])
        : 0;

      // If COS is not explicitly provided in the raw sheet, estimate standard 12% ad/commission proxy
      if (costOfSales === 0 && gmv > 0 && !mapping.cos && !mapping.costOfSales) {
        costOfSales = Math.round(gmv * 0.12);
      }

      parsedRecords.push({
        id: `INSTA-ROW-${r}`,
        brand,
        orderedDate,
        date: orderedDate,
        city,
        reaName,
        storeId,
        l1Category,
        l2Category,
        l3Category,
        category: l1Category,
        productName,
        variant,
        itemCode,
        combo,
        mboItemCode,
        baseMrp,
        unitsSold,
        gmv,
        grossSales: gmv,
        costOfSales,
        orders: 1,
        channel: 'Instamart'
      });
    }

    if (parsedRecords.length === 0) {
      return {
        success: false,
        records: [],
        sheetNames,
        selectedSheet: targetSheetName,
        totalRows: 0,
        headers,
        detectedColumns: mapping,
        message: `No valid rows extracted from sheet "${targetSheetName}". Check your column headers.`
      };
    }

    return {
      success: true,
      records: parsedRecords,
      sheetNames,
      selectedSheet: targetSheetName,
      totalRows: parsedRecords.length,
      detectedColumns: mapping,
      headers,
      rawRowsPreview: rawPreview,
      message: `Successfully loaded ${parsedRecords.length} Instamart records from "${fileName}" (Sheet: ${targetSheetName}).`
    };

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      records: [],
      sheetNames: [],
      selectedSheet: '',
      totalRows: 0,
      headers: [],
      detectedColumns: {},
      message: `Failed to parse Excel file: ${errMsg}`
    };
  }
}

/**
 * Generate a downloadable sample Excel workbook (.xlsx) matching the EXACT columns from the screenshot
 */
export function generateSampleExcelWorkbook(records: SaleRecord[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Sales Report Sheet (Exact columns from user screenshot)
  const salesData = records.slice(0, 100).map(r => ({
    'BRAND': r.brand,
    'ORDERED_DATE': r.orderedDate || r.date,
    'CITY': r.city,
    'REA_NAME': r.reaName,
    'STORE_ID': r.storeId,
    'L1_CATEGORY': r.l1Category || r.category,
    'L2_CATEGORY': r.l2Category || '',
    'L3_CATEGORY': r.l3Category || '',
    'PRODUCT_NAME': r.productName,
    'VARIANT': r.variant || '1 unit',
    'ITEM_CODE': r.itemCode,
    'COMBO': r.combo || 'No',
    'MBO_ITEM_CODE': r.mboItemCode || '0',
    'BASE_MRP': r.baseMrp,
    'UNITS_SOLD': r.unitsSold,
    'GMV': r.gmv || r.grossSales
  }));

  const salesWs = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Report');

  // 2. Brand Metrics Sheet
  const brandMap = new Map<string, { gmv: number; units: number; orders: number; topSku: string; topCity: string }>();
  records.forEach(r => {
    const cur = brandMap.get(r.brand) || { gmv: 0, units: 0, orders: 0, topSku: r.productName, topCity: r.city };
    cur.gmv += (r.gmv || r.grossSales);
    cur.units += r.unitsSold;
    cur.orders += 1;
    brandMap.set(r.brand, cur);
  });

  const brandData = Array.from(brandMap.entries()).map(([brand, val]) => ({
    'BRAND': brand,
    'TOTAL_GMV (₹)': val.gmv,
    'UNITS_SOLD': val.units,
    'ORDERS': val.orders,
    'AOV (₹)': val.orders > 0 ? Math.round(val.gmv / val.orders) : 0,
    'TOP_SKU': val.topSku,
    'TOP_CITY': val.topCity
  }));

  const brandWs = XLSX.utils.json_to_sheet(brandData);
  XLSX.utils.book_append_sheet(wb, brandWs, 'Brand Metrics');

  XLSX.writeFile(wb, 'INSTAMART_Sales_Report.xlsx');
}

/**
 * Export current filtered records to CSV with exact screenshot columns
 */
export function exportRecordsToCSV(records: SaleRecord[], filename = 'INSTAMART_Filtered_Sales.csv'): void {
  const headers = [
    'BRAND',
    'ORDERED_DATE',
    'CITY',
    'REA_NAME',
    'STORE_ID',
    'L1_CATEGORY',
    'L2_CATEGORY',
    'L3_CATEGORY',
    'PRODUCT_NAME',
    'VARIANT',
    'ITEM_CODE',
    'COMBO',
    'MBO_ITEM_CODE',
    'BASE_MRP',
    'UNITS_SOLD',
    'GMV'
  ];

  const rows = records.map(r => [
    `"${r.brand.replace(/"/g, '""')}"`,
    r.orderedDate || r.date,
    `"${(r.city || '').replace(/"/g, '""')}"`,
    `"${(r.reaName || '').replace(/"/g, '""')}"`,
    r.storeId,
    `"${(r.l1Category || r.category || '').replace(/"/g, '""')}"`,
    `"${(r.l2Category || '').replace(/"/g, '""')}"`,
    `"${(r.l3Category || '').replace(/"/g, '""')}"`,
    `"${r.productName.replace(/"/g, '""')}"`,
    `"${(r.variant || '').replace(/"/g, '""')}"`,
    r.itemCode,
    r.combo || 'No',
    r.mboItemCode || '0',
    r.baseMrp,
    r.unitsSold,
    r.gmv || r.grossSales
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
