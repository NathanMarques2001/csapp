import { ChevronDown } from 'lucide-react';

const Select = ({ label, error, options = [], className = '', ...props }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <div className="relative">
            <select
                className={`flex h-10 w-full appearance-none rounded-md border ${error ? 'border-rose-500' : 'border-slate-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 transition-all`}
                {...props}
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
);
export default Select;
