import { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';

const NavigationContext = createContext(null);

const MAX_STACK = 50;

const buildPath = (location) =>
    `${location.pathname}${location.search}${location.hash}`;

export function NavigationProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationType = useNavigationType();
    const stackRef = useRef([]);
    const initializedRef = useRef(false);

    useEffect(() => {
        const current = buildPath(location);

        if (!initializedRef.current) {
            initializedRef.current = true;
            stackRef.current = [current];
            return;
        }

        if (navigationType === 'POP') {
            const stack = stackRef.current;
            const idx = stack.lastIndexOf(current);
            if (idx >= 0) {
                stackRef.current = stack.slice(0, idx + 1);
            } else {
                stackRef.current = [...stack, current].slice(-MAX_STACK);
            }
            return;
        }

        if (navigationType === 'REPLACE') {
            const stack = stackRef.current;
            if (stack.length === 0) {
                stackRef.current = [current];
            } else if (stack[stack.length - 1] !== current) {
                stack[stack.length - 1] = current;
            }
            return;
        }

        const stack = stackRef.current;
        if (stack[stack.length - 1] !== current) {
            stack.push(current);
            if (stack.length > MAX_STACK) {
                stackRef.current = stack.slice(-MAX_STACK);
            }
        }
    }, [location.pathname, location.search, location.hash, navigationType]);

    const canGoBack = useCallback(() => stackRef.current.length > 1, []);

    const goBack = useCallback((fallback) => {
        if (stackRef.current.length > 1) {
            navigate(-1);
            return;
        }
        if (fallback) {
            navigate(fallback);
        }
    }, [navigate]);

    const getPreviousPath = useCallback(() => {
        const stack = stackRef.current;
        return stack.length > 1 ? stack[stack.length - 2] : null;
    }, []);

    return (
        <NavigationContext.Provider value={{ goBack, canGoBack, getPreviousPath }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigationStack() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationStack deve ser usado dentro de NavigationProvider');
    }
    return context;
}

export function useGoBack(fallback = '/dashboard') {
    const { goBack } = useNavigationStack();
    return useCallback(() => goBack(fallback), [goBack, fallback]);
}
