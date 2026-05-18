import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import Button from './Button';

const VARIANTS = {
    primary: {
        icon: Info,
        iconClass: 'bg-teal-50 text-teal-600',
        confirmClass: 'bg-teal-600 hover:bg-teal-700 text-white border-transparent',
    },
    warning: {
        icon: AlertTriangle,
        iconClass: 'bg-amber-50 text-amber-600',
        confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white border-transparent',
    },
    danger: {
        icon: Trash2,
        iconClass: 'bg-rose-50 text-rose-600',
        confirmClass: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent',
    },
};

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'primary',
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const config = VARIANTS[variant] || VARIANTS.primary;
    const Icon = config.icon;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${config.iconClass}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 id="confirm-dialog-title" className="text-lg font-bold text-slate-900">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors h-10 ${config.confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
