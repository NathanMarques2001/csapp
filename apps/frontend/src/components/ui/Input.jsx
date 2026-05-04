const Input = ({ label, error, className = '', ...props }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <input
            className={`flex h-10 w-full rounded-md border ${error ? 'border-rose-500' : 'border-slate-300'} bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 transition-all`}
            {...props}
        />
        {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
);
export default Input;
