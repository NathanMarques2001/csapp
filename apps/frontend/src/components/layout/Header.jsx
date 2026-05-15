import { Menu, ChevronRight, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Header = ({ sidebarOpen, setSidebarOpen, selectedItem }) => {
    const location = useLocation();
    const [cookies] = useCookies(['nomeUsuario', 'tipo']);

    const nome = cookies.nomeUsuario || 'Usuário';
    const tipo = cookies.tipo || 'User';

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Map type to friendly label
    const getTipoLabel = (t) => {
        const map = {
            'admin': 'Administrador',
            'user': 'Usuário',
            'dev': 'Desenvolvedor'
        };
        return map[t.toLowerCase()] || t;
    };

    // Derive title from path
    const getPageTitle = (pathname) => {
        if (pathname.includes('/dashboard')) return 'Dashboard';
        if (pathname.includes('/clientes')) return 'Clientes';
        if (pathname.includes('/contratos')) return 'Contratos';
        if (pathname.includes('/solucoes')) return 'Soluções';
        if (pathname.includes('/relatorios')) return 'Relatórios';
        if (pathname.includes('/gestao')) return 'Gestão';
        return 'CSApp';
    };

    const activePage = getPageTitle(location.pathname);

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <Menu className="w-5 h-5" />
                </button>
                {/* Breadcrumbs Mock */}
                <div className="hidden md:flex items-center text-sm text-slate-500">
                    <span className="capitalize">{activePage}</span>
                    {selectedItem && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <span className="text-slate-900 font-medium">Detalhes</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-teal-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {getInitials(nome)}
                    </div>
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-slate-900 leading-none">{nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{getTipoLabel(tipo)}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;
