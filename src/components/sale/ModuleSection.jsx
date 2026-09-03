import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { calculateMedicalModuleCost, getMedicalDoctorUnitPrice } from '../../constants';



/**
 * Sección de Módulos y Puntos de Emisión: lista + modal + selección de cantidad/meses/descuento.
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
                            const priceObj = p?.prices.find(pr => pr.id === mod.priceId) || p?.prices?.[0];
                            const isMedical = p && (p.name.toLowerCase().includes("médico") || p.name.toLowerCase().includes("medico"));
                            const showQuantity = p && (p.name.includes("Usuario") || p.name.includes("Empleado") || p.name.includes("Empresa") || p.name.includes("Establecimiento") || isMedical);

                            const basePrice = priceObj ? parseFloat(priceObj.price) : 0;
                            const isMonthly = priceObj?.duration_label?.toUpperCase().includes('MES');
                            const qty = Math.max(1, parseInt(mod.quantity) || 1);
                            const months = isMonthly ? Math.max(1, parseInt(mod.months) || 1) : 1;
                            const discount = Math.min(5, Math.max(0, parseInt(mod.discount) || 0));

                            let totalCalculated = 0;
                            if (isMedical) {
                                const raw = calculateMedicalModuleCost(qty) * months;
                                totalCalculated = discount > 0 ? raw * (1 - (discount / 100)) : raw;
                            } else {
                                totalCalculated = basePrice * qty * months * (1 - (discount / 100));
                            }

                            return (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 text-sm">{p?.name}</div>
                                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                                            {isMedical ? (
                                                <span className="text-blue-600 font-semibold">
                                                    {formatCurrency(getMedicalDoctorUnitPrice(qty))} c/u ({qty} {qty === 1 ? 'doctor' : 'doctores'}) / 1 AÑO
                                                </span>
                                            ) : (
                                                <span>{formatCurrency(basePrice)} / {priceObj?.duration_label || 'PAGO ÚNICO'}</span>
                                            )}
                                            {isMonthly && (
                                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">MENSUAL</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Selector de Plan/Duración si tiene varias opciones */}
                                        {p?.prices?.length > 1 && (
                                            <select
                                                value={mod.priceId || priceObj?.id}
                                                onChange={(e) => {
                                                    const newPriceId = e.target.value;
                                                    setSelectedModules(prev => prev.map((m, i) => i === idx ? { ...m, priceId: newPriceId } : m));
                                                }}
                                                className="p-1 px-2 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {p.prices.map(pr => (
                                                    <option key={pr.id} value={pr.id}>
                                                        {pr.duration_label} ({formatCurrency(pr.price)})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Input Cantidad (Usuarios/Empleados/Empresas/Establecimientos/Doctores) */}
                                        {showQuantity && (
                                            <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs" title={isMedical ? "Cantidad de doctores" : "Cantidad de usuarios/empleados/unidades"}>
                                                <span className="text-slate-400 font-semibold">{isMedical ? 'Doctores:' : 'Cant:'}</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={mod.quantity || 1}
                                                    onChange={(e) => {
                                                        const val = Math.max(1, parseInt(e.target.value) || 1);
                                                        setSelectedModules(prev => prev.map((m, i) => i === idx ? { ...m, quantity: val } : m));
                                                    }}
                                                    className="w-12 text-center font-bold text-slate-700 outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Input Meses (si el precio es mensual) */}
                                        {isMonthly && (
                                            <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-200 rounded-lg text-xs" title="Número de meses a contratar">
                                                <span className="text-slate-400 font-semibold">Meses:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={mod.months || 1}
                                                    onChange={(e) => {
                                                        const val = Math.max(1, parseInt(e.target.value) || 1);
                                                        setSelectedModules(prev => prev.map((m, i) => i === idx ? { ...m, months: val } : m));
                                                    }}
                                                    className="w-12 text-center font-bold text-blue-600 outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Input Descuento */}
                                        <div className="w-16 relative" title="Descuento (Máx 5%)">
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                value={mod.discount || ''}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value) || 0;
                                                    if (val > 5) val = 5;
                                                    if (val < 0) val = 0;
                                                    setSelectedModules(prev => prev.map((m, i) => i === idx ? { ...m, discount: val } : m));
                                                }}
                                                className="w-full p-1 pr-4 bg-white border border-slate-200 rounded text-center text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">%</span>
                                        </div>

                                        {/* Precio Total Calculado */}
                                        <div className="font-extrabold text-slate-800 text-sm min-w-[70px] text-right">
                                            {formatCurrency(totalCalculated)}
                                        </div>

                                        {/* Eliminar */}
                                        <button 
                                            onClick={() => setSelectedModules(prev => prev.filter((_, i) => i !== idx))}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
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
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm mb-6 flex items-center justify-center gap-2"
                >
                    <span>➕</span> Seleccionar Módulos Adicionales
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-4 text-center text-slate-800 shrink-0">Seleccionar Módulos Adicionales</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1 flex-1">
                            {moduleProducts.map(p => {
                                const isSelected = selectedModules.some(m => m.productId === p.id);
                                const selectedItem = selectedModules.find(m => m.productId === p.id);
                                const selectedPriceId = selectedItem?.priceId || p.prices?.[0]?.id;
                                const priceObj = p.prices?.find(pr => pr.id === selectedPriceId) || p.prices?.[0];
                                const isMonthly = priceObj?.duration_label?.toUpperCase().includes('MES');
                                const isMedical = p.name?.toLowerCase().includes("médico") || p.name?.toLowerCase().includes("medico");
                                const showQuantity = p.name.includes("Usuario") || p.name.includes("Empleado") || p.name.includes("Empresa") || p.name.includes("Establecimiento") || isMedical;
                                const quantity = selectedItem?.quantity || 1;
                                const months = selectedItem?.months || 1;

                                return (
                                    <div 
                                        key={p.id} 
                                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                                            isSelected 
                                                ? 'bg-blue-50/70 border-blue-300 shadow-xs' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedModules(prev => [...prev, {
                                                            productId: p.id,
                                                            priceId: priceObj?.id,
                                                            quantity: 1,
                                                            months: 1,
                                                            discount: 0
                                                        }]);
                                                    } else {
                                                        setSelectedModules(prev => prev.filter(m => m.productId !== p.id));
                                                    }
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-800 leading-snug">{p.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {p.description || 'Módulo adicional'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Opciones interactivas si está seleccionado */}
                                        {isSelected && (
                                            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                                                {/* Duración (si tiene varios precios) */}
                                                {p.prices?.length > 1 ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-slate-600">Plan:</span>
                                                        <select
                                                            value={selectedPriceId}
                                                            onChange={(e) => {
                                                                const newPriceId = e.target.value;
                                                                setSelectedModules(prev => prev.map(m => m.productId === p.id ? { ...m, priceId: newPriceId } : m));
                                                            }}
                                                            className="p-1 font-bold bg-white border border-slate-300 rounded text-slate-700 outline-none"
                                                        >
                                                            {p.prices.map(pr => (
                                                                <option key={pr.id} value={pr.id}>
                                                                    {pr.duration_label} ({formatCurrency(pr.price)})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                                                        {isMedical ? (
                                                            <span>
                                                                {quantity === 1 
                                                                    ? `${formatCurrency(150)} / 1 AÑO` 
                                                                    : `${formatCurrency(getMedicalDoctorUnitPrice(quantity))} c/u (${formatCurrency(calculateMedicalModuleCost(quantity))} total)`}
                                                            </span>
                                                        ) : (
                                                            `${formatCurrency(priceObj?.price || 0)} / ${priceObj?.duration_label}`
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {/* Input Cantidad */}
                                                    {showQuantity && (
                                                        <div className="flex items-center gap-1" title={isMedical ? "Cantidad de doctores" : "Cantidad de usuarios/empleados"}>
                                                            <span className="font-semibold text-slate-600">{isMedical ? 'Doctores:' : 'Cant:'}</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={quantity}
                                                                onChange={(e) => {
                                                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                                                    setSelectedModules(prev => prev.map(m => m.productId === p.id ? { ...m, quantity: val } : m));
                                                                }}
                                                                className="w-12 p-1 border border-slate-300 rounded text-center font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Input Meses si es mensual */}
                                                    {isMonthly && (
                                                        <div className="flex items-center gap-1" title="Número de meses a contratar">
                                                            <span className="font-semibold text-slate-600">Meses:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="12"
                                                                value={months}
                                                                onChange={(e) => {
                                                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                                                    setSelectedModules(prev => prev.map(m => m.productId === p.id ? { ...m, months: val } : m));
                                                                }}
                                                                className="w-12 p-1 border border-slate-300 rounded text-center font-bold text-blue-600 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 shrink-0 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setShowModuleModal(false)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md text-sm"
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
