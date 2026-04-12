import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { TOKEN_SHIPPING_OPTIONS } from '../../constants';

/**
 * Sección de Firma Electrónica: lista de firmas + modal de agregar.
 */
export default function SignatureSection({
    selectedSignatures,
    setSelectedSignatures,
    signatureProducts,
    signatureOptions,
    showSignatureModal,
    setShowSignatureModal,
    sigForm,
    setSigForm,
    currentSigPrice,
    openSignatureModal,
    confirmAddSignature,
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <span className="text-xl">🖋️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Firma Electrónica</h2>
            </div>

            {/* Lista de firmas añadidas */}
            <div className="space-y-3 mb-6">
                {selectedSignatures.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-2">No hay firmas añadidas.</p>
                ) : (
                    selectedSignatures.map((sig, idx) => {
                        const p = signatureProducts.find(prod => prod.id === sig.productId);
                        const price = p?.prices.find(pr => pr.id === sig.priceId);
                        return (
                            <div key={sig.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div>
                                    <div className="font-semibold text-slate-700">{p?.name}</div>
                                    <div className="text-xs text-slate-500">
                                        {price?.duration_label}
                                        {sig.isRenewal && <span className="text-blue-600 font-bold ml-1">(Renovación)</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-bold text-slate-800">
                                            {formatCurrency(
                                                (sig.isRenewal ? (parseFloat(price?.renewal_price) || parseFloat(price?.price)) : parseFloat(price?.price || 0)) * sig.quantity
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400">Qty: {sig.quantity}</div>
                                    </div>
                                    <button onClick={() => {
                                        setSelectedSignatures(prev => prev.filter((_, i) => i !== idx));
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
                onClick={openSignatureModal}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
                Añadir Firma a la Cotización
            </button>

            {/* Modal de Firma */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 text-center text-slate-800">Añadir Firma</h3>

                        <div className="space-y-5">
                            {/* Producto + Cantidad */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        value={sigForm.productId}
                                        onChange={(e) => {
                                            const pid = e.target.value;
                                            const prod = signatureProducts.find(p => p.id === pid);
                                            setSigForm({
                                                ...sigForm,
                                                productId: pid,
                                                priceId: prod?.prices?.[0]?.id || ""
                                            });
                                        }}
                                    >
                                        {signatureOptions.map(opt => (
                                            <option key={opt.product.id} value={opt.product.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <input
                                        type="number"
                                        min="1"
                                        value={sigForm.quantity}
                                        onChange={(e) => setSigForm({ ...sigForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                                    />
                                </div>
                            </div>

                            {/* Vigencia */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-bold text-slate-600">Vigencia</label>
                                    <div className="text-xs text-slate-500">
                                        {formatCurrency(currentSigPrice.base)} s/IVA | {formatCurrency(currentSigPrice.total)} c/IVA
                                    </div>
                                </div>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={sigForm.priceId}
                                    onChange={(e) => setSigForm({ ...sigForm, priceId: e.target.value })}
                                >
                                    {signatureProducts.find(p => p.id === sigForm.productId)?.prices.map(pr => (
                                        <option key={pr.id} value={pr.id}>{pr.duration_label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Selector RUC/Cédula (Solo para Persona Natural) */}
                            {(() => {
                                const prodName = signatureProducts.find(p => p.id === sigForm.productId)?.name || "";
                                if (prodName.toLowerCase().includes("natural")) {
                                    return (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <span className="text-sm font-bold text-slate-700 block mb-2">Tipo de Identificación:</span>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="idType"
                                                        value="cedula"
                                                        checked={sigForm.idType === 'cedula'}
                                                        onChange={(e) => setSigForm({ ...sigForm, idType: e.target.value })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-slate-700">Cédula</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="idType"
                                                        value="ruc"
                                                        checked={sigForm.idType === 'ruc'}
                                                        onChange={(e) => setSigForm({ ...sigForm, idType: e.target.value })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-slate-700">RUC</span>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Renovación */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="renewalCheck"
                                    checked={sigForm.isRenewal}
                                    onChange={(e) => setSigForm({ ...sigForm, isRenewal: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="renewalCheck" className="text-slate-700 font-medium select-none cursor-pointer">Renovación de Firma</label>
                            </div>

                            {/* Descuento */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-1">Descuento</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                                    value={sigForm.discount}
                                    onChange={(e) => setSigForm({ ...sigForm, discount: parseInt(e.target.value) })}
                                >
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="10">10%</option>
                                </select>
                            </div>

                            {/* Tipo de Gestión */}
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                                <span className="text-sm font-bold text-slate-700 block mb-2">Clasificación de la Venta (Firma):</span>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gestionType"
                                            value="Gestión Vendedor"
                                            checked={sigForm.gestion === 'Gestión Vendedor'}
                                            onChange={(e) => setSigForm({ ...sigForm, gestion: e.target.value })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-slate-700">Gestión Vendedor</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gestionType"
                                            value="Autogestión"
                                            checked={sigForm.gestion === 'Autogestión'}
                                            onChange={(e) => setSigForm({ ...sigForm, gestion: e.target.value })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-slate-700">Autogestión</span>
                                    </label>
                                </div>
                            </div>

                            {/* Envío del Token */}
                            {(() => {
                                const prodName = signatureProducts.find(p => p.id === sigForm.productId)?.name || "";
                                if (prodName.includes("Token")) {
                                    return (
                                        <div>
                                            <label className="text-sm font-bold text-slate-600 block mb-1">Envío del Token</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                                                value={sigForm.shipping}
                                                onChange={(e) => setSigForm({ ...sigForm, shipping: e.target.value })}
                                            >
                                                {TOKEN_SHIPPING_OPTIONS.map(opt => (
                                                    <option key={opt.label} value={`${opt.label} - $${opt.price.toFixed(2)} (IVA Incl.)`}>
                                                        {`${opt.label} - $${opt.price.toFixed(2)} (IVA Incl.)`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={confirmAddSignature}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                            >
                                Añadir
                            </button>
                            <button
                                onClick={() => setShowSignatureModal(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
