const Input = ({ label, error, className = '', value, ...props }) => {
    const inputProps = { ...props };
    if (value !== undefined) {
        inputProps.value = value === null ? '' : value;
    }
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
            <input
                className={`flex h-10 w-full rounded-md border ${error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800/50 transition-all`}
                {...inputProps}
            />
            {error && <span className="text-xs text-rose-500">{error}</span>}
        </div>
    );
};
export default Input;
