'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);
const ThemeContext = createContext({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: () => {},
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AppProviders');
    }
    return context;
}

export function useTheme() {
    return useContext(ThemeContext);
}

// Backwards compatibility for existing useRole() callers
export function useRole() {
    const { user, setUser } = useAuth();
    return {
        role: user?.role || 'Customer',
        setRole: (newRole) => {
            if (user) setUser({ ...user, role: newRole });
        },
    };
}

export default function AppProviders({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setThemeState] = useState('light');
    const router = useRouter();

    // Theme initialization and synchronization
    useEffect(() => {
        const savedTheme = window.localStorage.getItem('nestbank-theme') || 'light';
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        window.localStorage.setItem('nestbank-theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    setUser(data.user);
                    return data.user;
                }
            }
            setUser(null);
            return null;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error(err);
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme }}>
            <AuthContext.Provider value={{ user, setUser, loading, logout, refreshSession: fetchSession }}>
                {children}
            </AuthContext.Provider>
        </ThemeContext.Provider>
    );
}
