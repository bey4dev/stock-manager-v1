import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/solid';

export type DateFilterOption = 'today' | 'yesterday' | 'last7days' | 'last2weeks' | 'last1month' | 'thisyear' | 'all';

interface DateFilterProps {
  value: DateFilterOption;
  onChange: (value: DateFilterOption) => void;
  className?: string;
}

export default function DateFilter({ value, onChange, className = '' }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'all' as DateFilterOption, label: 'Semua Data', icon: '📊' },
    { value: 'today' as DateFilterOption, label: 'Hari Ini', icon: '📅' },
    { value: 'yesterday' as DateFilterOption, label: 'Kemarin', icon: '📆' },
    { value: 'last7days' as DateFilterOption, label: '7 Hari Terakhir', icon: '📈' },
    { value: 'last2weeks' as DateFilterOption, label: '2 Minggu Terakhir', icon: '📋' },
    { value: 'last1month' as DateFilterOption, label: '1 Bulan Terakhir', icon: '📃' },
    { value: 'thisyear' as DateFilterOption, label: 'Tahun Ini', icon: '📄' }
  ];

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: DateFilterOption) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[180px]"
      >
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium font-body text-gray-700 flex-1 text-left dropdown-text">
          {selectedOption?.icon} {selectedOption?.label || 'Pilih Periode'}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden max-h-80 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  value === option.value 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    value === option.value ? 'bg-blue-500' : 'bg-transparent'
                  }`} />
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
