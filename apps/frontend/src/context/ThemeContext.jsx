import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

const CHAVE_STORAGE = 'csapp-theme';

export const ThemeProvider = ({ children }) => {
    const [tema, setTema] = useState(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        return salvo === 'dark' ? 'dark' : 'light';
    });

    const isDark = tema === 'dark';

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(CHAVE_STORAGE, tema);
    }, [tema, isDark]);

    const alternarTema = useCallback(() => {
        setTema(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ tema, isDark, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};

export default ThemeContext;
