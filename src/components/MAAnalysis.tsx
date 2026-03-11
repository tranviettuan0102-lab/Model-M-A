import React from 'react';
import { Assumptions, ValuationResult, FinancialYear } from '../types';
import { Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  assumptions: Assumptions;
  valuation: ValuationResult;
  projections: FinancialYear[];
  currency: Currency;
}

export const MAAnalysis: React.FC<Props> = ({ assumptions, valuation, projections, currency }) => {
  const formatCurrency = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(converted);
  };

  // Simplified Accretion/Dilution
  // Assume Buyer has $100M Market Cap, $10M Net Income
  const buyerNetIncome = 10000000;
  const buyerShares = 1000000;
  const buyerEPS = buyerNetIncome / buyerShares;
  
  const targetNetIncome = projections.find(p => p.revenue > 0)?.netIncome || 0;
  const totalNetIncome = buyerNetIncome + targetNetIncome + (assumptions.synergies * (1 - assumptions.taxRate));
  const newShares = buyerShares + (assumptions.purchasePrice * (1 - assumptions.debtRatio) / 100); // Assume $100 share price
  const proFormaEPS = totalNetIncome / newShares;
  const accretion = (proFormaEPS / buyerEPS) - 1;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            Nguồn & Sử dụng vốn (Sources & Uses)
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Sử dụng vốn (Uses)</p>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-2">
                <span className="text-sm text-slate-600">Giá mua mục tiêu</span>
                <span className="font-mono font-bold">{formatCurrency(assumptions.purchasePrice)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Chi phí giao dịch (Ước tính)</span>
                <span className="font-mono font-bold">{formatCurrency(assumptions.purchasePrice * 0.02)}</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Nguồn vốn (Sources)</p>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-2">
                <span className="text-sm text-slate-600">Nợ vay mới ({(assumptions.debtRatio * 100).toFixed(0)}%)</span>
                <span className="font-mono font-bold">{formatCurrency(assumptions.purchasePrice * assumptions.debtRatio)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Vốn chủ sở hữu đóng góp</span>
                <span className="font-mono font-bold">{formatCurrency(assumptions.purchasePrice * (1 - assumptions.debtRatio))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-500" />
            Phân tích Accretion / Dilution
          </h3>
          <div className="p-6 bg-slate-50 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tác động EPS ước tính</p>
            <p className={`text-4xl font-black ${accretion > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {accretion > 0 ? '+' : ''}{(accretion * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {accretion > 0 ? 'Gia tăng giá trị (Accretive)' : 'Pha loãng giá trị (Dilutive)'}
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">EPS Bên mua (Độc lập)</span>
              <span className="font-mono font-bold">${buyerEPS.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">EPS Hợp nhất (Dự kiến)</span>
              <span className="font-mono font-bold">${proFormaEPS.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ngưỡng cộng hưởng để Accretive</span>
              <span className="font-mono font-bold">{formatCurrency(Math.max(0, (buyerEPS * newShares - buyerNetIncome - targetNetIncome) / (1 - assumptions.taxRate)))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
