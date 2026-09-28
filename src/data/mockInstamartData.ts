import { SaleRecord } from '../types/sales';

interface RawRowConfig {
  brand: 'averX' | 'NAFA';
  l1: string;
  l2: string;
  l3: string;
  name: string;
  variant: string;
  itemCode: string;
  baseMrp: number;
}

// Strictly only averX and NAFA products as per user request & screenshot
const TEMPLATE_PRODUCTS: RawRowConfig[] = [
  {
    brand: 'averX',
    l1: 'beauty and grooming',
    l2: 'beauty accessories',
    l3: 'comb',
    name: 'averX Kacchi Neem Wooden Comb',
    variant: '2 pieces',
    itemCode: '137799',
    baseMrp: 499
  },
  {
    brand: 'NAFA',
    l1: 'electronics and appliances',
    l2: 'cameras and accessories',
    l3: 'tripods',
    name: 'NAFA 84 Inch (7 Ft) Light Tripod',
    variant: '1 unit',
    itemCode: '730434',
    baseMrp: 1499
  },
  {
    brand: 'NAFA',
    l1: 'electronics and appliances',
    l2: 'phone accessories',
    l3: 'selfie sticks',
    name: 'NAFA SnapX Max 66-inch Selfie Stick',
    variant: '1 unit',
    itemCode: '444391',
    baseMrp: 1499
  },
  {
    brand: 'averX',
    l1: 'kitchen and dining',
    l2: 'cutting chopping grating peeling',
    l3: 'choppers',
    name: 'averX Compact Multi Chopper',
    variant: '1 Piece',
    itemCode: '851610',
    baseMrp: 499
  },
  {
    brand: 'NAFA',
    l1: 'electronics and appliances',
    l2: 'powerbanks and chargers',
    l3: 'charging cables',
    name: 'NAFA 6A 80W Fast Charging Cable',
    variant: '1 unit',
    itemCode: '399147',
    baseMrp: 999
  },
  {
    brand: 'NAFA',
    l1: 'electronics and appliances',
    l2: 'cameras and accessories',
    l3: 'tripods',
    name: 'NAFA Bluetooth Selfie Tripod Stand',
    variant: '1 Unit',
    itemCode: '464125',
    baseMrp: 999
  },
  {
    brand: 'averX',
    l1: 'home and kitchen needs',
    l2: 'paper disposable',
    l3: 'disposables',
    name: 'averX Aluminium Disposable Foil',
    variant: '25 Pieces',
    itemCode: '594693',
    baseMrp: 499
  },
  {
    brand: 'averX',
    l1: 'home and kitchen needs',
    l2: 'garbage bags',
    l3: 'garbage bags',
    name: 'averX Biodegradable Garbage Bags',
    variant: '60 Pieces',
    itemCode: '432032',
    baseMrp: 349
  }
];

const STORE_LOCATIONS = [
  { city: 'bangalore', area: 'btm', storeId: '1402444' },
  { city: 'bangalore', area: 'whitefield', storeId: '1403354' },
  { city: 'bangalore', area: 'arekere', storeId: '1397048' },
  { city: 'bangalore', area: 'geddalahalli', storeId: '1404671' },
  { city: 'bangalore', area: 'electronic city', storeId: '1404599' },
  { city: 'bangalore', area: 'koramangala', storeId: '1404590' },
  { city: 'bangalore', area: 'anekal', storeId: '1399695' },
  { city: 'bangalore', area: 'vijayanagar', storeId: '1380899' },
  { city: 'bangalore', area: 'rajajinagar', storeId: '1404884' },
  { city: 'bangalore', area: 'marathahalli', storeId: '1404911' },
  { city: 'bangalore', area: 'mahadevapura', storeId: '1395434' },
  { city: 'bangalore', area: 'jalahalli', storeId: '1401462' },
  { city: 'bangalore', area: 'kudlu gate', storeId: '1395720' },
  { city: 'bangalore', area: 'bellandur', storeId: '1403463' },
  { city: 'chennai', area: 'mogappair', storeId: '1398756' },
  { city: 'chennai', area: 'anna nagar', storeId: '1408821' },
  { city: 'pune', area: 'wakad', storeId: '1404753' },
  { city: 'pune', area: 'baner', storeId: '1389001' },
  { city: 'delhi', area: 'dilshad garden', storeId: '1403179' },
  { city: 'delhi', area: 'dwarka sector 12', storeId: '1402110' },
  { city: 'coimbatore', area: 'ganapathy', storeId: '1403359' }
];

