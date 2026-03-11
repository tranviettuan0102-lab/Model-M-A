import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Settings, Table as TableIcon, BarChart3, Briefcase, ChevronRight, Zap, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Assumptions, FinancialYear, ValuationResult } from './types';
import { DEFAULT_ASSUMPTIONS, BASE_REVENUE, USD_VND_EXCHANGE_RATE } from './constants';
import { calculateProjections, calculateValuation, calculateDebtSchedule } from './utils/finance';
import { AssumptionPanel } from './components/AssumptionPanel';
import { FinancialsTable } from './components/FinancialsTable';
import { ValuationView } from './components/ValuationView';
import { FeasibilityDashboard } from './components/FeasibilityDashboard';
import { MAAnalysis } from './components/MAAnalysis';
import { DebtSchedule } from './components/DebtSchedule';

type Tab = 'dashboard' | 'assumptions' | 'financials' | 'valuation' | 'ma' | 'debt';
export type Currency = 'USD' | 'VND';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [currency, setCurrency] = useState<Currency>('USD');

  const formatValue = (val: number, isCompact = false) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: currency,
      notation: isCompact ? 'compact' : 'standard',
      maximumFractionDigits: currency === 'VND' ? 0 : 0,
    }).format(converted);
  };

  // 1. Initial long-term projections to find payback period
  const baseProjections = useMemo(() => 
    calculateProjections(assumptions, 20), 
  [assumptions]);

  const baseValuation = useMemo(() => 
    calculateValuation(baseProjections, assumptions), 
  [baseProjections, assumptions]);

  // 2. Determine how many years to show (min 5, max 20, at least 2 after payback)
  const yearsToShow = useMemo(() => {
    const pb = Math.ceil(baseValuation.paybackPeriod);
    const target = pb + 2;
    return Math.min(20, Math.max(5, target));
  }, [baseValuation.paybackPeriod]);

  // 3. Final projections and valuation for the report period
  const projections = useMemo(() => 
    calculateProjections(assumptions, yearsToShow), 
  [assumptions, yearsToShow]);

  const valuation = useMemo(() => 
    calculateValuation(projections, assumptions), 
  [projections, assumptions]);

  const debtSchedule = useMemo(() => 
    calculateDebtSchedule(
      assumptions.purchasePrice, 
      assumptions.debtRatio, 
      assumptions.interestRate,
      assumptions.loanTerm,
      assumptions.repaymentMethod,
      assumptions.gracePeriod,
      yearsToShow
    ),
  [assumptions, yearsToShow]);

  const tabs = [
    { id: 'dashboard', label: 'Tính khả thi', icon: LayoutDashboard },
    { id: 'assumptions', label: 'Giả định', icon: Settings },
    { id: 'financials', label: 'Báo cáo TC', icon: TableIcon },
    { id: 'valuation', label: 'Định giá', icon: BarChart3 },
    { id: 'ma', label: 'Phân tích M&A', icon: Zap },
    { id: 'debt', label: 'Lịch trả nợ', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex bg-brand-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-primary text-white flex flex-col p-6 fixed h-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Mô hình M&A</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phiên bản Pro</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'group-hover:text-white'} />
              <span className="text-sm font-semibold">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Trạng thái mục tiêu</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">Phân tích trực tiếp</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
              Lập mô hình tài chính
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex bg-white/10 p-1 rounded-lg">
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                USD
              </button>
              <button 
                onClick={() => setCurrency('VND')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currency === 'VND' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                VND
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Giá trị Doanh nghiệp</p>
              <p className="text-lg font-mono font-bold text-slate-900">
                {formatValue(valuation.enterpriseValue, true)}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">IRR</p>
              <p className="text-lg font-mono font-bold text-emerald-600">
                {(valuation.irr * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <FeasibilityDashboard valuation={valuation} currency={currency} assumptions={assumptions} />}
            {activeTab === 'assumptions' && <AssumptionPanel assumptions={assumptions} onChange={setAssumptions} currency={currency} />}
            {activeTab === 'financials' && <FinancialsTable projections={projections} currency={currency} />}
            {activeTab === 'valuation' && <ValuationView valuation={valuation} projections={projections} currency={currency} />}
            {activeTab === 'ma' && <MAAnalysis assumptions={assumptions} valuation={valuation} projections={projections} currency={currency} />}
            {activeTab === 'debt' && <DebtSchedule debtSchedule={debtSchedule} currency={currency} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
