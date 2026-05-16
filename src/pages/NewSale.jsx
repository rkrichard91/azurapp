import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import SignatureSection from '../components/sale/SignatureSection';
import ModuleSection from '../components/sale/ModuleSection';
import CartSummary from '../components/sale/CartSummary';

export default function NewSale() {
    const { canalSeleccionado, setCanalSeleccionado } = useApp();

    // Cargar y categorizar productos
    const {
        products,
        loading,
        planProducts,
        signatureProducts,
        moduleProducts,
        emissionPointProduct,
        signatureOptions,
    } = useProducts(canalSeleccionado);

    // Carrito de cotización
    const cart = useCart({
        planProducts,
        signatureProducts,
        moduleProducts,
        emissionPointProduct,
        signatureOptions,
    });

    // Migración de canal: cuando cambian los productos, migrar selecciones
    const prevProducts = useRef([]);
    useEffect(() => {
        if (prevProducts.current.length > 0 && products.length > 0) {
            // Migrar firmas
            cart.setSelectedSignatures(prev => prev.map(sig => {
                // Find old product by the ID stored in the signature
                const oldProd = prevProducts.current.find(p => p.id === sig.productId);
                if (!oldProd) return sig; // If old product not found, don't migrate
                
                const oldPrice = oldProd?.prices.find(pr => pr.id === sig.priceId);
                const duration = oldPrice?.duration_label;

                // Find new product by matching the NAME
                const newProd = products.find(p => p.name === oldProd.name);
                const newPrice = newProd?.prices.find(pr => pr.duration_label === duration) || newProd?.prices?.[0];
                return newProd && newPrice ? { ...sig, productId: newProd.id, priceId: newPrice.id } : sig;
            }));

            // Migrar módulos
            cart.setSelectedModules(prev => prev.map(mod => {
                const oldProd = prevProducts.current.find(p => p.id === mod.productId);
                if (!oldProd) return mod;

                const oldPrice = oldProd?.prices.find(pr => pr.id === mod.priceId);
                const duration = oldPrice?.duration_label;

                const newProd = products.find(p => p.name === oldProd.name);
                const newPrice = newProd?.prices.find(pr => pr.duration_label === duration) || newProd?.prices?.[0];
                return newProd && newPrice ? { ...mod, productId: newProd.id, priceId: newPrice.id } : mod;
            }));

            // Verificar plan
            cart.setSelectedPlanId(prev => {
                if (prev) {
                    const oldProd = prevProducts.current.find(p => p.id === prev);
                    if (!oldProd) return prev;

                    const newProd = products.find(p => p.name === oldProd.name);
                    if (newProd) {
                        return newProd.id;
                    } else {
                        cart.setSelectedPlanPriceId("");
                        return "";
                    }
                }
                return prev;
            });
        }
        prevProducts.current = products;
    }, [products]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Nueva Venta</h1>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['AZUR', 'LOCAL'].map(c => (
                            <button
                                key={c}
                                onClick={() => setCanalSeleccionado(c)}
                                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${canalSeleccionado === c
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="w-8"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- SECCIONES DE SELECCIÓN --- */}
                <div className="md:col-span-2 space-y-6">

                    {/* 1. PLAN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="text-xl">📦</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Plan de Facturación</h2>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <select
                                    value={cart.selectedPlanId}
                                    onChange={(e) => {
                                        cart.setSelectedPlanId(e.target.value);
                                        cart.setSelectedPlanPriceId("");
                                        cart.setPlanMonths(1);
                                    }}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">No Incluir Plan</option>
                                    {planProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.prices && p.prices[0] ? formatCurrency(p.prices[0].price) : '$?'}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>

                            {/* SELECTOR DE VIGENCIA SI APLICA */}
                            {cart.selectedPlanId && !planProducts.find(p => p.id === cart.selectedPlanId)?.name.toUpperCase().includes("TRANSICI") && (
                                <div className="relative w-48 animate-in fade-in slide-in-from-left-2">
                                    <select
                                        value={cart.selectedPlanPriceId || (planProducts.find(p => p.id === cart.selectedPlanId)?.prices?.[0]?.id || '')}
                                        onChange={(e) => cart.setSelectedPlanPriceId(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    >
                                        {planProducts.find(p => p.id === cart.selectedPlanId)?.prices?.map(pr => (
                                            <option key={pr.id} value={pr.id}>{pr.duration_label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            )}

                            {planProducts.find(p => p.id === cart.selectedPlanId)?.name.toUpperCase().includes("TRANSICI") && (
                                <div className="w-24">
                                    <input
                                        type="number"
                                        min="1"
                                        value={cart.planMonths}
                                        onChange={(e) => cart.setPlanMonths(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Meses"
                                    />
                                </div>
                            )}

                            {cart.selectedPlanId && (
                                <div className="w-28 relative" title="Descuento (Máx 20%)">
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={cart.planDiscount || ''}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0;
                                            if (val > 20) val = 20;
                                            if (val < 0) val = 0;
                                            cart.setPlanDiscount(val);
                                        }}
                                        className="w-full p-4 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Desc%"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. FIRMAS */}
                    <SignatureSection
                        selectedSignatures={cart.selectedSignatures}
                        setSelectedSignatures={cart.setSelectedSignatures}
                        signatureProducts={signatureProducts}
                        signatureOptions={signatureOptions}
                        showSignatureModal={cart.showSignatureModal}
                        setShowSignatureModal={cart.setShowSignatureModal}
                        sigForm={cart.sigForm}
                        setSigForm={cart.setSigForm}
                        currentSigPrice={cart.currentSigPrice}
                        openSignatureModal={cart.openSignatureModal}
                        confirmAddSignature={cart.confirmAddSignature}
                    />

                    {/* 3. MÓDULOS Y PUNTOS DE EMISIÓN */}
                    <ModuleSection
                        selectedModules={cart.selectedModules}
                        setSelectedModules={cart.setSelectedModules}
                        moduleProducts={moduleProducts}
                        emissionPoints={cart.emissionPoints}
                        setEmissionPoints={cart.setEmissionPoints}
                        emissionPointProduct={emissionPointProduct}
                        showModuleModal={cart.showModuleModal}
                        setShowModuleModal={cart.setShowModuleModal}
                    />

                </div>

                {/* --- RESUMEN --- */}
                <CartSummary
                    cartItems={cart.cartItems}
                    subtotal={cart.subtotal}
                    iva={cart.iva}
                    total={cart.total}
                    handleCopy={cart.handleCopy}
                    handleClear={cart.handleClear}
                />

            </div>
        </div>
    );
}
