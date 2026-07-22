import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useModalGuard } from '../../hooks/useFormGuard';

export const HistoryModalComponent = ({ modalType, modalItemId, initialContent, onClose, onSave, savingModal }) => {
    const [conteudo, setConteudo] = useState(initialContent || '');
    
    const { handleClose, confirmSave } = useModalGuard({
        formData: conteudo,
        baseline: initialContent || '',
        onClose,
        entityLabel: 'o registro de histórico',
        isCreate: !modalItemId
    });

    const tituloModal = 
        modalType === 'comercial' ? 'Editar Contato Comercial' : 
        modalType === 'tecnico' ? 'Editar Contato Técnico' : 
        'Editar Fato Importante';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {tituloModal}
                    </h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors p-1">
                        <XCircle size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conteúdo do Registro</label>
                        <textarea
                            autoFocus
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                            rows="4"
                            value={conteudo}
                            onChange={(e) => setConteudo(e.target.value)}
                            placeholder="Digite os detalhes..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <Button variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                            onClick={async () => {
                                if (!conteudo.trim()) return;
                                if (!(await confirmSave())) return;
                                onSave(conteudo);
                            }}
                            disabled={savingModal || !conteudo.trim()}
                        >
                            {savingModal ? 'Salvando...' : 'Salvar Registro'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryModalComponent;
