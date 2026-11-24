'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export default function StoreProvider({ children }) {
    const [store, setStore] = useState(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setStore(makeStore());
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    if (!store) {
        return children;
    }

    return <Provider store={store}>{children}</Provider>;
}
