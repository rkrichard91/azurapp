import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

/**
 * Sección de Planes: lista de planes seleccionados + modal para agregar un nuevo plan.
 */
export default function PlanSection({
    selectedPlans,
    setSelectedPlans,
    planProducts,
    showPlanModal,
    setShowPlanModal,
    planForm,
    setPlanForm,
    openPlanModal,
    confirmAddPlan,
}) {
    // Plan actualmente seleccionado en el formulario del modal
    const selectedProductInModal = planProducts.find(p => p.id === planForm.productId);
    const isTransitionInModal = selectedProductInModal?.name.toUpperCase().includes("TRANSICI");
    const currentPriceObjInModal = selectedProductInModal?.prices?.find(pr => pr.id === planForm.priceId) || selectedProductInModal?.prices?.[0];

    // Cálculo dinámico del precio en el modal
    const baseUnitPrice = currentPriceObjInModal ? parseFloat(currentPriceObjInModal.price) : 0;
    const discountMultiplier = 1 - ((planForm.discount || 0) / 100);
    const discountedUnitPrice = baseUnitPrice * discountMultiplier;
    const modalQuantity = isTransitionInModal ? (planForm.months || 1) : 1;
    const modalSubtotal = discountedUnitPrice * modalQuantity;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <span className="text-xl">📦</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Plan de Facturación</h2>
            </div>

            {/* Lista de planes añadidos */}
            <div className="space-y-3 mb-6">
                {selectedPlans.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-2">No hay planes añadidos.</p>
                ) : (
                    selectedPlans.map((planItem, idx) => {
                        const p = planProducts.find(prod => prod.id === planItem.productId);
                        const priceObj = p?.prices?.find(pr => pr.id === planItem.priceId) || p?.prices?.[0];
                        const isTransition = p?.name.toUpperCase().includes("TRANSICI");
                        const qty = isTransition ? (planItem.months || 1) : 1;
                        const basePrice = priceObj ? parseFloat(priceObj.price) : 0;
                        const disc = planItem.discount || 0;
                        const totalCalculated = basePrice * (1 - disc / 100) * qty;

                        return (
                            <div key={planItem.id || idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div>
                                    <div className="font-semibold text-slate-700">{p?.name || 'Plan de Facturación'}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                        <span>{isTransition ? `${qty} Mes(es)` : priceObj?.duration_label}</span>
                                        {disc > 0 && (
                                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                -{disc}% Desc.
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-bold text-slate-800">
                                            {formatCurrency(totalCalculated)}
                                        </div>
                                        {isTransition && <div className="text-xs text-slate-400">{qty} x {formatCurrency(basePrice * (1 - disc / 100))}/mes</div>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedPlans(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                        title="Eliminar Plan"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button
                onClick={openPlanModal}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                <span>+</span> Añadir Plan a la Cotización
            </button>

            {/* Modal de Agregar Plan */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 text-center text-slate-800">Añadir Plan de Facturación</h3>

                        <div className="space-y-5">
                            {/* Selector de Plan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Plan</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                    value={planForm.productId}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        const prod = planProducts.find(p => p.id === pid);
                                        const firstPrice = prod?.prices?.[0];
                                        setPlanForm(prev => ({
                                            ...prev,
                                            productId: pid,
                                            priceId: firstPrice?.id || "",
                                            months: 1
                                        }));
                                    }}
                                >
                                    <option value="">Seleccione un plan...</option>
                                    {planProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} - {p.prices && p.prices[0] ? formatCurrency(p.prices[0].price) : '$?'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vigencia o Meses (Transición) */}
                            {selectedProductInModal && !isTransitionInModal && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vigencia</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                        value={planForm.priceId}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, priceId: e.target.value }))}
                                    >
                                        {selectedProductInModal.prices?.map(pr => (
                                            <option key={pr.id} value={pr.id}>
                                                {pr.duration_label} - {formatCurrency(pr.price)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedProductInModal && isTransitionInModal && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Meses de Suscripción</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={planForm.months}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, months: Math.max(1, parseInt(e.target.value) || 1) }))}
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                        placeholder="Número de meses"
                                    />
                                </div>
                            )}

                            {/* Descuento */}
                            {selectedProductInModal && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descuento (%) - Máx 20%</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={planForm.discount || ''}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value) || 0;
                                                if (val > 20) val = 20;
                                                if (val < 0) val = 0;
                                                setPlanForm(prev => ({ ...prev, discount: val }));
                                            }}
                                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                            )}

                            {/* Total previo */}
                            {selectedProductInModal && (
                                <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                                    <span className="text-sm font-semibold text-slate-600">Subtotal del Plan:</span>
                                    <span className="text-lg font-bold text-blue-600">{formatCurrency(modalSubtotal)}</span>
                                </div>
                            )}

                            {/* Botones del Modal */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmAddPlan}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Añadir Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
