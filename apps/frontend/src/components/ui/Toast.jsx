import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border animate-in slide-in-from-right duration-300 ${type === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 mr-3 text-rose-500" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 hover:opacity-75"><X className="w-4 h-4" /></button>
    </div>
);
export default Toast;
