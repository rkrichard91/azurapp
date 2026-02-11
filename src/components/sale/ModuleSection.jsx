import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

/**
 * Sección de Módulos y Puntos de Emisión: lista + modal + input de emisión.
 */
export default function ModuleSection({
    selectedModules,
    setSelectedModules,
    moduleProducts,
    emissionPoints,
    setEmissionPoints,
    emissionPointProduct,
    showModuleModal,
    setShowModuleModal,
}) {
    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <span className="text-xl">🔌</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Módulos y Puntos de Emisión</h2>
                </div>

                {/* Lista de módulos seleccionados */}
                <div className="space-y-3 mb-6">
                    {selectedModules.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-2">No hay módulos adicionales.</p>
                    ) : (
                        selectedModules.map((mod, idx) => {
                            const p = moduleProducts.find(prod => prod.id === mod.productId);
                            const price = p?.prices.find(pr => pr.id === mod.priceId);
                            return (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-semibold text-slate-700">{p?.name}</div>
                                        <div className="text-xs text-slate-500">{price?.duration_label}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-slate-800">{formatCurrency(price?.price || 0)}</div>
                                        <button onClick={() => {
                                            setSelectedModules(prev => prev.filter((_, i) => i !== idx));
                                        }} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <button
                    onClick={() => setShowModuleModal(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm mb-6"
                >
                    Seleccionar Módulos Adicionales
                </button>

                {/* Puntos de Emisión */}
                <div className="pt-6 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Puntos de Emisión Adicionales</label>
                    <input
                        type="number"
                        min="0"
                        value={emissionPoints}
                        onChange={(e) => setEmissionPoints(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                    {emissionPointProduct && (
                        <p className="text-xs text-slate-400 mt-1">Precio escalonado: 1-11: $2.25 | 12-49: $2.00 | 50+: $1.75</p>
                    )}
                </div>
            </div>

            {/* Modal de Módulos */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-6 text-center text-slate-800">Seleccionar Módulos Adicionales</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[60vh] overflow-y-auto p-2">
                            {moduleProducts.map(p => {
                                const priceObj = p.prices?.[0];
                                const isSelected = selectedModules.some(m => m.productId === p.id);
                                const selectedItem = selectedModules.find(m => m.productId === p.id);
                                const quantity = selectedItem?.quantity || 1;
                                const showQuantity = p.name.includes("Usuario") || p.name.includes("Empresa") || p.name.includes("Establecimiento");

                                return (
                                    <div key={p.id} className="flex items-center justify-between pb-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-2 transition-colors">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedModules(prev => [...prev, {
                                                            productId: p.id,
                                                            priceId: priceObj?.id,
                                                            quantity: 1
                                                        }]);
                                                    } else {
                                                        setSelectedModules(prev => prev.filter(m => m.productId !== p.id));
                                                    }
                                                }}
                                            />
                                            <div>
                                                <div className="text-sm font-semibold text-slate-700 leading-snug">{p.name}</div>
                                                <div className="text-xs text-slate-500 font-medium">({formatCurrency(priceObj?.price || 0)})</div>
                                            </div>
                                        </div>

                                        {showQuantity && isSelected && (
                                            <div className="w-20 ml-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const val = Math.max(1, parseInt(e.target.value) || 1);
                                                        setSelectedModules(prev => prev.map(m => m.productId === p.id ? { ...m, quantity: val } : m));
                                                    }}
                                                    className="w-full p-1 border border-slate-300 rounded text-center text-sm font-bold bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setShowModuleModal(false)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md"
                            >
                                Cerrar y Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
