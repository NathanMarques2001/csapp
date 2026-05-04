import { useState } from 'react';
import { Users, Box, Building, Tag, Plus, Briefcase, FileText, Bookmark, List } from 'lucide-react';
import Card from '../components/ui/Card';
import SettingsUsers from '../components/settings/SettingsUsers';
import SettingsProducts from '../components/settings/SettingsProducts';

import SettingsClientClassifications from '../components/settings/SettingsClientClassifications';
import SettingsGeneralList from '../components/settings/SettingsGeneralList';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'products', label: 'Produtos/Serviços', icon: Box },
        { id: 'manufacturers', label: 'Fabricantes', icon: Building },
        { id: 'segments', label: 'Segmentos', icon: Tag },
        { id: 'groups', label: 'Grupos Econômicos', icon: Briefcase },
        { id: 'categories', label: 'Categorias de Produtos', icon: List },
        { id: 'classifications', label: 'Classificações de Clientes', icon: Bookmark },
        { id: 'faturados', label: 'Faturados', icon: FileText },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <SettingsUsers />;
            case 'products':
                return <SettingsProducts />;
            case 'manufacturers':
                return <SettingsGeneralList title="Fabricantes" endpoint="/fabricantes" dataKey="fabricantes" />;
            case 'segments':
                return <SettingsGeneralList title="Segmentos" endpoint="/segmentos" dataKey="segmentos" />;
            case 'groups':
                return <SettingsGeneralList title="Grupos Econômicos" endpoint="/grupos-economicos" dataKey="grupoEconomico" />;
            case 'categories':
                return <SettingsGeneralList title="Categorias de Produtos" endpoint="/categorias-produtos" dataKey="categorias" />;
            case 'classifications':
                return <SettingsClientClassifications />;
            case 'faturados':
                return <SettingsGeneralList title="Empresas de Faturamento" endpoint="/faturados" dataKey="faturados" />;
            default:
                return <div>Selecione uma opção</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configurações e Cadastros</h1>
                <p className="text-slate-500">Gerencie tabelas auxiliares e usuários do sistema.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <Card className="w-full lg:w-80 flex-shrink-0 h-fit p-2">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </Card>

                {/* Content Area */}
                <Card className="flex-1 min-h-[500px] p-6">
                    {renderContent()}
                </Card>
            </div>
        </div>
    );
};

export default Settings;
