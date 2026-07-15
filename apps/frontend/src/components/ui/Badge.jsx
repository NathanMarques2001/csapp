const Badge = ({ status, variant, children }) => {
    const styles = {
        'Ativo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Inativo': 'bg-rose-100 text-rose-700 border-rose-200',
        'ativo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'inativo': 'bg-rose-100 text-rose-700 border-rose-200',
        'Pendente': 'bg-amber-100 text-amber-700 border-amber-200',
        'A': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'B': 'bg-blue-100 text-blue-700 border-blue-200',
        'C': 'bg-slate-100 text-slate-700 border-slate-200',
        'TOP 30': 'bg-purple-100 text-purple-700 border-purple-200 font-bold',
        'Administrador': 'bg-purple-100 text-purple-700 border-purple-200',
        'Usuário': 'bg-gray-100 text-gray-700 border-gray-200',
        'Desenvolvedor': 'bg-green-100 text-green-700 border-green-200',
    };

    const variantStyles = {
        'success': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'danger': 'bg-rose-100 text-rose-700 border-rose-200',
        'warning': 'bg-amber-100 text-amber-700 border-amber-200',
        'primary': 'bg-blue-100 text-blue-700 border-blue-200',
        'secondary': 'bg-slate-100 text-slate-700 border-slate-200',
    };

    const defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200';

    const appliedStyle = variant ? (variantStyles[variant] || defaultStyle) : (styles[status] || defaultStyle);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${appliedStyle}`}>
            {children || status}
        </span>
    );
};
export default Badge;
