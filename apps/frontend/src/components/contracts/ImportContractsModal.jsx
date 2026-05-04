import { useState } from 'react';
import { createPortal } from 'react-dom'; // <--- 1. Importação necessária
import { Upload, X, FileSpreadsheet, Download } from 'lucide-react';
import Button from '../ui/Button';

const ImportContractsModal = ({ isOpen, onClose, onImport, onDownloadTemplate }) => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
        } else {
            alert('Por favor, envie um arquivo Excel (.xlsx, .xls) ou CSV.');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = () => {
        if (file) {
            onImport(file);
        }
    };

    // 2. Definimos o conteúdo do modal em uma variável
    const modalContent = (
        // Aumentei o z-index para 9999 para garantir prioridade máxima
        <div className="fixed inset-0 top-0 left-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-teal-600" />
                        Importar Contratos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Carregue uma planilha para adicionar contratos em lote.</p>
                </div>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${dragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <div className="text-center">
                            <FileSpreadsheet className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                            <Button variant="ghost" size="sm" className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                Remover arquivo
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center pointer-events-none">
                            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-600">Arraste seu arquivo aqui</p>
                            <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
                            <p className="text-xs text-slate-400 mt-4">Aceita .xlsx, .xls, .csv</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                    <button onClick={onDownloadTemplate} className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium">
                        <Download className="w-4 h-4" />
                        Baixar modelo
                    </button>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!file} icon={Upload}>Importar</Button>
                </div>
            </div>
        </div>
    );

    // 3. Retornamos o createPortal renderizando no body
    return createPortal(modalContent, document.body);
};

export default ImportContractsModal;