/**
 * Generate comprehensive Instamart sales records ONLY containing NAFA and averX
 */
export function generateInstamartData(): SaleRecord[] {
  const records: SaleRecord[] = [];
  let rowId = 1;

  // Exact rows matching the user screenshot (Rows 0-39)
  const exactScreenshotRows: {
    brand: 'averX' | 'NAFA';
    date: string;
    city: string;
    area: string;
    storeId: string;
    prodIdx: number;
    units: number;
  }[] = [
    { brand: 'averX', date: '2026-09-04', city: 'bangalore', area: 'btm', storeId: '1402444', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-04', city: 'bangalore', area: 'whitefield', storeId: '1403354', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-04', city: 'bangalore', area: 'arekere', storeId: '1397048', prodIdx: 2, units: 1 },
    { brand: 'averX', date: '2026-09-02', city: 'bangalore', area: 'geddalahalli', storeId: '1404671', prodIdx: 0, units: 1 },
    { brand: 'averX', date: '2026-09-01', city: 'bangalore', area: 'whitefield', storeId: '1400960', prodIdx: 0, units: 1 },
    { brand: 'averX', date: '2026-09-02', city: 'bangalore', area: 'electronic city', storeId: '1404599', prodIdx: 3, units: 1 },
    { brand: 'NAFA', date: '2026-09-02', city: 'bangalore', area: 'koramangala', storeId: '1404590', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-01', city: 'bangalore', area: 'anekal', storeId: '1399695', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-17', city: 'bangalore', area: 'vijayanagar', storeId: '1380899', prodIdx: 4, units: 1 },
    { brand: 'averX', date: '2026-09-17', city: 'bangalore', area: 'whitefield', storeId: '1403019', prodIdx: 3, units: 1 },
    { brand: 'NAFA', date: '2026-09-17', city: 'bangalore', area: 'rajarajeshwari', storeId: '1403224', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-17', city: 'bangalore', area: 'vijayanagar', storeId: '1402670', prodIdx: 2, units: 1 },
    { brand: 'averX', date: '2026-09-18', city: 'bangalore', area: 'rajajinagar', storeId: '1404884', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'bangalore', area: 'marathahalli', storeId: '1404911', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'chennai', area: 'mogappair', storeId: '1398756', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'bangalore', area: 'whitefield', storeId: '1400609', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'pune', area: 'wakad', storeId: '1404753', prodIdx: 5, units: 1 },
    { brand: 'averX', date: '2026-09-18', city: 'bangalore', area: 'mahadevapura', storeId: '1395434', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-23', city: 'bangalore', area: 'whitefield', storeId: '1400609', prodIdx: 5, units: 1 },
    { brand: 'NAFA', date: '2026-09-23', city: 'bangalore', area: 'jalahalli', storeId: '1401462', prodIdx: 4, units: 1 },
    { brand: 'averX', date: '2026-09-23', city: 'bangalore', area: 'kudlu gate', storeId: '1395720', prodIdx: 6, units: 1 },
    { brand: 'NAFA', date: '2026-09-23', city: 'bangalore', area: 'vijayanagar', storeId: '1380899', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-23', city: 'delhi', area: 'dilshad garden', storeId: '1403179', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-23', city: 'bangalore', area: 'devanahalli', storeId: '1402773', prodIdx: 4, units: 1 },
    { brand: 'averX', date: '2026-09-18', city: 'bangalore', area: 'marathahalli', storeId: '1401247', prodIdx: 7, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'bangalore', area: 'koramangala', storeId: '1396284', prodIdx: 4, units: 1 },
    { brand: 'averX', date: '2026-09-18', city: 'bangalore', area: 'btm', storeId: '1402444', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'pune', area: 'baner', storeId: '1389001', prodIdx: 5, units: 1 },
    { brand: 'averX', date: '2026-09-18', city: 'bangalore', area: 'whitefield', storeId: '1404581', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-18', city: 'bangalore', area: 'electronic city', storeId: '1385835', prodIdx: 5, units: 1 },
    { brand: 'NAFA', date: '2026-09-16', city: 'bangalore', area: 'btm', storeId: '1404944', prodIdx: 4, units: 1 },
    { brand: 'averX', date: '2026-09-16', city: 'bangalore', area: 'bellandur', storeId: '1403463', prodIdx: 6, units: 1 },
    { brand: 'NAFA', date: '2026-09-16', city: 'bangalore', area: 'rajarajeshwari', storeId: '1400922', prodIdx: 1, units: 1 },
    { brand: 'averX', date: '2026-09-16', city: 'bangalore', area: 'geddalahalli', storeId: '1400546', prodIdx: 0, units: 1 },
    { brand: 'averX', date: '2026-09-16', city: 'bangalore', area: 'koramangala', storeId: '1396284', prodIdx: 0, units: 1 },
    { brand: 'NAFA', date: '2026-09-14', city: 'bangalore', area: 'bellandur', storeId: '1405055', prodIdx: 5, units: 1 },
    { brand: 'NAFA', date: '2026-09-14', city: 'coimbatore', area: 'ganapathy', storeId: '1403359', prodIdx: 1, units: 1 },
    { brand: 'NAFA', date: '2026-09-14', city: 'bangalore', area: 'nagasandra', storeId: '1404799', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-16', city: 'bangalore', area: 'vijayanagar', storeId: '1402774', prodIdx: 4, units: 1 },
    { brand: 'NAFA', date: '2026-09-16', city: 'delhi', area: 'dilshad garden', storeId: '1403179', prodIdx: 4, units: 1 }
  ];

  exactScreenshotRows.forEach((r) => {
    const prod = TEMPLATE_PRODUCTS[r.prodIdx];
    const gmv = prod.baseMrp * r.units;

    records.push({
      id: `INSTA-${rowId++}`,
      brand: r.brand,
      orderedDate: r.date,
      date: r.date,
      city: r.city,
      reaName: r.area,
      storeId: r.storeId,
      l1Category: prod.l1,
      l2Category: prod.l2,
      l3Category: prod.l3,
      category: prod.l1,
      productName: prod.name,
      variant: prod.variant,
      itemCode: prod.itemCode,
      combo: 'No',
      mboItemCode: '0',
      baseMrp: prod.baseMrp,
      unitsSold: r.units,
      gmv,
      grossSales: gmv,
      costOfSales: 0,
      orders: 1,
      channel: 'Instamart'
    });
  });

  // Generate historical timeline across 2024, 2025, and 2026 for daily, weekly, monthly, and yearly reports
  // ONLY containing averX and NAFA
  const months = [
    // 2024
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    // 2025
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
    // 2026
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09'
  ];

  months.forEach((mStr, mIdx) => {
    const days = [2, 6, 11, 15, 20, 25];
    days.forEach(day => {
      const dayStr = `${mStr}-${String(day).padStart(2, '0')}`;
      const count = (mIdx % 2) + 2;

      for (let i = 0; i < count; i++) {
        const prod = TEMPLATE_PRODUCTS[(rowId + i) % TEMPLATE_PRODUCTS.length];
        const store = STORE_LOCATIONS[(rowId + i * 3) % STORE_LOCATIONS.length];
        const units = ((rowId + day) % 3) + 1;
        const gmv = prod.baseMrp * units;

        records.push({
          id: `INSTA-${rowId++}`,
          brand: prod.brand, // Only NAFA or averX
          orderedDate: dayStr,
          date: dayStr,
          city: store.city,
          reaName: store.area,
          storeId: store.storeId,
          l1Category: prod.l1,
          l2Category: prod.l2,
          l3Category: prod.l3,
          category: prod.l1,
          productName: prod.name,
          variant: prod.variant,
          itemCode: prod.itemCode,
          combo: 'No',
          mboItemCode: '0',
          baseMrp: prod.baseMrp,
          unitsSold: units,
          gmv,
          grossSales: gmv,
          costOfSales: 0,
          orders: 1,
          channel: 'Instamart'
        });
      }
    });
  });

  return records.sort((a, b) => b.orderedDate.localeCompare(a.orderedDate));
}

export const INITIAL_SALES_DATA: SaleRecord[] = generateInstamartData();
