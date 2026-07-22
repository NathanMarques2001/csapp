import { Mail, Phone, User } from 'lucide-react';
import Card from './Card';

const ContactCard = ({ title, name, email, phone }) => {
    if (!name && !email && !phone) return null;

    return (
        <Card className="p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {title || 'Contato'}
            </h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {name && <p className="font-medium text-slate-800 dark:text-slate-200">{name}</p>}
                {email && (
                    <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <a href={`mailto:${email}`} className="hover:text-teal-600 dark:hover:text-teal-400 truncate">{email}</a>
                    </div>
                )}
                {phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{phone}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ContactCard;
