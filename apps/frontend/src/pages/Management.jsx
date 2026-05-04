import React from 'react';
import { Settings } from 'lucide-react';

const Management = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-600">Gestão</h3>
            <p>Configurações administrativas e usuários.</p>
        </div>
    );
};

export default Management;
