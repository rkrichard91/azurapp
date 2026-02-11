import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchProductsByChannel } from '../services/pricingService';

const TOKEN_SHIPPING_OPTIONS = [
    { label: "Retiro en Oficina", price: 0 },
    { label: "Guayaquil", price: 4.02 },
    { label: "Costa", price: 5.75 },
    { label: "Sierra", price: 6.90 },
    { label: "Oriente", price: 9.20 },
    { label: "Galápagos", price: 16.10 },
];

export default function NewSale() {
    const { canalSeleccionado, setCanalSeleccionado } = useApp();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selections
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [emissionPoints, setEmissionPoints] = useState(0);

    // Cart Items Data Structure
    // Signatures: Array of { productId, priceId, quantity, isRenewal, shipping, discount }
    const [selectedSignatures, setSelectedSignatures] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]); // Array of { productId, priceId, quantity }

    // Modal States
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);

    // Signature Form State
    const [sigForm, setSigForm] = useState({
        productId: "",
        priceId: "",
        quantity: 1,
        isRenewal: false,
        shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
        discount: 0
    });

    // --- LOAD DATA ---
    // --- LOAD DATA ---
    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchProductsByChannel(canalSeleccionado);

            // Should we migrate or clear?
            // If we have existing products, it means we are switching channels.
            if (products.length > 0) {
                // 1. Migrate Signatures (Find new priceID for same duration)
                setSelectedSignatures(prev => prev.map(sig => {
                    const oldProd = products.find(p => p.id === sig.productId);
                    const oldPrice = oldProd?.prices.find(pr => pr.id === sig.priceId);
                    const duration = oldPrice?.duration_label;

                    const newProd = data.find(p => p.id === sig.productId);
                    // Match by duration, or fallback to first available price
                    const newPrice = newProd?.prices.find(pr => pr.duration_label === duration) || newProd?.prices?.[0];

                    return newPrice ? { ...sig, priceId: newPrice.id } : sig;
                }));

                // 2. Migrate Modules
                setSelectedModules(prev => prev.map(mod => {
                    const oldProd = products.find(p => p.id === mod.productId);
                    const oldPrice = oldProd?.prices.find(pr => pr.id === mod.priceId);
                    const duration = oldPrice?.duration_label;

                    const newProd = data.find(p => p.id === mod.productId);
                    const newPrice = newProd?.prices.find(pr => pr.duration_label === duration) || newProd?.prices?.[0];

                    return newPrice ? { ...mod, priceId: newPrice.id } : mod;
                }));

                // 3. Plan (ID is stable across channels usually, but verify)
                if (selectedPlanId) {
                    const exists = data.find(p => p.id === selectedPlanId);
                    if (!exists) setSelectedPlanId("");
                }

                // 4. Emission Points - Hardcoded, safe to keep.
            }

            setProducts(data);
            setLoading(false);
        }
        load();
    }, [canalSeleccionado]); // Intentionally omitting 'products' to avoid loop, relying on closure capture of old products

    // --- HELPERS ---
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    // --- DERIVED STATE ---

    // Categorized Products
    const planProducts = useMemo(() => products.filter(p => p.category?.code === 'PLAN'), [products]);
    const signatureProducts = useMemo(() => products.filter(p => p.category?.code === 'SIGNATURE'), [products]);
    const moduleProducts = useMemo(() => products.filter(p => p.category?.code === 'MODULE'), [products]);

    // Emission Point Product
    const emissionPointProduct = useMemo(() => products.find(p => p.name === 'Establecimiento Adicional' || p.name === 'Punto de venta'), [products]);

    // Mapped Signature Options for Dropdown
    const signatureOptions = useMemo(() => {
        // Map UI labels to DB Product Names
        const mapping = [
            { label: "Firma P. Natural (Cédula)", dbName: "Firma P. Natural (Cédula)" },
            { label: "Firma P. Jurídica (RUC)", dbName: "Firma P. Jurídica (Empresa)" },
            { label: "Firma en Token (Persona Natural)", dbName: "Firma en Token (Persona Natural)" },
            { label: "Firma Token (Persona Jurídica)", dbName: "Firma Token (Persona Jurídica)" }
        ];

        return mapping.map(opt => {
            const product = signatureProducts.find(p => p.name === opt.dbName);
            return {
                label: opt.label,
                product: product // might be undefined if not found in DB
            };
        }).filter(opt => opt.product); // Only show available products
    }, [signatureProducts]);


    // Construct Cart Items
    const cartItems = useMemo(() => {
        const items = [];

        // 1. Plan
        if (selectedPlanId) {
            const plan = planProducts.find(p => p.id === selectedPlanId);
            if (plan) {
                const priceObj = plan.prices ? plan.prices[0] : null;
                items.push({
                    type: 'PLAN',
                    name: plan.name,
                    quantity: 1,
                    unitPrice: priceObj ? parseFloat(priceObj.price) : 0,
                    total: priceObj ? parseFloat(priceObj.price) : 0,
                    duration: priceObj ? priceObj.duration_label : ''
                });
            }
        }

        // 2. Signatures
        selectedSignatures.forEach(sig => {
            const product = signatureProducts.find(p => p.id === sig.productId);
            if (product) {
                const priceObj = product.prices.find(pr => pr.id === sig.priceId);
                let unitPrice = 0;

                if (priceObj) {
                    unitPrice = sig.isRenewal
                        ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
                        : parseFloat(priceObj.price);
                }

                // Apply discount if needed (logic placeholder)
                // if (sig.discount > 0) unitPrice = unitPrice * (1 - sig.discount / 100);

                // Applying Shipping Logic (Flat rate per batch for now)
                const shippingMatch = sig.shipping ? sig.shipping.match(/\$([\d\.]+)/) : null;
                const shippingCost = shippingMatch ? parseFloat(shippingMatch[1]) : 0;

                // Assuming shipping is per line item (shipment), not per unit quantity, unless specified?
                // Usually "Envío" is for the package. If quantity > 1, are they sent together? Yes.
                // Shipping prices are IVA included, so we add the base amount to the subtotal
                const shippingBase = shippingCost / 1.15;
                const total = (unitPrice * sig.quantity) + shippingBase;

                items.push({
                    type: 'SIGNATURE',
                    name: `${product.name}${sig.isRenewal ? ' (Renovación)' : ''}`,
                    quantity: sig.quantity,
                    unitPrice: unitPrice,
                    total: total,
                    duration: priceObj ? priceObj.duration_label : '',
                    details: sig.shipping ? `Envío: ${sig.shipping}` : ''
                });
            }
        });

        // 3. Modules
        selectedModules.forEach(mod => {
            const product = moduleProducts.find(p => p.id === mod.productId);
            if (product) {
                const priceObj = product.prices.find(pr => pr.id === mod.priceId);
                const unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
                items.push({
                    type: 'MODULE',
                    name: product.name,
                    quantity: mod.quantity,
                    unitPrice: unitPrice,
                    total: unitPrice * mod.quantity,
                    duration: priceObj ? priceObj.duration_label : ''
                });
            }
        });

        // 4. Emission Points
        if (emissionPoints > 0) {
            let unitPrice = 2.25;
            if (emissionPoints >= 50) {
                unitPrice = 1.75;
            } else if (emissionPoints >= 12) {
                unitPrice = 2.00;
            }

            items.push({
                type: 'EXTRA',
                name: `Puntos de Emisión Adicionales`,
                quantity: emissionPoints,
                unitPrice: unitPrice,
                total: unitPrice * emissionPoints,
                duration: '1 AÑO'
            });
        }

        return items;
    }, [selectedPlanId, selectedSignatures, selectedModules, emissionPoints, planProducts, signatureProducts, moduleProducts, emissionPointProduct]);

    // Totals
    const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
    const iva = subtotal * 0.15;
    const total = subtotal + iva;


    // --- HANDLERS ---

    // Open Modal with Default
    const openSignatureModal = () => {
        // Default to first option
        if (signatureOptions.length > 0) {
            const defaultOpt = signatureOptions[0];
            const defaultPrice = defaultOpt.product.prices && defaultOpt.product.prices.length > 0 ? defaultOpt.product.prices[0].id : "";
            setSigForm({
                productId: defaultOpt.product.id,
                priceId: defaultPrice,
                quantity: 1,
                isRenewal: false,
                shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
                discount: 0
            });
        }
        setShowSignatureModal(true);
    };

    const confirmAddSignature = () => {
        if (!sigForm.productId || !sigForm.priceId) {
            alert("Seleccione un producto y vigencia válidos.");
            return;
        }

        setSelectedSignatures(prev => [...prev, { ...sigForm }]);
        setShowSignatureModal(false);
    };

    const handleAddModule = (productId, priceId) => {
        setSelectedModules(prev => {
            const exists = prev.find(p => p.productId === productId && p.priceId === priceId);
            if (exists) {
                return prev.map(p => p.productId === productId && p.priceId === priceId ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { productId, priceId, quantity: 1 }];
        });
        setShowModuleModal(false);
    };

    const handleRemoveItem = (item, index) => {
        if (item.type === 'PLAN') setSelectedPlanId("");

        if (item.type === 'SIGNATURE') {
            // Remove by index overlap in derived list is tricky, better to remove match
            // Simplest is to filter out the matching entry in state based on index in cart or ID
            // But selectedSignatures is the source. 
            // We need to identify WHICH selectedSignature corresponds to this item.
            // Since cartItems order matches insertion order roughly, let's try to match logic.
            // Issue: cartItems is flattened/derived.
            // Solution: For now, just remove the LAST signature that matches (LIFO) or index.
            // To be precise: we should attach a unique ID to each selection.
            // For this demo: we will just filter out the FIRST match we find in state.

            setSelectedSignatures(prev => {
                const newArr = [...prev];
                // Try to find a match
                const idx = newArr.findIndex(s => {
                    const p = signatureProducts.find(prod => prod.id === s.productId);
                    return p?.name === item.name.replace(' (Renovación)', ''); // loose match
                });
                if (idx > -1) newArr.splice(idx, 1);
                return newArr;
            });
        }

        if (item.type === 'MODULE') {
            setSelectedModules(prev => {
                const newArr = [...prev];
                const idx = newArr.findIndex(s => {
                    const p = moduleProducts.find(prod => prod.id === s.productId);
                    return p?.name === item.name;
                });
                if (idx > -1) newArr.splice(idx, 1);
                return newArr;
            });
        }

        if (item.type === 'EXTRA') setEmissionPoints(0);
    };

    const handleCopy = (type) => {
        let text = "";
        if (type === 'RESUMEN') {
            text = `Serían los siguientes servicios:\n`;
            cartItems.forEach(item => {
                text += `* ${item.name} ${item.duration}\n`;
            });
            text += `\nTOTAL $${total.toFixed(2)} (IVA INC)`;
        } else {
            text = `Detalle de Cotización:\n\n`;
            cartItems.forEach(item => {
                text += `${item.name} (${item.duration}) x ${item.quantity}: $${item.total.toFixed(2)}\n`;
            });
            text += `\nSubtotal: $${subtotal.toFixed(2)}`;
            text += `\nIVA (15%): $${iva.toFixed(2)}`;
            text += `\nTOTAL: $${total.toFixed(2)}`;
        }
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    const handleClear = () => {
        if (window.confirm("¿Borrar toda la cotización?")) {
            setSelectedPlanId("");
            setSelectedSignatures([]);
            setSelectedModules([]);
            setEmissionPoints(0);
        }
    };

    // Calculate Dynamic Price for Modal Display
    const currentSigPrice = useMemo(() => {
        if (!sigForm.productId || !sigForm.priceId) return { base: 0, total: 0 };
        const prod = signatureProducts.find(p => p.id === sigForm.productId);
        const priceObj = prod?.prices.find(pr => pr.id === sigForm.priceId);

        if (!priceObj) return { base: 0, total: 0 };

        const unit = sigForm.isRenewal
            ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
            : parseFloat(priceObj.price);

        return {
            base: unit,
            total: unit * 1.15 // rough IVA estimate for display
        };
    }, [sigForm, signatureProducts]);

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
                        {['AZUR', 'LOCAL', 'WEB'].map(c => (
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

                {/* --- SELECTIONS --- */}
                <div className="md:col-span-2 space-y-6">

                    {/* 1. PLAN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="text-xl">📦</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Plan de Facturación</h2>
                        </div>

                        <div className="relative">
                            <select
                                value={selectedPlanId}
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">No Incluir Plan</option>
                                {planProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - {p.prices && p.prices[0] ? formatCurrency(p.prices[0].price) : '$?'}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    {/* 2. FIRMAS */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="text-xl">🖋️</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Firma Electrónica</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            {selectedSignatures.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-2">No hay firmas añadidas.</p>
                            ) : (
                                selectedSignatures.map((sig, idx) => {
                                    const p = signatureProducts.find(prod => prod.id === sig.productId);
                                    const price = p?.prices.find(pr => pr.id === sig.priceId);
                                    return (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
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

                        {/* DETAILED SIGNATURE MODAL */}
                        {showSignatureModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 shadow-2xl">
                                    <h3 className="text-lg font-bold mb-6 text-center text-slate-800">Añadir Firma</h3>

                                    <div className="space-y-5">
                                        {/* Product Select */}
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
                                                            priceId: prod?.prices?.[0]?.id || "" // Reset price on product change
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

                                        {/* Validity / Vigencia */}
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

                                        {/* Renewal Checkbox */}
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

                                        {/* Discount */}
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

                                        {/* Token Shipping (Only if Token) */}
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

                    {/* 3. MODULES */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="text-xl">🔌</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Módulos y Puntos de Emisión</h2>
                        </div>

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

                        {/* Module Modal */}
                        {showModuleModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200">
                                    <h3 className="text-xl font-bold mb-6 text-center text-slate-800">Seleccionar Módulos Adicionales</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[60vh] overflow-y-auto p-2">
                                        {moduleProducts.map(p => {
                                            const priceObj = p.prices?.[0]; // Assuming single price for modules usually
                                            // Check if already selected to init state (but we use a temp state in a real app, here we'll simplify and use direct manipulation or a local inner component)

                                            // Better: New component logic inline
                                            // We need to manage state of checked/quantity manually here if we want "Apply" logic.
                                            // For this prompt, I will implement a self-contained logic block inside the map 
                                            // BUT `selectedModules` is in parent. 

                                            // Let's create a temporary state map for this modal? 
                                            // No, let's just use the `selectedModules` directly but with a specialized UI.

                                            const isSelected = selectedModules.some(m => m.productId === p.id);
                                            const selectedItem = selectedModules.find(m => m.productId === p.id);
                                            const quantity = selectedItem?.quantity || 1;

                                            // Determine if it needs quantity input
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
                                                                    // Add with default qty 1
                                                                    setSelectedModules(prev => [...prev, {
                                                                        productId: p.id,
                                                                        priceId: priceObj?.id,
                                                                        quantity: 1
                                                                    }]);
                                                                } else {
                                                                    // Remove
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
                    </div>
                </div>

                {/* --- SUMMARY --- */}
                <div className="md:col-span-1">
                    <div className="sticky top-28 space-y-6">

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

            </div>
        </div>
    );
}
