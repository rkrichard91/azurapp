import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, Box, FileText, ArrowLeft } from 'lucide-react';

export function Navbar() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <nav className="bg-white border-b border-slate-100 py-4 px-6 mb-8">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {!isHome && (
                        <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                    )}
                    <Link to="/" className="flex items-center gap-2">
                        <img src="https://www.azur.com.ec/almacen/logosreseller/logo.svg" alt="Azur" className="h-10" />
                    </Link>
                </div>

                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <Link to="/integrations" className="hover:text-blue-600 transition-colors">Integraciones</Link>
                </div>
            </div>
        </nav>
    );
}
