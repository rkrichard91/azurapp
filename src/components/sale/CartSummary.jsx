import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

/**
 * Resumen lateral del carrito: desglose, totales, y botones de acción.
 */
export default function CartSummary({ cartItems, subtotal, iva, total, handleCopy, handleClear }) {
    return (
        <div className="md:col-span-1">
            <div className="sticky top-28 space-y-6">

                {/* Desglose */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Desglose de la Venta</h3>

                    {cartItems.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Seleccione productos para ver el desglose.</p>
                    ) : (
                        <ul className="space-y-3">
                            {cartItems.map((item, i) => (
                                <li key={i} className="text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-700 font-medium">{item.quantity}x {item.name}</span>
                                        <span className="text-slate-900 font-bold">{formatCurrency(item.total)}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">{item.duration} {item.details && `| ${item.details}`}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Totales */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Resumen Final</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-slate-600">
                            <span>Base Imponible:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>(+) IVA (15%):</span>
                            <span>{formatCurrency(iva)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg shadow-md">
                        <span className="font-bold text-lg">TOTAL:</span>
                        <span className="font-bold text-2xl">{formatCurrency(total)}</span>
                    </div>
                </div>

                {/* Botones */}
                <div className="space-y-2">
                    <button onClick={() => handleCopy('RESUMEN')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Copy className="w-4 h-4" /> Copiar Resumen
                    </button>
                    <button onClick={() => handleCopy('DETALLE')} className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Copy className="w-4 h-4" /> Copiar Lista
                    </button>
                    <button onClick={handleClear} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Trash2 className="w-4 h-4" /> Borrar Todo
                    </button>
                </div>

            </div>
        </div>
    );
}
