import { useState, useMemo } from 'react';
import { IVA_RATE, EMISSION_POINT_TIERS } from '../constants';

/**
 * Hook para manejar el carrito de cotización (selecciones, totales, handlers).
 */
export function useCart({ planProducts, signatureProducts, moduleProducts, emissionPointProduct, signatureOptions }) {
    // Selecciones
    const [selectedPlanId, setSelectedPlanId] = useState("");
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
        quantity: 1,
        isRenewal: false,
        shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
        discount: 0,
        idType: "cedula" // 'cedula' | 'ruc'
    });

    // --- Cart Items derivados ---
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

        // 2. Firmas
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

                const shippingMatch = sig.shipping ? sig.shipping.match(/\$([\d\.]+)/) : null;
                const shippingCost = shippingMatch ? parseFloat(shippingMatch[1]) : 0;
                const shippingBase = shippingCost / 1.15;
                const total = (unitPrice * sig.quantity) + shippingBase;

                // Determinar si mostrar RUC/Cédula
                let nameSuffix = "";
                let baseName = product.name;

                if (product.name.toLowerCase().includes("natural")) {
                    // Limpiar "(Cédula)" del nombre base si existe, para no duplicar ni mostrarlo si se elige Cédula
                    baseName = baseName.replace(/\s*\(Cédula\)/i, "");

                    if (sig.idType === 'ruc') {
                        nameSuffix = " (RUC)";
                    }
                    // Si es cédula, no agregamos sufijo (el usuario pidió quitar "Cédula")
                }

                items.push({
                    type: 'SIGNATURE',
                    _sigId: sig.id,
                    name: `${baseName}${sig.isRenewal ? ' (Renovación)' : ''}${nameSuffix}`,
                    quantity: sig.quantity,
                    unitPrice,
                    total,
                    duration: priceObj ? priceObj.duration_label : '',
                    details: sig.shipping ? `Envío: ${sig.shipping}` : ''
                });
            }
        });

        // 3. Módulos
        selectedModules.forEach(mod => {
            const product = moduleProducts.find(p => p.id === mod.productId);
            if (product) {
                const priceObj = product.prices.find(pr => pr.id === mod.priceId);
                const unitPrice = priceObj ? parseFloat(priceObj.price) : 0;
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
    }, [selectedPlanId, selectedSignatures, selectedModules, emissionPoints, planProducts, signatureProducts, moduleProducts, emissionPointProduct]);

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

        const unit = sigForm.isRenewal
            ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
            : parseFloat(priceObj.price);

        return { base: unit, total: unit * (1 + IVA_RATE) };
    }, [sigForm, signatureProducts]);

    // --- Handlers ---

    const openSignatureModal = () => {
        if (signatureOptions.length > 0) {
            const defaultOpt = signatureOptions[0];
            const defaultPrice = defaultOpt.product.prices?.[0]?.id || "";
            setSigForm({
                productId: defaultOpt.product.id,
                priceId: defaultPrice,
                quantity: 1,
                isRenewal: false,
                shipping: "Retiro en Oficina - $0.00 (IVA Incl.)",
                discount: 0,
                idType: "cedula"
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
        if (item.type === 'PLAN') setSelectedPlanId("");
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
                text += `${item.name} (${item.duration}) x ${item.quantity}: $${item.total.toFixed(2)}(NO INCLUYE IVA)\n`;
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

    return {
        // Estado
        selectedPlanId, setSelectedPlanId,
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
