import React, { useState, useEffect } from 'react';
import { calculateIntegrationQuote } from '../services/integrationService';
import { LayoutContainer } from '../components/layout/LayoutContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { CheckCircle2, AlertCircle, Copy } from 'lucide-react';

export default function IntegrationsCalculator() {
    const [type, setType] = useState('API');
    const [quantity, setQuantity] = useState(5000);
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Opciones hardcoded (v2.0 MVP)
    const optionsAPI = [
        { value: 5000, label: '5,000 Comprobantes Adicionales' },
        { value: 10000, label: '10,000 Comprobantes Adicionales' },
        { value: 20000, label: '20,000 Comprobantes Adicionales' },
        { value: 30000, label: '30,000 Comprobantes Adicionales' },
        { value: 40000, label: '40,000 Comprobantes Adicionales' },
        { value: 50000, label: '50,000 Comprobantes Adicionales' },
        { value: 100000, label: '100,000 Comprobantes Adicionales' },
        { value: 150000, label: '150,000 Comprobantes Adicionales' }
    ];

    const optionsWEB = [
        { value: 500, label: '500 Comprobantes Adicionales' },
        { value: 1000, label: '1,000 Comprobantes Adicionales' },
        { value: 2000, label: '2,000 Comprobantes Adicionales' },
        { value: 5000, label: '5,000 Comprobantes Adicionales' },
        { value: 10000, label: '10,000 Comprobantes Adicionales' },
        { value: 50000, label: '50,000 Comprobantes Adicionales' },
        { value: 100000, label: '100,000 Comprobantes Adicionales' },
        { value: 200000, label: '200,000 Comprobantes Adicionales' }
    ];

    useEffect(() => {
        async function runCalc() {
            setLoading(true);
            setError(null);
            try {
                const result = await calculateIntegrationQuote(type, quantity);
                if (!result) throw new Error("No se pudo calcular la cotización");
                setQuote(result);
            } catch (err) {
                console.error(err);
                setError("Error al conectar con el servidor de precios.");
                setQuote(null);
            } finally {
                setLoading(false);
            }
        }
        runCalc();
    }, [type, quantity]);

    const copyToClipboard = () => {
        if (!quote) return;
        const text = `
Cotización Integración ${type}:
-----------------------------
Plan Base: $100.00
${quote.breakdown[1].item}: $${quote.breakdown[1].price}
-----------------------------
Subtotal: $${quote.summary.subtotal}
IVA (15%): $${quote.summary.iva}
TOTAL ANUAL: $${quote.summary.total}
    `.trim();
        navigator.clipboard.writeText(text);
        alert("Resumen copiado al portapapeles");
    };

    return (
        <LayoutContainer>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Calculadora de Integraciones</h1>
                <p className="text-slate-500 mt-2">Cotiza paquetes de comprobantes para API REST o Uso Web.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">

                {/* 1. Panel de Configuración */}
                <Card className="h-fit">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Configuración</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-500 mb-3">Tipo de Servicio</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                            <button
                                onClick={() => { setType('API'); setQuantity(5000); }}
                                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${type === 'API' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                API REST
                            </button>
                            <button
                                onClick={() => { setType('WEB'); setQuantity(500); }}
                                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${type === 'WEB' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                USO WEB
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 ml-1">
                            {type === 'API' ? 'Para sistemas externos consumiendo la API de Azur.' : 'Para uso directo en la plataforma web de Azur.'}
                        </p>
                    </div>

                    <div className="mb-8">
                        <Select
                            label="Cantidad Adicional Requerida"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            options={type === 'API' ? optionsAPI : optionsWEB}
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                        <p className="text-sm text-blue-800 leading-relaxed">
                            El <strong>Plan Base de Integración ($100)</strong> es obligatorio para habilitar el servicio y ya incluye <strong>2,000 comprobantes</strong> anuales.
                        </p>
                    </div>
                </Card>

                {/* 2. Panel de Resultados */}
                <Card className="flex flex-col justify-between h-full relative overflow-hidden">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FileText size={24} className="text-blue-500" />
                            Resumen de Cotización
                        </h2>

                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-400 text-sm">Calculando precios...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        ) : quote ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {quote.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start py-4 border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors px-2 rounded-lg -mx-2">
                                        <div>
                                            <p className="font-semibold text-slate-700">{item.item}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                        <span className="font-medium text-slate-800 font-mono">${item.price}</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {quote && (
                        <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-100 relative">
                            {/* Decorators */}
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${quote.summary.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>IVA (15%)</span>
                                    <span>${quote.summary.iva}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Anual</span>
                                    <span className="text-4xl font-bold text-slate-800 tracking-tight">${quote.summary.total}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Capacidad Total</span>
                                    <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-sm">
                                        <CheckCircle2 size={14} />
                                        {quote.summary.total_docs.toLocaleString()} Docs
                                    </div>
                                </div>
                            </div>

                            <Button onClick={copyToClipboard} className="w-full mt-6 flex items-center justify-center gap-2">
                                <Copy size={18} />
                                Copiar al Portapapeles
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </LayoutContainer>
    );
}
