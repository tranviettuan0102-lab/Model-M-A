import { Assumptions, FinancialYear, ValuationResult, DebtYear } from '../types';

export function calculateDebtSchedule(
  purchasePrice: number,
  debtRatio: number,
  interestRate: number,
  loanTerm: number,
  repaymentMethod: 'reducing_balance' | 'annuity',
  gracePeriod: number,
  projectionYears: number = 5
): DebtYear[] {
  const initialDebt = purchasePrice * debtRatio;
  const debtSchedule: DebtYear[] = [];
  let currentBalance = initialDebt;
  
  // Calculate constant payment for annuity if needed
  // PMT = P * r * (1+r)^n / ((1+r)^n - 1)
  // n is the repayment period (loanTerm - gracePeriod)
  const repaymentYears = Math.max(1, loanTerm - gracePeriod);
  const annuityPayment = repaymentMethod === 'annuity' 
    ? (initialDebt * interestRate * Math.pow(1 + interestRate, repaymentYears)) / (Math.pow(1 + interestRate, repaymentYears) - 1)
    : 0;

  for (let i = 1; i <= projectionYears; i++) {
    const openingBalance = currentBalance;
    const interestPayment = openingBalance * interestRate;
    
    let principalPayment = 0;
    
    // Check if we are in the repayment period (after grace period and within loan term)
    if (i > gracePeriod && i <= loanTerm) {
      if (repaymentMethod === 'reducing_balance') {
        principalPayment = initialDebt / repaymentYears;
      } else {
        // Annuity: Principal = Total Payment - Interest
        principalPayment = annuityPayment - interestPayment;
      }
    }

    // Ensure we don't pay more than the remaining balance
    principalPayment = Math.min(openingBalance, Math.max(0, principalPayment));
    
    const totalPayment = interestPayment + principalPayment;
    const closingBalance = Math.max(0, openingBalance - principalPayment);

    debtSchedule.push({
      year: new Date().getFullYear() + i,
      openingBalance,
      interestPayment,
      principalPayment,
      totalPayment,
      closingBalance,
    });

    currentBalance = closingBalance;
  }

  return debtSchedule;
}

export function calculateProjections(
  assumptions: Assumptions,
  years: number = 5
): FinancialYear[] {
  const projections: FinancialYear[] = [];
  
  // Recalculate investment components to distribute them
  const gfa = assumptions.landArea * assumptions.far;
  const constructionCostTotal = gfa * assumptions.unitConstructionCost;
  const landCostTotal = assumptions.landArea * assumptions.landCostPerSqm;
  const otherCostTotal = constructionCostTotal * assumptions.otherCostRatio;
  const totalBeforeContingency = constructionCostTotal + landCostTotal + otherCostTotal;
  const totalInvestment = totalBeforeContingency / (1 - assumptions.contingencyRatio);
  const contingencyTotal = totalInvestment - totalBeforeContingency;
  
  // Annual construction cost (excluding other costs and contingency)
  const annualConstructionCost = constructionCostTotal / Math.max(1, assumptions.constructionYears);
  // Other costs and contingency distributed from Year 0 to Year constructionYears
  const annualOtherCost = (otherCostTotal + contingencyTotal) / (assumptions.constructionYears + 1);

  const debtSchedule = calculateDebtSchedule(
    assumptions.purchasePrice,
    assumptions.debtRatio,
    assumptions.interestRate,
    assumptions.loanTerm,
    assumptions.repaymentMethod,
    assumptions.gracePeriod,
    years + 1 // Add one year for Year 0
  );

  let remainingSaleableArea = assumptions.saleableArea;

  // Loop from Year 0 to Year N
  for (let i = 0; i <= years; i++) {
    const yearIndex = i;
    // Growth factor starts from Year 1 of operation
    const operationYear = Math.max(0, i - assumptions.constructionYears - 1);
    const growthFactor = Math.pow(1 + assumptions.revenueGrowth, operationYear);

    let salesRevenue = 0;
    let operatingRevenue = 0;
    let landCost = 0;
    let constructionCost = 0;
    let otherCost = 0;

    // 0. Capex Allocation
    if (i === 0) {
      landCost = landCostTotal;
      otherCost = annualOtherCost;
    } else if (i <= assumptions.constructionYears) {
      constructionCost = annualConstructionCost;
      otherCost = annualOtherCost;
    }

    // 1. Hotel Revenue (Only after construction)
    if (['hotel_mall_office', 'condotel_mall'].includes(assumptions.projectType) && i > assumptions.constructionYears) {
      const hotelRev = assumptions.hotelRooms * (assumptions.hotelAdr * growthFactor) * assumptions.hotelOccupancy * 365;
      operatingRevenue += hotelRev;
    }

    // 2. Mall Revenue (Only after construction)
    if (['hotel_mall_office', 'apartment_mall', 'condotel_mall'].includes(assumptions.projectType) && i > assumptions.constructionYears) {
      const mallRev = assumptions.mallArea * (assumptions.mallRentPerSqm * growthFactor) * assumptions.mallOccupancy * 12;
      operatingRevenue += mallRev;
    }

    // 3. Office Revenue (Only after construction)
    if (assumptions.projectType === 'hotel_mall_office' && i > assumptions.constructionYears) {
      const officeRev = assumptions.officeArea * (assumptions.officeRentPerSqm * growthFactor) * assumptions.officeOccupancy * 12;
      operatingRevenue += officeRev;
    }

    // 4. Sales Revenue (Apartment, Condotel, Villa) (Only after sales launch)
    if (['apartment_mall', 'condotel_mall', 'luxury_villa', 'urban_area'].includes(assumptions.projectType) && i >= assumptions.salesLaunchYear) {
      const salesYearIndex = i - assumptions.salesLaunchYear;
      if (salesYearIndex < assumptions.salesDuration) {
        const progressThisYear = assumptions.salesProgress[salesYearIndex] || 0;
        const areaSoldThisYear = assumptions.saleableArea * progressThisYear;
        const salesRev = areaSoldThisYear * (assumptions.salePricePerSqm * growthFactor);
        salesRevenue += salesRev;
        remainingSaleableArea -= areaSoldThisYear;
      }
    }

    const yearRevenue = salesRevenue + operatingRevenue;
    const grossProfit = yearRevenue * assumptions.grossMargin;
    const cogs = yearRevenue - grossProfit;
    const opex = yearRevenue * assumptions.opexRatio;
    const ebitda = grossProfit - opex;
    const depreciation = i > assumptions.constructionYears ? assumptions.purchasePrice * 0.05 : 0; 
    const ebit = ebitda - depreciation;
    
    // Use interest from debt schedule (Debt schedule index 0 corresponds to Year 1)
    const interest = i > 0 && debtSchedule[i - 1] ? debtSchedule[i - 1].interestPayment : 0;
    
    const tax = Math.max(0, (ebit - interest) * assumptions.taxRate);
    const netIncome = ebit - interest - tax;
    
    const totalCapex = landCost + constructionCost + otherCost;
    // FCF: Net Income + Depreciation - Capex - Maintenance Capex (5% of revenue)
    const fcf = netIncome + depreciation - totalCapex - (yearRevenue * 0.05);

    projections.push({
      year: new Date().getFullYear() + i,
      revenue: yearRevenue,
      salesRevenue,
      operatingRevenue,
      cogs,
      grossProfit,
      opex,
      ebitda,
      depreciation,
      ebit,
      interest,
      tax,
      netIncome,
      landCost,
      constructionCost,
      otherCost,
      totalCapex,
      fcf,
    });
  }

  return projections;
}

