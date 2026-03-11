import React from 'react';
import { DebtYear } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  debtSchedule: DebtYear[];
  currency: Currency;
}

export const DebtSchedule: React.FC<Props> = ({ debtSchedule, currency }) => {
  const formatCurrency = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(converted);
  };

  const chartData = debtSchedule.map(d => ({
    year: `FY ${d.year}`,
    interest: currency === 'VND' ? d.interestPayment * USD_VND_EXCHANGE_RATE : d.interestPayment,
    principal: currency === 'VND' ? d.principalPayment * USD_VND_EXCHANGE_RATE : d.principalPayment,
  }));

  const Row = ({ label, data, isBold = false, isSubtotal = false }: any) => (
    <tr className={isSubtotal ? 'bg-slate-50' : ''}>
      <td className={`financial-table-label ${isBold ? 'font-bold' : ''}`}>{label}</td>
      {data.map((val: number, i: number) => (
        <td key={i} className={`financial-table-cell ${isBold ? 'font-bold' : ''}`}>
          {formatCurrency(val)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6">Biểu đồ Trả nợ</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="principal" name="Trả gốc" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" name="Trả lãi" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="financial-table-label text-xs uppercase text-slate-400">Lịch trả nợ chi tiết</th>
              {debtSchedule.map(d => (
                <th key={d.year} className="financial-table-header">Năm {d.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Số dư đầu kỳ" data={debtSchedule.map(d => d.openingBalance)} isBold />
            <Row label="Trả lãi" data={debtSchedule.map(d => d.interestPayment)} />
            <Row label="Trả gốc" data={debtSchedule.map(d => d.principalPayment)} />
            <Row label="Tổng nghĩa vụ trả nợ" data={debtSchedule.map(d => d.totalPayment)} isBold isSubtotal />
            <Row label="Số dư cuối kỳ" data={debtSchedule.map(d => d.closingBalance)} isBold />
          </tbody>
        </table>
      </div>
    </div>
  );
};
