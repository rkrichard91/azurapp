import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import SignatureSection from '../components/sale/SignatureSection';
import PlanSection from '../components/sale/PlanSection';
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
        canalSeleccionado,
    });

    // Migración de canal: cuando cambian los productos, migrar selecciones
    const prevProducts = useRef([]);
    useEffect(() => {
        if (prevProducts.current.length > 0 && products.length > 0) {
            // Migrar firmas: actualizar priceId al del nuevo canal buscando por duration_label exacto.
            // Si no hay match exacto, NO hacer fallback — el cartItems usará sig.duration_label como respaldo.
            cart.setSelectedSignatures(prev => prev.map(sig => {
                const oldProd = prevProducts.current.find(p => p.id === sig.productId);
                if (!oldProd) return sig;

                const oldPrice = oldProd?.prices.find(pr => pr.id === sig.priceId);
                const duration = oldPrice?.duration_label || sig.duration_label;

                const newProd = products.find(p => p.name === oldProd.name);
                if (!newProd) return sig;

                // Solo actualizar priceId si encontramos la misma duración exacta en el nuevo canal
                const newPrice = newProd.prices.find(pr => pr.duration_label === duration);
                if (newPrice) {
                    return { ...sig, productId: newProd.id, priceId: newPrice.id, duration_label: newPrice.duration_label };
                }
                // Si no hay match exacto, actualizar solo el productId y dejar priceId inválido
                // para que cartItems lo resuelva via duration_label
                return { ...sig, productId: newProd.id };
            }));

            // Migrar módulos
            cart.setSelectedModules(prev => prev.map(mod => {
                const oldProd = prevProducts.current.find(p => p.id === mod.productId);
                if (!oldProd) return mod;

                const oldPrice = oldProd?.prices.find(pr => pr.id === mod.priceId);
                const duration = oldPrice?.duration_label;

                const newProd = products.find(p => p.name === oldProd.name);
                if (!newProd) return mod;

                const newPrice = newProd.prices.find(pr => pr.duration_label === duration);
                if (newPrice) {
                    return { ...mod, productId: newProd.id, priceId: newPrice.id };
                }
                return { ...mod, productId: newProd.id };
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
                    <PlanSection
                        selectedPlans={cart.selectedPlans}
                        setSelectedPlans={cart.setSelectedPlans}
                        planProducts={planProducts}
                        showPlanModal={cart.showPlanModal}
                        setShowPlanModal={cart.setShowPlanModal}
                        planForm={cart.planForm}
                        setPlanForm={cart.setPlanForm}
                        openPlanModal={cart.openPlanModal}
                        confirmAddPlan={cart.confirmAddPlan}
                    />

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
