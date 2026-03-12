import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialYear, Assumptions } from '../types';
import { USD_VND_EXCHANGE_RATE } from '../constants';

export const exportToExcel = (projections: FinancialYear[], assumptions: Assumptions, currency: string) => {
  const wb = XLSX.utils.book_new();
  
  // 1. Projections Sheet
  const formatVal = (val: number) => {
    return currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
  };

  const headers = ['Chỉ tiêu', ...projections.map(p => `Năm ${p.year}`)];
  
  const rows = [
    ['1. Kết quả hoạt động kinh doanh'],
    ['Doanh thu thuần', ...projections.map(p => formatVal(p.revenue))],
    [' - Doanh thu từ bán hàng', ...projections.map(p => formatVal(p.salesRevenue))],
    [' - Doanh thu từ vận hành', ...projections.map(p => formatVal(p.operatingRevenue))],
    ['Giá vốn hàng bán (COGS)', ...projections.map(p => -formatVal(p.cogs))],
    ['Lợi nhuận gộp', ...projections.map(p => formatVal(p.grossProfit))],
    ['Chi phí vận hành', ...projections.map(p => -formatVal(p.opex))],
    ['EBITDA', ...projections.map(p => formatVal(p.ebitda))],
    ['Khấu hao & Hao mòn', ...projections.map(p => -formatVal(p.depreciation))],
    ['Lợi nhuận thuần (EBIT)', ...projections.map(p => formatVal(p.ebit))],
    ['Chi phí lãi vay', ...projections.map(p => -formatVal(p.interest))],
    ['Thuế TNDN', ...projections.map(p => -formatVal(p.tax))],
    ['Lợi nhuận sau thuế', ...projections.map(p => formatVal(p.netIncome))],
    [],
    ['2. Lưu chuyển tiền tệ'],
    ['Lợi nhuận sau thuế', ...projections.map(p => formatVal(p.netIncome))],
    ['Cộng: Khấu hao', ...projections.map(p => formatVal(p.depreciation))],
    ['Trừ: Chi phí mua đất / M&A', ...projections.map(p => -formatVal(p.landCost))],
    ['Trừ: Chi phí xây dựng', ...projections.map(p => -formatVal(p.constructionCost))],
    ['Trừ: Chi phí khác & Dự phòng', ...projections.map(p => -formatVal(p.otherCost))],
    ['Trừ: Chi phí bảo trì (5% DT)', ...projections.map(p => -formatVal(p.revenue * 0.05))],
    ['Dòng tiền tự do (FCF)', ...projections.map(p => formatVal(p.fcf))],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo Tài chính');

  // 2. Assumptions Sheet
  const assumptionRows = Object.entries(assumptions).map(([key, value]) => {
    return [key, Array.isArray(value) ? value.join(', ') : value];
  });
  const wsAssumptions = XLSX.utils.aoa_to_sheet([['Giả định', 'Giá trị'], ...assumptionRows]);
  XLSX.utils.book_append_sheet(wb, wsAssumptions, 'Giả định');

  XLSX.writeFile(wb, `Bao_cao_Tai_chinh_${new Date().getTime()}.xlsx`);
};

export const exportToPDF = (projections: FinancialYear[], currency: string) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const formatVal = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(converted);
  };

  doc.setFontSize(18);
  doc.text('BÁO CÁO TÀI CHÍNH DỰ ÁN', 14, 22);
  doc.setFontSize(10);
  doc.text(`Đơn vị tiền tệ: ${currency}`, 14, 30);

  const headers = [['Chỉ tiêu', ...projections.map(p => `Năm ${p.year}`)]];
  const body = [
    ['1. KẾT QUẢ KINH DOANH', ...projections.map(() => '')],
    ['Doanh thu thuần', ...projections.map(p => formatVal(p.revenue))],
    [' - Doanh thu bán hàng', ...projections.map(p => formatVal(p.salesRevenue))],
    [' - Doanh thu vận hành', ...projections.map(p => formatVal(p.operatingRevenue))],
    ['Lợi nhuận gộp', ...projections.map(p => formatVal(p.grossProfit))],
    ['EBITDA', ...projections.map(p => formatVal(p.ebitda))],
    ['Lợi nhuận sau thuế', ...projections.map(p => formatVal(p.netIncome))],
    ['', ...projections.map(() => '')],
    ['2. LƯU CHUYỂN TIỀN TỆ', ...projections.map(() => '')],
    ['Dòng tiền tự do (FCF)', ...projections.map(p => formatVal(p.fcf))],
  ];

  autoTable(doc, {
    startY: 35,
    head: headers,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 8, cellPadding: 2 },
    didParseCell: (data) => {
      if (data.section === 'body' && (data.row.index === 0 || data.row.index === 8)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  });

  doc.save(`Bao_cao_Tai_chinh_${new Date().getTime()}.pdf`);
};
