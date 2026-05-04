import { Loader2 } from 'lucide-react';
import { THEME } from '../../utils/constants';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, isLoading, ...props }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-10";
    const variants = {
        primary: `${THEME.colors.primary} focus:ring-teal-500`,
        secondary: `${THEME.colors.secondary} focus:ring-indigo-500`,
        outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};
export default Button;
