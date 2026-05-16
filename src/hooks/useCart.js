import { useState, useMemo } from 'react';
import { IVA_RATE, EMISSION_POINT_TIERS } from '../constants';

/**
 * Hook para manejar el carrito de cotización (selecciones, totales, handlers).
 */
export function useCart({ planProducts, signatureProducts, moduleProducts, emissionPointProduct, signatureOptions }) {
    // Selecciones
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [selectedPlanPriceId, setSelectedPlanPriceId] = useState("");
    const [planMonths, setPlanMonths] = useState(1); // Nuevo estado para meses del plan
    const [planDiscount, setPlanDiscount] = useState(0);
    const [emissionPoints, setEmissionPoints] = useState(0);
    const [selectedSignatures, setSelectedSignatures] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);

    // Modal states
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);

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

        // 1. Plan
        if (selectedPlanId) {
            const plan = planProducts.find(p => p.id === selectedPlanId);
            if (plan) {
                let priceObj = null;
                if (selectedPlanPriceId) {
                    priceObj = plan.prices?.find(pr => pr.id === selectedPlanPriceId);
                }
                if (!priceObj) {
                    priceObj = plan.prices ? plan.prices[0] : null;
                }
                const quantity = plan.name.toUpperCase().includes("TRANSICI") ? planMonths : 1;

                let unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
                if (planDiscount > 0) {
                    unitPrice = unitPrice * (1 - (planDiscount / 100));
                }
                const total = unitPrice * quantity;

                items.push({
                    type: 'PLAN',
                    name: plan.name,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    total: total,
                    duration: priceObj ? priceObj.duration_label : ''
                });
            }
        }

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
                const priceObj = product.prices.find(pr => pr.id === mod.priceId);
                let unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
                if (mod.discount > 0) {
                    unitPrice = unitPrice * (1 - (mod.discount / 100));
                }
                items.push({
                    type: 'MODULE',
                    name: product.name,
                    quantity: mod.quantity,
                    unitPrice,
                    total: unitPrice * mod.quantity,
                    duration: priceObj ? priceObj.duration_label : ''
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
    }, [selectedPlanId, selectedPlanPriceId, planMonths, planDiscount, selectedSignatures, selectedModules, emissionPoints, planProducts, signatureProducts, moduleProducts, emissionPointProduct]);

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

    // --- Handlers ---

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
            setSelectedPlanId("");
            setSelectedPlanPriceId("");
            setPlanMonths(1);
            setPlanDiscount(0);
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
        let text = `Serían los siguientes servicios:\n`;
        
        cartItems.forEach(item => {
            const cleanName = item.name.replace(/ - (Gestión Vendedor|Autogestión)$/i, '');
            text += `${cleanName}\n`;
        });
        
        if (type === 'RESUMEN') {
            text += `Valor final $${total.toFixed(2)}`;
        } else {
            text += `Valor final $${subtotal.toFixed(2)}+iva`;
        }
        
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    const handleClear = () => {
        if (window.confirm("¿Borrar toda la cotización?")) {
            setSelectedPlanId("");
            setSelectedPlanPriceId("");
            setPlanMonths(1);
            setPlanDiscount(0);
            setSelectedSignatures([]);
            setSelectedModules([]);
            setEmissionPoints(0);
        }
    };

    return {
        // Estado
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
        openSignatureModal,
        confirmAddSignature,
        handleRemoveItem,
        handleCopy,
        handleClear,
    };
}
