import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Estado global para el canal de venta: 'AZUR', 'LOCAL', 'WEB'
    const [canalSeleccionado, setCanalSeleccionado] = useState('AZUR');

    const value = {
        canalSeleccionado,
        setCanalSeleccionado,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe ser usado dentro de un AppProvider');
    }
    return context;
}
