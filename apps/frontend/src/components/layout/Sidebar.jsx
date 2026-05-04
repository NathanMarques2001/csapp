import { Shield, LayoutDashboard, Users, Briefcase, Database, FileText, Settings, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const [, , removeCookie] = useCookies(['jwtToken', 'nomeUsuario', 'id', 'tipo']);

    const handleLogout = () => {
        removeCookie('jwtToken');
        removeCookie('nomeUsuario');
        removeCookie('id');
        removeCookie('tipo');
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes' },
        { id: 'contratos', label: 'Contratos', icon: Briefcase, path: '/contratos' },
        { id: 'relatorios', label: 'Relatórios', icon: FileText, path: '/relatorios' },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes' },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col`}>
            <div className="h-16 flex items-center justify-center border-b border-slate-800">
                <img src="/logo.png" alt="Logo" className="w-1/2" />
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${isActive ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <item.icon className="w-5 h-5 min-w-[20px]" />
                        {isOpen && <span className="font-medium text-sm">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-rose-400 transition-colors`}
                >
                    <LogOut className="w-5 h-5 min-w-[20px]" />
                    {isOpen && <span className="font-medium text-sm">Sair</span>}
                </button>
            </div>
        </aside>
    );
};
export default Sidebar;
