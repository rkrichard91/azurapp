import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Calculator, ShoppingCart, RefreshCw, Box } from 'lucide-react';

export default function Dashboard() {
    const tools = [
        {
            title: "Nueva Venta",
            desc: "Cotizador de Planes y Firmas Electrónicas.",
            icon: ShoppingCart,
            color: "bg-emerald-500",
            link: "/new-sale",
            active: true
        },
        {
            title: "Adicionales",
            desc: "Calculadora de paquetes API, Web y Contable.",
            icon: Box,
            color: "bg-blue-500",
            link: "/integrations",
            active: true
        },
        {
            title: "Cambio de Plan",
            desc: "Cálculo de prorrateo para upgrades.",
            icon: RefreshCw,
            color: "bg-amber-500",
            link: "/plan-change",
            active: true
        }
    ];

    return (
        <>
            <div className="py-12 text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Centro de Cotizaciones <span className="text-blue-600">Azur</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Seleccione una herramienta para comenzar.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tools.map((tool, idx) => (
                    tool.active ? (
                        <Link key={idx} to={tool.link} className="block group">
                            <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden border-slate-200">
                                <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <tool.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {tool.desc}
                                </p>
                            </Card>
                        </Link>
                    ) : (
                        <div key={idx} className="block opacity-60 grayscale cursor-not-allowed relative">
                            <Card className="h-full border-slate-100 bg-slate-50">
                                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded">PRONTO</div>
                                <div className={`w-14 h-14 bg-slate-300 rounded-2xl flex items-center justify-center mb-6`}>
                                    <tool.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400 mb-2">
                                    {tool.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {tool.desc}
                                </p>
                            </Card>
                        </div>
                    )
                ))}
            </div>
        </>
    );
}
