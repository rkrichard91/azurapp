import React from 'react';

export default function SummaryCard({ items = [], onRemove, onCopySummarized, onCopyDetailed, onClear }) {
    if (!items || items.length === 0) return null;

    // Calcular totales
    const totals = items.reduce((acc, item) => {
        const price = parseFloat(item.price) || 0;
        return {
            subtotal: acc.subtotal + price,
            iva: acc.iva + (price * 0.15)
        };
    }, { subtotal: 0, iva: 0 });

    const total = totals.subtotal + totals.iva;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 flex flex-col justify-between h-full">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumen de Cotización</h2>

                <div className="space-y-4 mb-6">
                    {/* Lista de Items en el Carrito */}
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0 group relative">
                            <div className="pr-4">
                                <p className="font-semibold text-slate-700">{item.name}</p>
                                <p className="text-xs text-slate-400">{item.desc} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                            </div>
                            <div className="text-right">
                                <span className="block font-medium text-slate-800">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                <button
                                    onClick={() => onRemove(idx)}
                                    className="text-xs text-red-400 hover:text-red-600 underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totales Finales */}
            <div className="mt-4 bg-slate-50 rounded-xl p-6">
                <div className="flex justify-between mb-2 text-slate-500">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4 text-slate-500">
                    <span>IVA (15%)</span>
                    <span>${totals.iva.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wide">Total</span>
                        <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <button
                        onClick={onCopySummarized}
                        className="w-full bg-slate-800 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        <span>📋</span> Copiar Resumido
                    </button>
                    <button
                        onClick={onCopyDetailed}
                        className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>📑</span> Copiar Detallado
                    </button>
                    {onClear && items.length > 0 && (
                        <button
                            onClick={onClear}
                            className="w-full text-red-500 border border-red-200 font-semibold py-3 rounded-lg hover:bg-red-50 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
                        >
                            <span>🗑️</span> Limpiar Todo
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
}
