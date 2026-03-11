export interface DebtYear {
  year: number;
  openingBalance: number;
  interestPayment: number;
  principalPayment: number;
  totalPayment: number;
  closingBalance: number;
}

export interface FinancialYear {
  year: number;
  revenue: number;
  salesRevenue: number;
  operatingRevenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  tax: number;
  netIncome: number;
  landCost: number;
  constructionCost: number;
  otherCost: number;
  totalCapex: number;
  fcf: number;
}

export type ProjectType = 
  | 'hotel_mall_office' 
  | 'apartment_mall' 
  | 'condotel_mall' 
  | 'luxury_villa' 
  | 'urban_area';

export type RepaymentMethod = 'reducing_balance' | 'annuity';

export interface Assumptions {
  projectType: ProjectType;
  revenueGrowth: number;
  grossMargin: number;
  opexRatio: number;
  taxRate: number;
  wacc: number;
  terminalGrowth: number;
  purchasePrice: number;
  synergies: number;
  debtRatio: number;
  interestRate: number;
  loanTerm: number;
  repaymentMethod: RepaymentMethod;
  gracePeriod: number;
  // Project-specific drivers
  hotelRooms: number;
  hotelAdr: number;
  hotelOccupancy: number;
  mallArea: number;
  mallRentPerSqm: number;
  mallOccupancy: number;
  saleableArea: number;
  salePricePerSqm: number;
  salesVelocity: number; // % sold per year (legacy, will keep for now but use salesProgress if duration > 0)
  salesDuration: number; // number of years for sales
  salesProgress: number[]; // % sold each year
  officeArea: number;
  officeRentPerSqm: number;
  officeOccupancy: number;
  // Construction Specs
  landArea: number;
  far: number;
  constructionDensity: number;
  maxFloors: number;
  floorEfficiency: number;
  avgRoomSize: number;
  // Investment Cost (826/QĐ-BXD 2024)
  unitConstructionCost: number; // USD/m2
  landCostPerSqm: number; // USD/m2
  otherCostRatio: number; // % of construction
  contingencyRatio: number; // % of total
  // Timing
  constructionYears: number;
  salesLaunchYear: number;
}

export interface ValuationResult {
  dcfValue: number;
  terminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  irr: number;
  npv: number;
  paybackPeriod: number;
}
