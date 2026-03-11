import React from 'react';
import { ValuationResult, Assumptions, ProjectType } from '../types';
import { TrendingUp, Target, Clock, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  valuation: ValuationResult;
  currency: Currency;
  assumptions: Assumptions;
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  hotel_mall_office: 'Dự án đầu tư khách sạn kết hợp trung tâm thương mại và văn phòng cho thuê',
  apartment_mall: 'Dự án chung cư kết hợp trung tâm thương mại',
  condotel_mall: 'Dự án đầu tư condotel và trung tâm thương mại',
  luxury_villa: 'Dự án biệt thự cao cấp',
  urban_area: 'Dự án đầu tư khu đô thị',
};

export const FeasibilityDashboard: React.FC<Props> = ({ valuation, currency, assumptions }) => {
  const isFeasible = valuation.irr > 0.15 && valuation.npv > 0;

  const formatCurrency = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(converted);
  };

  const MetricCard = ({ label, value, icon: Icon, color, description }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={color} size={24} />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold ${color.replace('bg-', 'text-')}`}>{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-500 bg-opacity-10 rounded-xl text-emerald-600">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại hình dự án</p>
          <h3 className="text-lg font-bold text-slate-900">{PROJECT_TYPE_LABELS[assumptions.projectType]}</h3>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isFeasible ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} flex items-center gap-6`}>
        <div className={`p-4 rounded-full ${isFeasible ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
          {isFeasible ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isFeasible ? 'text-emerald-900' : 'text-amber-900'}`}>
            {isFeasible ? 'Thương vụ Khả thi' : 'Cần thận trọng'}
          </h2>
          <p className={`text-sm ${isFeasible ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isFeasible 
              ? 'Dự án đáp ứng ngưỡng IRR tối thiểu 15% và tạo ra NPV dương.' 
              : 'Lợi nhuận dự án thấp hơn ngưỡng điều chỉnh rủi ro. Hãy xem lại các giả định.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Tỷ suất hoàn vốn (IRR)" 
          value={`${(valuation.irr * 100).toFixed(1)}%`} 
          icon={TrendingUp} 
          color="text-emerald-600"
          description="Tỷ lệ lợi nhuận kép hàng năm có thể đạt được trên số vốn đã đầu tư."
        />
        <MetricCard 
          label="Giá trị hiện tại thuần (NPV)" 
          value={formatCurrency(valuation.npv)} 
          icon={Target} 
          color="text-blue-600"
          description="Sự chênh lệch giữa giá trị hiện tại của dòng tiền vào và dòng tiền ra."
        />
        <MetricCard 
          label="Thời gian hoàn vốn" 
          value={`${valuation.paybackPeriod.toFixed(1)} Năm`} 
          icon={Clock} 
          color="text-indigo-600"
          description="Thời gian cần thiết để thu hồi chi phí đầu tư ban đầu."
        />
        <MetricCard 
          label="Chỉ số sinh lời (PI)" 
          value={(valuation.enterpriseValue / (valuation.enterpriseValue - valuation.npv)).toFixed(2)} 
          icon={ShieldCheck} 
          color="text-violet-600"
          description="Tỷ lệ giữa giá trị nhận được và chi phí đầu tư. PI > 1.0 là tốt."
        />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Phân tích Độ nhạy (Heatmap)</h3>
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1"></div>
          {[0.08, 0.09, 0.10, 0.11, 0.12].map(w => (
            <div key={w} className="text-center text-[10px] font-bold text-slate-400 uppercase">WACC {(w*100).toFixed(0)}%</div>
          ))}
          {[0.10, 0.12, 0.15, 0.18, 0.20].map(g => (
            <React.Fragment key={g}>
              <div className="text-right pr-4 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-end">Tăng trưởng {(g*100).toFixed(0)}%</div>
              {[0.08, 0.09, 0.10, 0.11, 0.12].map(w => {
                const score = (g * 10) - (w * 10);
                const opacity = Math.min(Math.max(score + 0.5, 0.1), 0.9);
                return (
                  <div 
                    key={`${g}-${w}`} 
                    className="h-12 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})`, color: opacity > 0.5 ? 'white' : '#065f46' }}
                  >
                    {(valuation.irr * (1 + (g-0.15) - (w-0.10)) * 100).toFixed(1)}%
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-8 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-100"></div>
            <span>Lợi nhuận thấp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-600"></div>
            <span>Lợi nhuận cao</span>
          </div>
        </div>
      </div>
    </div>
  );
};