export function calculateValuation(
  projections: FinancialYear[],
  assumptions: Assumptions
): ValuationResult {
  const { wacc, terminalGrowth, purchasePrice } = assumptions;
  
  // DCF
  let npv = 0;
  projections.forEach((p, i) => {
    // Year 0 is not discounted, Year 1 is discounted by (1+r)^1, etc.
    npv += p.fcf / Math.pow(1 + wacc, i);
  });

  const lastYearFcf = projections[projections.length - 1].fcf;
  const terminalValue = (lastYearFcf * (1 + terminalGrowth)) / (wacc - terminalGrowth);
  const discountedTerminalValue = terminalValue / Math.pow(1 + wacc, projections.length - 1);
  
  const enterpriseValue = npv + discountedTerminalValue;
  const equityValue = enterpriseValue - (purchasePrice * assumptions.debtRatio);

  // IRR
  // Cashflows are now directly from projections as they include Year 0 Capex
  const cashflows = projections.map(p => p.fcf);
  cashflows[cashflows.length - 1] += terminalValue;
  
  // Simple IRR solver
  let irr = 0.1;
  for (let i = 0; i < 50; i++) {
    let currentNpv = 0;
    cashflows.forEach((cf, t) => {
      currentNpv += cf / Math.pow(1 + irr, t);
    });
    if (Math.abs(currentNpv) < 1) break;
    irr += currentNpv / Math.abs(cashflows[0] || 1) * 0.1;
  }

  // Calculate Payback Period
  let cumulativeCashFlow = 0;
  let paybackPeriod = projections.length;
  for (let i = 0; i < projections.length; i++) {
    const prevCumulative = cumulativeCashFlow;
    cumulativeCashFlow += projections[i].fcf;
    if (cumulativeCashFlow >= 0 && i > 0) {
      paybackPeriod = i - 1 + Math.abs(prevCumulative) / (projections[i].fcf || 1);
      break;
    }
  }

  return {
    dcfValue: npv,
    terminalValue,
    enterpriseValue,
    equityValue,
    irr,
    npv: enterpriseValue, // Since Year 0 land cost is already in NPV sum
    paybackPeriod,
  };
}
