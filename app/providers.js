'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';

const RoleContext = createContext(null);
const availableRoles = ['Admin', 'Bank Staff', 'Customer'];

export function useRole() {
    const roleState = useContext(RoleContext);

    if (!roleState) {
        throw new Error('useRole must be used within AppProviders');
    }

    return roleState;
}

export default function AppProviders({ children }) {
    const [role, setRoleState] = useState('Admin');

    useEffect(() => {
        const savedRole = window.localStorage.getItem('nestbank-role');

        if (availableRoles.includes(savedRole) && savedRole !== role) {
            const timeoutId = window.setTimeout(() => setRoleState(savedRole), 0);
            return () => window.clearTimeout(timeoutId);
        }
    }, [role]);

    function setRole(nextRole) {
        if (!availableRoles.includes(nextRole)) return;

        window.localStorage.setItem('nestbank-role', nextRole);
        setRoleState(nextRole);
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <RoleContext.Provider value={{ role, setRole }}>
                {children}
            </RoleContext.Provider>
        </ThemeProvider>
    );
}
