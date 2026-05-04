import { Mail, Phone, User } from 'lucide-react';
import Card from './Card';

const ContactCard = ({ title, name, email, phone }) => {
    if (!name && !email && !phone) return null;

    return (
        <Card className="p-4 border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                {title || 'Contato'}
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
                {name && <p className="font-medium text-slate-800">{name}</p>}
                {email && (
                    <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <a href={`mailto:${email}`} className="hover:text-teal-600 truncate">{email}</a>
                    </div>
                )}
                {phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{phone}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ContactCard;
