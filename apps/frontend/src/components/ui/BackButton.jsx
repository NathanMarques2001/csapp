import { ArrowLeft } from 'lucide-react';
import { useGoBack } from '../../context/NavigationContext';
import Button from './Button';

const BackButton = ({
    fallback = '/dashboard',
    variant = 'ghost',
    className = 'p-2',
    iconClassName = 'w-5 h-5',
    label,
    onClick,
    ...props
}) => {
    const goBack = useGoBack(fallback);
    const handleClick = onClick || (() => goBack());

    if (label) {
        return (
            <Button variant={variant} onClick={handleClick} className={className} icon={ArrowLeft} {...props}>
                {label}
            </Button>
        );
    }

    return (
        <Button variant={variant} onClick={handleClick} className={className} {...props}>
            <ArrowLeft className={iconClassName} />
        </Button>
    );
};

export default BackButton;
