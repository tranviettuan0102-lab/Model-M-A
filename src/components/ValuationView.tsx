import React from 'react';
import { ValuationResult, FinancialYear } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  valuation: ValuationResult;
  projections: FinancialYear[];
  currency: Currency;
}

export const ValuationView: React.FC<Props> = ({ valuation, projections, currency }) => {
  const formatCurrency = (val: number, isCompact = false) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      notation: isCompact ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(converted);
  };

  const chartData = projections.map(p => ({
    year: `FY ${p.year}`,
    fcf: currency === 'VND' ? p.fcf * USD_VND_EXCHANGE_RATE : p.fcf,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Giá trị Doanh nghiệp', value: formatCurrency(valuation.enterpriseValue), color: 'text-emerald-600' },
          { label: 'Giá trị Vốn chủ sở hữu', value: formatCurrency(valuation.equityValue), color: 'text-blue-600' },
          { label: 'Giá trị vĩnh viễn', value: formatCurrency(valuation.terminalValue), color: 'text-slate-600' },
          { label: 'NPV của Dòng tiền', value: formatCurrency(valuation.dcfValue), color: 'text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Dự phóng Dòng tiền tự do (FCF)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => formatCurrency(val, true)} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="fcf" name="Dòng tiền" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Cấu thành Giá trị (Valuation Bridge)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">NPV của các năm dự báo</span>
              <span className="font-mono font-bold">{formatCurrency(valuation.dcfValue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Giá trị vĩnh viễn chiết khấu</span>
              <span className="font-mono font-bold">{formatCurrency(valuation.enterpriseValue - valuation.dcfValue)}</span>
            </div>
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm font-bold text-emerald-900">Tổng Giá trị Doanh nghiệp</span>
              <span className="font-mono font-bold text-emerald-700">{formatCurrency(valuation.enterpriseValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
