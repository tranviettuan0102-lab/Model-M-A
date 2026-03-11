import React from 'react';
import { FinancialYear } from '../types';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  projections: FinancialYear[];
  currency: Currency;
}

export const FinancialsTable: React.FC<Props> = ({ projections, currency }) => {
  const formatCurrency = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(converted);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <thead>
      <tr className="bg-slate-50/50">
        <th className="financial-table-label text-xs font-bold uppercase text-slate-900 py-4 border-y border-slate-100" colSpan={projections.length + 1}>
          {title}
        </th>
      </tr>
      <tr>
        <th className="financial-table-label text-[10px] uppercase text-slate-400 font-medium">Chỉ tiêu</th>
        {projections.map(p => (
          <th key={p.year} className="financial-table-header text-[10px] font-bold text-slate-600">Năm {p.year}</th>
        ))}
      </tr>
    </thead>
  );

  const Row = ({ label, data, isBold = false, isSubtotal = false, indent = false }: any) => (
    <tr className={`${isSubtotal ? 'bg-slate-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
      <td className={`financial-table-label ${isBold ? 'font-bold text-slate-900' : 'text-slate-600'} ${indent ? 'pl-8' : ''}`}>
        {label}
      </td>
      {data.map((val: number, i: number) => (
        <td key={i} className={`financial-table-cell ${isBold ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
          {formatCurrency(val)}
        </td>
      ))}
    </tr>
  );

  // Calculate cumulative cash for balance section
  let cumulativeCash = 0;
  const cashBalanceData = projections.map(p => {
    const beginning = cumulativeCash;
    const net = p.fcf;
    cumulativeCash += net;
    return { beginning, net, ending: cumulativeCash };
  });

  return (
    <div className="space-y-8 overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-1">
      <table className="w-full border-collapse min-w-[800px]">
        {/* Section 1: Income Statement */}
        <SectionHeader title="1. Kết quả hoạt động kinh doanh" />
        <tbody>
          <Row label="Doanh thu thuần" data={projections.map(p => p.revenue)} isBold />
          <Row label="- Doanh thu từ bán hàng" data={projections.map(p => p.salesRevenue)} indent />
          <Row label="- Doanh thu từ vận hành" data={projections.map(p => p.operatingRevenue)} indent />
          <Row label="Giá vốn hàng bán (COGS)" data={projections.map(p => -p.cogs)} indent />
          <Row label="Lợi nhuận gộp" data={projections.map(p => p.grossProfit)} isBold isSubtotal />
          <Row label="Chi phí vận hành" data={projections.map(p => -p.opex)} indent />
          <Row label="EBITDA" data={projections.map(p => p.ebitda)} isBold isSubtotal />
          <Row label="Khấu hao & Hao mòn" data={projections.map(p => -p.depreciation)} indent />
          <Row label="Lợi nhuận thuần (EBIT)" data={projections.map(p => p.ebit)} isBold />
          <Row label="Chi phí lãi vay" data={projections.map(p => -p.interest)} indent />
          <Row label="Thuế TNDN" data={projections.map(p => -p.tax)} indent />
          <Row label="Lợi nhuận sau thuế" data={projections.map(p => p.netIncome)} isBold isSubtotal />
        </tbody>

        <tr className="h-8"></tr>

        {/* Section 2: Cash Flow Statement */}
        <SectionHeader title="2. Lưu chuyển tiền tệ" />
        <tbody>
          <Row label="Lợi nhuận sau thuế" data={projections.map(p => p.netIncome)} isBold />
          <Row label="Cộng: Khấu hao" data={projections.map(p => p.depreciation)} indent />
          <Row label="Trừ: Chi phí mua đất / M&A" data={projections.map(p => -p.landCost)} indent />
          <Row label="Trừ: Chi phí xây dựng" data={projections.map(p => -p.constructionCost)} indent />
          <Row label="Trừ: Chi phí khác & Dự phòng" data={projections.map(p => -p.otherCost)} indent />
          <Row label="Trừ: Chi phí bảo trì (5% DT)" data={projections.map(p => -(p.revenue * 0.05))} indent />
          <Row label="Dòng tiền tự do (FCF)" data={projections.map(p => p.fcf)} isBold isSubtotal />
        </tbody>

        <tr className="h-8"></tr>

        {/* Section 3: Cash Flow Balance */}
        <SectionHeader title="3. Cân đối dòng tiền" />
        <tbody>
          <Row label="Dòng tiền đầu kỳ" data={cashBalanceData.map(d => d.beginning)} />
          <Row label="Dòng tiền trong kỳ (Net Cash Flow)" data={cashBalanceData.map(d => d.net)} isBold />
          <Row label="Dòng tiền cuối kỳ" data={cashBalanceData.map(d => d.ending)} isBold isSubtotal />
        </tbody>
      </table>
    </div>
  );
};
