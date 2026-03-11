import React from 'react';
import { Assumptions, ProjectType } from '../types';
import { Info } from 'lucide-react';
import { Currency } from '../App';
import { USD_VND_EXCHANGE_RATE } from '../constants';

interface Props {
  assumptions: Assumptions;
  onChange: (newAssumptions: Assumptions) => void;
  currency: Currency;
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  hotel_mall_office: 'Dự án đầu tư khách sạn kết hợp trung tâm thương mại và văn phòng cho thuê',
  apartment_mall: 'Dự án chung cư kết hợp trung tâm thương mại',
  condotel_mall: 'Dự án đầu tư condotel và trung tâm thương mại',
  luxury_villa: 'Dự án biệt thự cao cấp',
  urban_area: 'Dự án đầu tư khu đô thị',
};

const REPAYMENT_METHOD_LABELS: Record<string, string> = {
  reducing_balance: 'Dư nợ giảm dần',
  annuity: 'Trả đều hàng năm (Annuity)',
};

export const AssumptionPanel: React.FC<Props> = ({ assumptions, onChange, currency }) => {
  const handleChange = (key: keyof Assumptions, value: any) => {
    const newAssumptions = { ...assumptions, [key]: value };
    
    // Auto-calculate capacity based on construction specs
    if (['landArea', 'far', 'floorEfficiency', 'avgRoomSize'].includes(key)) {
      const gfa = newAssumptions.landArea * newAssumptions.far;
      const netArea = gfa * newAssumptions.floorEfficiency;
      
      if (['hotel_mall_office', 'condotel_mall'].includes(newAssumptions.projectType)) {
        newAssumptions.hotelRooms = Math.floor(netArea / newAssumptions.avgRoomSize);
      }
      
      if (['apartment_mall', 'condotel_mall', 'luxury_villa', 'urban_area'].includes(newAssumptions.projectType)) {
        newAssumptions.saleableArea = netArea;
      }
    }

    if (key === 'salesDuration') {
      const duration = value as number;
      const currentProgress = [...newAssumptions.salesProgress];
      if (duration > currentProgress.length) {
        // Extend with 0s
        for (let i = currentProgress.length; i < duration; i++) {
          currentProgress.push(0);
        }
      } else if (duration < currentProgress.length) {
        // Truncate
        currentProgress.splice(duration);
      }
      newAssumptions.salesProgress = currentProgress;
    }
    
    onChange(newAssumptions);
  };

  const formatCurrency = (val: number) => {
    const converted = currency === 'VND' ? val * USD_VND_EXCHANGE_RATE : val;
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(converted);
  };

  const SelectField = ({ label, value, options, onChange }: any) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <Info size={12} className="text-slate-400 cursor-help" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm"
      >
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label as string}
          </option>
        ))}
      </select>
    </div>
  );

  const InputField = ({ label, value, onChange, unit = '%', step = 0.01, description, readOnly = false }: any) => {
    const isCurrency = unit === '$' || unit === 'VND';
    const displayUnit = isCurrency ? currency : unit;
    
    let displayValue: string;
    if (isCurrency) {
      const converted = currency === 'VND' ? value * USD_VND_EXCHANGE_RATE : value;
      displayValue = converted.toFixed(0);
    } else if (unit === '%') {
      displayValue = (value * 100).toFixed(1);
    } else if (unit === 'm2' || unit === 'Phòng' || unit === 'Năm' || unit === 'Hệ số' || unit === 'Tầng') {
      displayValue = value.toString();
    } else {
      displayValue = value.toString();
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
          <div className="group relative">
            <Info size={12} className="text-slate-400 cursor-help" />
            {description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                {description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <input
            type="number"
            step={step}
            value={displayValue}
            readOnly={readOnly}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (isCurrency) {
                const backToUsd = currency === 'VND' ? val / USD_VND_EXCHANGE_RATE : val;
                onChange(backToUsd);
              } else if (unit === '%') {
                onChange(val / 100);
              } else {
                onChange(val);
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-mono text-sm ${
              readOnly ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
            {displayUnit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3 mb-6">Loại hình Dự án</h3>
        <SelectField 
          label="Hình thức đầu tư" 
          value={assumptions.projectType} 
          options={PROJECT_TYPE_LABELS} 
          onChange={(v: ProjectType) => handleChange('projectType', v)} 
        />
      </div>

      {/* Construction Specs Section */}
      {['hotel_mall_office', 'apartment_mall', 'condotel_mall'].includes(assumptions.projectType) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Chỉ tiêu xây dựng</h3>
            <InputField 
              label="Diện tích đất" 
              value={assumptions.landArea} 
              onChange={(v: number) => handleChange('landArea', v)} 
              unit="m2"
              step={100}
              description="Tổng diện tích khu đất thực hiện dự án."
            />
            <InputField 
              label="Hệ số sử dụng đất (FAR)" 
              value={assumptions.far} 
              onChange={(v: number) => handleChange('far', v)} 
              unit="Hệ số"
              step={0.1}
              description="Tỷ lệ giữa tổng diện tích sàn xây dựng trên diện tích khu đất."
            />
            <InputField 
              label="Mật độ xây dựng" 
              value={assumptions.constructionDensity} 
              onChange={(v: number) => handleChange('constructionDensity', v)} 
              description="Tỷ lệ diện tích chiếm đất của các công trình kiến trúc trên tổng diện tích khu đất."
            />
          </div>
          <div className="space-y-6 pt-11">
            <InputField 
              label="Tầng cao tối đa" 
              value={assumptions.maxFloors} 
              onChange={(v: number) => handleChange('maxFloors', v)} 
              unit="Tầng"
              step={1}
              description="Số tầng cao tối đa được phép xây dựng."
            />
            <InputField 
              label="Hiệu suất sử dụng sàn" 
              value={assumptions.floorEfficiency} 
              onChange={(v: number) => handleChange('floorEfficiency', v)} 
              description="Tỷ lệ diện tích thương phẩm (Net Area) trên tổng diện tích sàn (GFA)."
            />
            <InputField 
              label="Diện tích phòng trung bình" 
              value={assumptions.avgRoomSize} 
              onChange={(v: number) => handleChange('avgRoomSize', v)} 
              unit="m2"
              step={1}
              description="Diện tích trung bình của một phòng khách sạn hoặc căn hộ."
            />
          </div>
          <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Kết quả tính toán quy mô</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Tổng diện tích sàn (GFA)</p>
                <p className="text-xl font-bold text-slate-900">{(assumptions.landArea * assumptions.far).toLocaleString()} m2</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Diện tích thương phẩm (Net)</p>
                <p className="text-xl font-bold text-emerald-600">{(assumptions.landArea * assumptions.far * assumptions.floorEfficiency).toLocaleString()} m2</p>
              </div>
              {['hotel_mall_office', 'condotel_mall'].includes(assumptions.projectType) && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Số phòng dự kiến</p>
                  <p className="text-xl font-bold text-indigo-600">{Math.floor((assumptions.landArea * assumptions.far * assumptions.floorEfficiency) / assumptions.avgRoomSize)} Phòng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Investment Cost Section (826/QĐ-BXD 2024) */}
      {['hotel_mall_office', 'apartment_mall', 'condotel_mall'].includes(assumptions.projectType) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Tổng mức đầu tư (826/QĐ-BXD 2024)</h3>
            <InputField 
              label="Suất vốn đầu tư xây dựng" 
              value={assumptions.unitConstructionCost} 
              onChange={(v: number) => handleChange('unitConstructionCost', v)} 
              unit="$"
              step={10}
              description="Suất vốn đầu tư xây dựng cho 1m2 sàn (GFA) theo QĐ 826/QĐ-BXD 2024."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="text-[10px] text-slate-400 w-full mb-1">Tham chiếu 826/QĐ-BXD 2024:</p>
              <button 
                onClick={() => handleChange('unitConstructionCost', 650)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-600 transition-colors"
              >
                Chung cư (~16M)
              </button>
              <button 
                onClick={() => handleChange('unitConstructionCost', 1300)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-600 transition-colors"
              >
                Khách sạn 5* (~32M)
              </button>
              <button 
                onClick={() => handleChange('unitConstructionCost', 800)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-600 transition-colors"
              >
                Văn phòng (~20M)
              </button>
            </div>
            <InputField 
              label="Đơn giá tiền sử dụng đất" 
              value={assumptions.landCostPerSqm} 
              onChange={(v: number) => handleChange('landCostPerSqm', v)} 
              unit="$"
              step={100}
              description="Chi phí tiền sử dụng đất hoặc thuê đất tính trên 1m2 đất."
            />
          </div>
          <div className="space-y-6 pt-11">
            <InputField 
              label="Tỷ lệ chi phí khác" 
              value={assumptions.otherCostRatio} 
              onChange={(v: number) => handleChange('otherCostRatio', v)} 
              description="Chi phí quản lý dự án, tư vấn, và các chi phí khác (% của chi phí xây dựng)."
            />
            <InputField 
              label="Tỷ lệ dự phòng phí" 
              value={assumptions.contingencyRatio} 
              onChange={(v: number) => handleChange('contingencyRatio', v)} 
              description="Dự phòng cho các yếu tố phát sinh và trượt giá (% của tổng mức đầu tư)."
            />
          </div>
          <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dự toán Tổng mức đầu tư</p>
            <div className="space-y-4">
              {(() => {
                const gfa = assumptions.landArea * assumptions.far;
                const constructionCost = gfa * assumptions.unitConstructionCost;
                const landCost = assumptions.landArea * assumptions.landCostPerSqm;
                const otherCost = constructionCost * assumptions.otherCostRatio;
                const totalBeforeContingency = constructionCost + landCost + otherCost;
                const totalInvestment = totalBeforeContingency / (1 - assumptions.contingencyRatio);
                
                return (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Chi phí xây dựng & thiết bị</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(constructionCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Chi phí tiền sử dụng đất</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(landCost)}</p>
                    </div>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tổng mức đầu tư dự kiến</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalInvestment)}</p>
                    </div>
                    <button 
                      onClick={() => handleChange('purchasePrice', totalInvestment)}
                      className="w-full mt-4 py-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Áp dụng vào Giá mua dự án
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Timing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Tiến độ dự án</h3>
          <InputField 
            label="Thời gian xây dựng" 
            value={assumptions.constructionYears} 
            onChange={(v: number) => handleChange('constructionYears', v)} 
            unit="Năm"
            step={1}
            description="Số năm cần thiết để hoàn thành xây dựng. Doanh thu vận hành (Khách sạn, Mall, Office) chỉ bắt đầu sau thời gian này."
          />
        </div>
        <div className="space-y-6 pt-11">
          {['apartment_mall', 'condotel_mall', 'luxury_villa', 'urban_area'].includes(assumptions.projectType) && (
            <InputField 
              label="Thời điểm mở bán" 
              value={assumptions.salesLaunchYear} 
              onChange={(v: number) => handleChange('salesLaunchYear', v)} 
              unit="Năm"
              step={1}
              description="Năm bắt đầu phát sinh doanh thu bán hàng (Chung cư, Condotel, Biệt thự). Năm 0 là năm hiện tại."
            />
          )}
        </div>
        <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tóm tắt tiến độ</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-600">Xây dựng: Năm 0 - Năm {assumptions.constructionYears - 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-600">Vận hành: Từ Năm {assumptions.constructionYears}</span>
            </div>
            {['apartment_mall', 'condotel_mall', 'luxury_villa', 'urban_area'].includes(assumptions.projectType) && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-600">Mở bán: Từ Năm {assumptions.salesLaunchYear}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Specific Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        {/* Hotel Section */}
        {['hotel_mall_office', 'condotel_mall'].includes(assumptions.projectType) && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Thông số Khách sạn/Condotel</h3>
            <InputField 
              label="Số phòng" 
              value={assumptions.hotelRooms} 
              onChange={(v: number) => handleChange('hotelRooms', v)} 
              unit="Phòng"
              step={10}
              description="Tổng số phòng kinh doanh của khách sạn hoặc condotel."
            />
            <InputField 
              label="Giá phòng trung bình (ADR)" 
              value={assumptions.hotelAdr} 
              onChange={(v: number) => handleChange('hotelAdr', v)} 
              unit="$"
              step={10}
              description="Giá thuê phòng trung bình mỗi đêm."
            />
            <InputField 
              label="Công suất lấp đầy" 
              value={assumptions.hotelOccupancy} 
              onChange={(v: number) => handleChange('hotelOccupancy', v)} 
              description="Tỷ lệ phòng có khách thuê trung bình năm."
            />
          </div>
        )}

        {/* Mall Section */}
        {['hotel_mall_office', 'apartment_mall', 'condotel_mall'].includes(assumptions.projectType) && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Thông số TTTM</h3>
            <InputField 
              label="Diện tích sàn cho thuê" 
              value={assumptions.mallArea} 
              onChange={(v: number) => handleChange('mallArea', v)} 
              unit="m2"
              step={100}
              description="Tổng diện tích sàn thương mại có thể cho thuê."
            />
            <InputField 
              label="Giá thuê trung bình" 
              value={assumptions.mallRentPerSqm} 
              onChange={(v: number) => handleChange('mallRentPerSqm', v)} 
              unit="$"
              step={5}
              description="Giá thuê trung bình mỗi m2 sàn thương mại mỗi tháng."
            />
            <InputField 
              label="Công suất lấp đầy" 
              value={assumptions.mallOccupancy} 
              onChange={(v: number) => handleChange('mallOccupancy', v)} 
              description="Tỷ lệ diện tích sàn có khách thuê trung bình."
            />
          </div>
        )}

        {/* Office Section */}
        {assumptions.projectType === 'hotel_mall_office' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Thông số Văn phòng</h3>
            <InputField 
              label="Diện tích sàn văn phòng" 
              value={assumptions.officeArea} 
              onChange={(v: number) => handleChange('officeArea', v)} 
              unit="m2"
              step={100}
              description="Tổng diện tích sàn văn phòng cho thuê."
            />
            <InputField 
              label="Giá thuê văn phòng" 
              value={assumptions.officeRentPerSqm} 
              onChange={(v: number) => handleChange('officeRentPerSqm', v)} 
              unit="$"
              step={5}
              description="Giá thuê trung bình mỗi m2 sàn văn phòng mỗi tháng."
            />
            <InputField 
              label="Công suất lấp đầy" 
              value={assumptions.officeOccupancy} 
              onChange={(v: number) => handleChange('officeOccupancy', v)} 
              description="Tỷ lệ diện tích sàn văn phòng có khách thuê trung bình."
            />
          </div>
        )}

        {/* Sales Section */}
        {['apartment_mall', 'condotel_mall', 'luxury_villa', 'urban_area'].includes(assumptions.projectType) && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Thông số Bán hàng</h3>
            <InputField 
              label="Diện tích thương phẩm" 
              value={assumptions.saleableArea} 
              onChange={(v: number) => handleChange('saleableArea', v)} 
              unit="m2"
              step={500}
              description="Tổng diện tích căn hộ, condotel hoặc biệt thự để bán."
            />
            <InputField 
              label="Giá bán trung bình" 
              value={assumptions.salePricePerSqm} 
              onChange={(v: number) => handleChange('salePricePerSqm', v)} 
              unit="$"
              step={100}
              description="Giá bán trung bình mỗi m2 diện tích thương phẩm."
            />
            <InputField 
              label="Thời gian bán hàng" 
              value={assumptions.salesDuration} 
              onChange={(v: number) => handleChange('salesDuration', v)} 
              unit="Năm"
              step={1}
              description="Tổng số năm thực hiện việc bán hàng."
            />
            
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tiến độ bán hàng hàng năm</p>
              <div className="grid grid-cols-2 gap-3">
                {assumptions.salesProgress.map((progress, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-slate-500">Năm {idx + 1}</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={(progress * 100).toFixed(0)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) / 100;
                          const newProgress = [...assumptions.salesProgress];
                          newProgress[idx] = val;
                          handleChange('salesProgress', newProgress);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tổng cộng:</span>
                <span className={`text-xs font-bold ${Math.abs(assumptions.salesProgress.reduce((a, b) => a + b, 0) - 1) < 0.001 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {(assumptions.salesProgress.reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Tăng trưởng & Biên lợi nhuận</h3>
          <InputField 
            label="Tăng trưởng Doanh thu" 
            value={assumptions.revenueGrowth} 
            onChange={(v: number) => handleChange('revenueGrowth', v)} 
            description="Tốc độ tăng trưởng doanh thu dự kiến hàng năm trong giai đoạn dự báo."
          />
          <InputField 
            label="Biên lợi nhuận gộp" 
            value={assumptions.grossMargin} 
            onChange={(v: number) => handleChange('grossMargin', v)} 
            description="Tỷ lệ lợi nhuận còn lại sau khi trừ giá vốn hàng bán (COGS)."
          />
          <InputField 
            label="Tỷ lệ Chi phí vận hành" 
            value={assumptions.opexRatio} 
            onChange={(v: number) => handleChange('opexRatio', v)} 
            description="Tỷ lệ chi phí bán hàng và quản lý doanh nghiệp trên tổng doanh thu."
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Cấu trúc vốn</h3>
          <InputField 
            label="WACC" 
            value={assumptions.wacc} 
            onChange={(v: number) => handleChange('wacc', v)} 
            description="Chi phí sử dụng vốn bình quân gia quyền, dùng làm tỷ lệ chiết khấu dòng tiền."
          />
          <InputField 
            label="Tỷ lệ vay" 
            value={assumptions.debtRatio} 
            onChange={(v: number) => handleChange('debtRatio', v)} 
            description="Tỷ lệ nợ vay trên tổng giá trị đầu tư ban đầu."
          />
          <InputField 
            label="Lãi suất vay" 
            value={assumptions.interestRate} 
            onChange={(v: number) => handleChange('interestRate', v)} 
            description="Lãi suất vay ngân hàng hàng năm cho khoản nợ của dự án."
          />
          <InputField 
            label="Thời hạn vay" 
            value={assumptions.loanTerm} 
            onChange={(v: number) => handleChange('loanTerm', v)} 
            unit="Năm"
            step={1}
            description="Tổng thời gian thực hiện trả nợ vay."
          />
          <SelectField 
            label="Hình thức trả nợ" 
            value={assumptions.repaymentMethod} 
            options={REPAYMENT_METHOD_LABELS} 
            onChange={(v: string) => handleChange('repaymentMethod', v)} 
          />
          <InputField 
            label="Thời gian ân hạn" 
            value={assumptions.gracePeriod} 
            onChange={(v: number) => handleChange('gracePeriod', v)} 
            unit="Năm"
            step={1}
            description="Thời gian chỉ trả lãi, chưa phải trả gốc (thường áp dụng trong giai đoạn xây dựng)."
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">Thông số M&A</h3>
          <InputField 
            label="Giá mua" 
            value={assumptions.purchasePrice} 
            onChange={(v: number) => handleChange('purchasePrice', v)} 
            unit="$" 
            step={100000} 
            description="Tổng chi phí đầu tư hoặc giá mua lại dự án ban đầu."
          />
          <InputField 
            label="Giá trị cộng hưởng" 
            value={assumptions.synergies} 
            onChange={(v: number) => handleChange('synergies', v)} 
            unit="$" 
            step={10000} 
            description="Giá trị tăng thêm dự kiến từ việc tối ưu hóa vận hành hoặc kết hợp hệ sinh thái."
          />
          <InputField 
            label="Tăng trưởng vĩnh viễn" 
            value={assumptions.terminalGrowth} 
            onChange={(v: number) => handleChange('terminalGrowth', v)} 
            description="Tỷ lệ tăng trưởng dòng tiền ổn định mãi mãi sau giai đoạn dự báo (thường từ 2-3%)."
          />
        </div>
      </div>
    </div>
  );
};
