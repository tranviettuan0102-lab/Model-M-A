import { Assumptions } from './types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  projectType: 'hotel_mall_office',
  revenueGrowth: 0.15, // 15%
  grossMargin: 0.60, // 60%
  opexRatio: 0.30, // 30%
  taxRate: 0.20, // 20%
  wacc: 0.10, // 10%
  terminalGrowth: 0.02, // 2%
  purchasePrice: 5000000, // $5M
  synergies: 500000, // $500k
  debtRatio: 0.40, // 40%
  interestRate: 0.06, // 6%
  loanTerm: 5, // 5 years
  repaymentMethod: 'reducing_balance',
  gracePeriod: 0, // 0 years
  // Project-specific drivers
  hotelRooms: 200,
  hotelAdr: 150, // $150
  hotelOccupancy: 0.75, // 75%
  mallArea: 5000, // 5000 sqm
  mallRentPerSqm: 40, // $40/sqm
  mallOccupancy: 0.85, // 85%
  saleableArea: 10000, // 10000 sqm
  salePricePerSqm: 3000, // $3000/sqm
  salesVelocity: 0.20, // 20% sold per year
  salesDuration: 3, // 3 years of sales
  salesProgress: [0.3, 0.4, 0.3], // 30%, 40%, 30%
  officeArea: 3000, // 3000 sqm
  officeRentPerSqm: 25, // $25/sqm
  officeOccupancy: 0.80, // 80%
  // Construction Specs
  landArea: 5000, // 5000 sqm
  far: 8.0, // Floor Area Ratio
  constructionDensity: 0.40, // 40%
  maxFloors: 25, // 25 floors
  floorEfficiency: 0.85, // 85% net-to-gross
  avgRoomSize: 40, // 40 sqm per room
  // Investment Cost (826/QĐ-BXD 2024)
  unitConstructionCost: 800, // ~$800/m2 GFA
  landCostPerSqm: 2000, // ~$2000/m2 land
  otherCostRatio: 0.15, // 15% of construction
  contingencyRatio: 0.10, // 10% of total
  // Timing
  constructionYears: 2, // 2 years of construction
  salesLaunchYear: 1, // Sales start after 1 year
};

export const BASE_REVENUE = 1000000; // $1M

// 826/QĐ-BXD 2024 (Approximate values in USD/m2)
export const UNIT_COSTS_BXD_2024 = {
  apartment: 650, // ~16M VND/m2
  hotel_5_star: 1300, // ~32M VND/m2
  office: 800, // ~20M VND/m2
  mall: 900, // ~22M VND/m2
  villa: 500, // ~12M VND/m2
};
export const USD_VND_EXCHANGE_RATE = 25000;
