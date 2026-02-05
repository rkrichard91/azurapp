import React from 'react';
import { Navbar } from './Navbar';

export function LayoutContainer({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 pb-20">
                {children}
            </main>
        </div>
    );
}
