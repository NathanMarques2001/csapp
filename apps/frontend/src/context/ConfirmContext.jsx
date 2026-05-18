import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const resolverRef = useRef(null);

    const close = useCallback((result) => {
        setDialog(null);
        const resolve = resolverRef.current;
        resolverRef.current = null;
        resolve?.(result);
    }, []);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setDialog({
                title: options.title || 'Confirmar',
                message: options.message || 'Deseja continuar?',
                confirmLabel: options.confirmLabel || 'Confirmar',
                cancelLabel: options.cancelLabel || 'Cancelar',
                variant: options.variant || 'primary',
            });
        });
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                open={!!dialog}
                title={dialog?.title}
                message={dialog?.message}
                confirmLabel={dialog?.confirmLabel}
                cancelLabel={dialog?.cancelLabel}
                variant={dialog?.variant}
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
    }
    return context;
}
