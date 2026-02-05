import React from 'react';

export function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
    const baseStyles = "py-3 px-6 rounded-lg font-semibold transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-300",
        outline: "bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 focus:ring-slate-300",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
