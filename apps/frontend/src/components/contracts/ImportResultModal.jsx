import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Button from '../ui/Button';

const ImportResultModal = ({ isOpen, onClose, result }) => {
    if (!isOpen || !result) return null;

    const summary = result.summary || { sucesso: 0, falhas: 0, avisos: 0 };
    const erros = result.erros || [];
    const avisos = result.avisos || [];

    const isSuccess = erros.length === 0 && summary.falhas === 0;

    const modalContent = (
        <div className="fixed inset-0 top-0 left-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {isSuccess ? (
                            <><CheckCircle className="w-6 h-6 text-green-500" /> Importação Concluída</>
                        ) : (
                            <><AlertTriangle className="w-6 h-6 text-amber-500" /> Resultado da Importação</>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-slate-600 dark:text-slate-300 mb-6">{result.message || (isSuccess ? "Todos os contratos foram processados com sucesso." : "Ocorreram problemas durante o processamento da planilha.")}</p>
                    
                    {/* Summary Cards */}
                    {(summary.sucesso > 0 || summary.falhas > 0 || summary.avisos > 0) && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.sucesso}</div>
                                <div className="text-sm text-green-700 dark:text-green-500">Sucessos</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.falhas}</div>
                                <div className="text-sm text-red-700 dark:text-red-500">Erros</div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.avisos}</div>
                                <div className="text-sm text-amber-700 dark:text-amber-500">Avisos</div>
                            </div>
                        </div>
                    )}

                    {/* Lists */}
                    <div className="space-y-6">
                        {erros.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    Erros Encontrados
                                </h3>
                                <div className="space-y-2">
                                    {erros.map((erro, idx) => (
                                        <div key={idx} className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded p-3 text-sm text-red-800 dark:text-red-300">
                                            <span className="font-bold mr-2">Linha {erro.linha}:</span>
                                            {erro.motivo}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {avisos.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Avisos
                                </h3>
                                <div className="space-y-2">
                                    {avisos.map((aviso, idx) => (
                                        <div key={idx} className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded p-3 text-sm text-amber-800 dark:text-amber-300">
                                            <span className="font-bold mr-2">Linha {aviso.linha}:</span>
                                            {aviso.motivo}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end shrink-0">
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ImportResultModal;
