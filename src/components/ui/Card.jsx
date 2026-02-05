import React from 'react';

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 p-8 ${className}`}>
            {children}
        </div>
    );
}
