import { useState, useMemo } from 'react';
import { IVA_RATE, EMISSION_POINT_TIERS } from '../constants';

/**
 * Hook para manejar el carrito de cotización (selecciones, totales, handlers).
 */
export function useCart({ planProducts, signatureProducts, moduleProducts, emissionPointProduct, signatureOptions, canalSeleccionado }) {
    // Selecciones
    const [selectedPlans, setSelectedPlans] = useState([]); // [{ id, productId, priceId, months, discount }]
    const [emissionPoints, setEmissionPoints] = useState(0);
    const [selectedSignatures, setSelectedSignatures] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);

    // Modal states
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);

    // Formulario de plan
    const [planForm, setPlanForm] = useState({
        productId: "",
        priceId: "",
        months: 1,
        quantity: 1,
        discount: 0
    });

    // Formulario de firma
    const [sigForm, setSigForm] = useState({
        productId: "",
        priceId: "",
        product_name: "",   // guardado para fallback entre canales
        duration_label: "", // guardado para fallback entre canales
        quantity: 1,
        isRenewal: false,
        shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
        discount: 0,
        idType: "cedula", // 'cedula' | 'ruc'
        gestion: "Gestión Vendedor" // 'Gestión Vendedor' | 'Autogestión'
    });

    // --- Cart Items derivados ---
    const cartItems = useMemo(() => {
        const items = [];

        // 1. Planes
        selectedPlans.forEach(planItem => {
            const plan = planProducts.find(p => p.id === planItem.productId);
            if (plan) {
                let priceObj = null;
                if (planItem.priceId) {
                    priceObj = plan.prices?.find(pr => pr.id === planItem.priceId);
                }
                if (!priceObj) {
                    priceObj = plan.prices ? plan.prices[0] : null;
                }
                const months = planItem.months || 1;
                const planQty = Math.max(1, parseInt(planItem.quantity) || 1);
                const discount = planItem.discount || 0;
                const isTransition = plan.name.toUpperCase().includes("TRANSICI");
                const quantity = isTransition ? (months * planQty) : planQty;

                let unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
                if (discount > 0) {
                    unitPrice = unitPrice * (1 - (discount / 100));
                }
                const total = unitPrice * quantity;

                items.push({
                    type: 'PLAN',
                    _planId: planItem.id,
                    name: plan.name,
                    quantity: quantity,
                    planQty: planQty,
                    unitPrice: unitPrice,
                    total: total,
                    duration: priceObj ? priceObj.duration_label : '',
                    discount: discount
                });
            }
        });

        // 2. Firmas
        selectedSignatures.forEach(sig => {
            // Buscar producto por ID; si no coincide (cambio de canal), usar nombre guardado como fallback
            let product = signatureProducts.find(p => p.id === sig.productId);
            if (!product && sig.product_name) {
                product = signatureProducts.find(p => p.name === sig.product_name);
            }
            if (product) {
                // Buscar precio por ID; si no coincide (cambio de canal), usar duration_label guardado como fallback
                let priceObj = product.prices.find(pr => pr.id === sig.priceId);
                if (!priceObj && sig.duration_label) {
                    priceObj = product.prices.find(pr => pr.duration_label === sig.duration_label);
                }
                let unitPrice = 0;

                if (priceObj) {
                    let basePrice = sig.isRenewal
                        ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
                        : parseFloat(priceObj.price);
                    
                    if (sig.discount > 0) {
                        basePrice = basePrice * (1 - (sig.discount / 100));
                    }
                    unitPrice = basePrice;
                }

                const shippingMatch = sig.shipping ? sig.shipping.match(/\$([\d\.]+)/) : null;
                const shippingCost = shippingMatch ? parseFloat(shippingMatch[1]) : 0;
                const shippingBase = shippingCost / 1.15;
                const total = (unitPrice * sig.quantity) + shippingBase;

                // Determinar si mostrar RUC/Cédula
                let nameSuffix = "";
                let baseName = product.name;

                if (product.name.toLowerCase().includes("natural")) {
                    baseName = baseName.replace(/\s*\(Cédula\)/i, "");
                    if (sig.idType === 'ruc') {
                        nameSuffix = " (RUC)";
                    }
                }

                items.push({
                    type: 'SIGNATURE',
                    _sigId: sig.id,
                    name: `${baseName}${sig.isRenewal ? ' (Renovación)' : ''}${nameSuffix} - ${sig.gestion}`,
                    quantity: sig.quantity,
                    unitPrice,
                    total,
                    duration: priceObj ? priceObj.duration_label : (sig.duration_label || ''),
                    details: sig.shipping ? `Envío: ${sig.shipping}` : '',
                    gestion: sig.gestion
                });
            }
        });

        // 3. Módulos
        selectedModules.forEach(mod => {
            const product = moduleProducts.find(p => p.id === mod.productId);
            if (product) {
                const priceObj = product.prices.find(pr => pr.id === mod.priceId) || product.prices?.[0];
                let unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
                if (mod.discount > 0) {
                    unitPrice = unitPrice * (1 - (mod.discount / 100));
                }
                const isMonthly = priceObj?.duration_label?.toUpperCase().includes('MES');
                const quantity = Math.max(1, parseInt(mod.quantity) || 1);
                const months = isMonthly ? Math.max(1, parseInt(mod.months) || 1) : 1;
                const total = unitPrice * quantity * months;

                let durationText = priceObj ? priceObj.duration_label : '';
                if (isMonthly) {
                    durationText = `${months} ${months === 1 ? 'MES' : 'MESES'}`;
                }

                let detailsText = '';
                if (quantity > 1 && months > 1) {
                    detailsText = `${quantity} unidades x ${months} meses`;
                } else if (quantity > 1) {
                    detailsText = `${quantity} unidades`;
                } else if (months > 1) {
                    detailsText = `${months} meses`;
                }

                items.push({
                    type: 'MODULE',
                    name: product.name,
                    quantity,
                    months,
                    unitPrice,
                    total,
                    duration: durationText,
                    details: detailsText
                });
            }
        });

        // 4. Puntos de Emisión
        if (emissionPoints > 0) {
            const tier = EMISSION_POINT_TIERS.find(t => emissionPoints >= t.minQty);
            const unitPrice = tier ? tier.price : 2.25;

            items.push({
                type: 'EXTRA',
                name: 'Puntos de Emisión Adicionales',
                quantity: emissionPoints,
                unitPrice,
                total: unitPrice * emissionPoints,
                duration: '1 AÑO'
            });
        }

        return items;
    }, [selectedPlans, selectedSignatures, selectedModules, emissionPoints, planProducts, signatureProducts, moduleProducts, emissionPointProduct]);

    // Totales
    const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    // Precio dinámico para el modal de firma
    const currentSigPrice = useMemo(() => {
        if (!sigForm.productId || !sigForm.priceId) return { base: 0, total: 0 };
        const prod = signatureProducts.find(p => p.id === sigForm.productId);
        const priceObj = prod?.prices.find(pr => pr.id === sigForm.priceId);

        if (!priceObj) return { base: 0, total: 0 };

        let unit = sigForm.isRenewal
            ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
            : parseFloat(priceObj.price);

        if (sigForm.discount > 0) {
            unit = unit * (1 - (sigForm.discount / 100));
        }

        return { base: unit, total: unit * (1 + IVA_RATE) };
    }, [sigForm, signatureProducts]);

    // Handlers legacy
    const selectedPlanId = selectedPlans[0]?.productId || "";
    const setSelectedPlanId = (val) => {
        if (!val) {
            setSelectedPlans([]);
        } else {
            const prod = planProducts.find(p => p.id === val);
            const firstPrice = prod?.prices?.[0];
            setSelectedPlans([{
                id: crypto.randomUUID(),
                productId: val,
                priceId: firstPrice?.id || "",
                months: 1,
                discount: 0
            }]);
        }
    };
    const selectedPlanPriceId = selectedPlans[0]?.priceId || "";
    const setSelectedPlanPriceId = (val) => {
        if (selectedPlans.length > 0) {
            setSelectedPlans(prev => prev.map((p, i) => i === 0 ? { ...p, priceId: val } : p));
        }
    };
    const planMonths = selectedPlans[0]?.months || 1;
    const setPlanMonths = (val) => {
        if (selectedPlans.length > 0) {
            setSelectedPlans(prev => prev.map((p, i) => i === 0 ? { ...p, months: val } : p));
        }
    };
    const planDiscount = selectedPlans[0]?.discount || 0;
    const setPlanDiscount = (val) => {
        if (selectedPlans.length > 0) {
            setSelectedPlans(prev => prev.map((p, i) => i === 0 ? { ...p, discount: val } : p));
        }
    };

    // --- Handlers para Modal de Planes ---
    const openPlanModal = () => {
        if (planProducts && planProducts.length > 0) {
            const defaultProd = planProducts[0];
            const defaultPriceObj = defaultProd.prices?.[0];
            setPlanForm({
                productId: defaultProd.id,
                priceId: defaultPriceObj?.id || "",
                months: 1,
                quantity: 1,
                discount: 0
            });
        }
        setShowPlanModal(true);
    };

    const confirmAddPlan = () => {
        if (!planForm.productId) {
            alert("Seleccione un plan válido.");
            return;
        }
        setSelectedPlans(prev => [...prev, { ...planForm, id: crypto.randomUUID() }]);
        setShowPlanModal(false);
    };

    // --- Handlers de Firma ---
    const openSignatureModal = () => {
        if (signatureOptions.length > 0) {
            const defaultOpt = signatureOptions[0];
            const defaultPriceObj = defaultOpt.product.prices?.[0];
            setSigForm({
                productId: defaultOpt.product.id,
                priceId: defaultPriceObj?.id || "",
                product_name: defaultOpt.product.name || "",
                duration_label: defaultPriceObj?.duration_label || "",
                quantity: 1,
                isRenewal: false,
                shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
                discount: 0,
                idType: "cedula",
                gestion: "Gestión Vendedor"
            });
        }
        setShowSignatureModal(true);
    };

    const confirmAddSignature = () => {
        if (!sigForm.productId || !sigForm.priceId) {
            alert("Seleccione un producto y vigencia válidos.");
            return;
        }
        setSelectedSignatures(prev => [...prev, { ...sigForm, id: crypto.randomUUID() }]);
        setShowSignatureModal(false);
    };

    const handleRemoveItem = (item) => {
        if (item.type === 'PLAN') {
            if (item._planId) {
                setSelectedPlans(prev => prev.filter(p => p.id !== item._planId));
            } else {
                setSelectedPlans([]);
            }
        }
        if (item.type === 'SIGNATURE') {
            setSelectedSignatures(prev => prev.filter(s => s.id !== item._sigId));
        }
        if (item.type === 'MODULE') {
            setSelectedModules(prev => {
                const idx = prev.findIndex(s => {
                    const p = moduleProducts.find(prod => prod.id === s.productId);
                    return p?.name === item.name;
                });
                if (idx > -1) {
                    const newArr = [...prev];
                    newArr.splice(idx, 1);
                    return newArr;
                }
                return prev;
            });
        }
        if (item.type === 'EXTRA') setEmissionPoints(0);
    };

    const handleCopy = (type) => {
        const origen = canalSeleccionado === 'LOCAL' ? 'Local' : 'Azur';
        let text = `${origen}\nSerían los siguientes servicios:\n`;
        
        const formatDuration = (str) => {
            if (!str) return '';
            let s = str.toLowerCase();
            s = s.replace(/días|dias/g, 'Días');
            s = s.replace(/día|dia/g, 'Día');
            s = s.replace(/años/g, 'Años');
            s = s.replace(/año/g, 'Año');
            return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };
        
        cartItems.forEach(item => {
            const cleanName = item.name.replace(/ - (Gestión Vendedor|Autogestión)$/i, '');
            let displayName = cleanName;
            if (item.type === 'SIGNATURE' || item.type === 'PLAN') {
                displayName = `${cleanName} - ${formatDuration(item.duration)}`;
            } else if (item.type === 'MODULE') {
                displayName = `Modulo ${cleanName}`;
            }
            
            if (type === 'DETALLE') {
                const itemPriceStr = Number.isInteger(item.total) ? item.total.toFixed(0) : item.total.toFixed(2);
                text += `${displayName} - $${itemPriceStr}+iva\n`;
            } else {
                text += `${displayName}\n`;
            }
        });
        
        const subtotalStr = Number.isInteger(subtotal) ? subtotal.toFixed(0) : subtotal.toFixed(2);
        text += `Total $${subtotalStr}+iva\n`;

        if (type === 'RESUMEN') {
            const totalStr = Number.isInteger(total) ? total.toFixed(0) : total.toFixed(2);
            text += `Valor final $${totalStr}`;
        } else {
            text += `Valor final $${total.toFixed(2)}`;
        }
        
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    const handleClear = () => {
        if (window.confirm("¿Borrar toda la cotización?")) {
            setSelectedPlans([]);
            setSelectedSignatures([]);
            setSelectedModules([]);
            setEmissionPoints(0);
        }
    };

    return {
        // Estado
        selectedPlans, setSelectedPlans,
        showPlanModal, setShowPlanModal,
        planForm, setPlanForm,
        selectedPlanId, setSelectedPlanId,
        selectedPlanPriceId, setSelectedPlanPriceId,
        planMonths, setPlanMonths,
        planDiscount, setPlanDiscount,
        emissionPoints, setEmissionPoints,
        selectedSignatures, setSelectedSignatures,
        selectedModules, setSelectedModules,
        showSignatureModal, setShowSignatureModal,
        showModuleModal, setShowModuleModal,
        sigForm, setSigForm,
        // Derivados
        cartItems, subtotal, iva, total,
        currentSigPrice,
        // Handlers
        openPlanModal,
        confirmAddPlan,
        openSignatureModal,
        confirmAddSignature,
        handleRemoveItem,
        handleCopy,
        handleClear,
    };
}
