import React from 'react';
import { Database } from 'lucide-react';

const Solutions = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <Database className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-600">Soluções</h3>
            <p>Gerenciamento de catálogo de serviços em desenvolvimento.</p>
        </div>
    );
};

export default Solutions;
