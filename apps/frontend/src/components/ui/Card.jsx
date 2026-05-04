import { THEME } from '../../utils/constants';

const Card = ({ children, className = '', title, action }) => (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
        {(title || action) && (
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                {title && <h3 className={`text-base font-semibold ${THEME.fonts.heading} text-slate-800`}>{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
);
export default Card;
