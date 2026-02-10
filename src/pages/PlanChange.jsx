import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Copy, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchProductsByChannel } from '../services/pricingService';

// --- DATA ---
const IVA_RATE = 0.15;

const FEATURE_ORDER = [
    "Comprobantes año", "Usuarios", "Puntos de Emisión", "Empresas", "Establecimientos",
    "Inventario", "Proformas", "Soporte Técnico", "Portal Clientes", "SMTP Propio",
    "Compras", "Retenciones", "Guías de Remisión", "Liquidación Compras", "Cuentas por Cobrar",
    "Cuentas por Pagar", "Notas de Débito", "Generación ATS"
];

const FEATURE_DISPLAY_NAMES = {
    "Comprobantes año": "Comprobantes al año",
};

// Helper Functions
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

export default function PlanChange() {
    const { canalSeleccionado } = useApp();

    // Data State
    const [plansData, setPlansData] = useState({});
    const [loading, setLoading] = useState(true);

    // UI State
    const [currentPlanName, setCurrentPlanName] = useState('');
    const [newPlanName, setNewPlanName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().split('T')[0];
    });
    const [ranOut, setRanOut] = useState(false);
    const [copyNotification, setCopyNotification] = useState('');

    // Fetch Data
    useEffect(() => {
        async function loadPlans() {
            setLoading(true);
            try {
                const products = await fetchProductsByChannel(canalSeleccionado);
                const plans = products.filter(p =>
                    p.category?.code === 'PLAN' &&
                    !['PLAN ESENCIAL', 'PLAN TRANSICIÓN', 'PLAN CONTABLE', 'PLAN CONTABLE PRO'].includes(p.name)
                );

                // Transform to map structure needed by component: { "PLAN NAME": { price: X, features: {} } }
                const plansMap = {};
                plans.forEach(p => {
                    // Assuming price[0] is the 1 YEAR default price or use logic to find '1 AÑO'
                    const defaultPrice = p.prices.find(pr => pr.duration_label === '1 AÑO')?.price || p.prices[0]?.price || 0;
                    plansMap[p.name] = {
                        price: defaultPrice,
                        features: p.features || {}
                    };
                });

                setPlansData(plansMap);

                // Initialize selection if empty or invalid
                const names = Object.keys(plansMap);
                if (names.length > 0) {
                    if (!names.includes(currentPlanName)) setCurrentPlanName(names[0]);
                    if (!names.includes(newPlanName)) setNewPlanName(names[1] || names[0]);
                }
            } catch (err) {
                console.error("Error loading plans:", err);
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canalSeleccionado]);

    const planNames = Object.keys(plansData);

    // Update endDate when startDate changes
    useEffect(() => {
        if (startDate) {
            const d = new Date(startDate);
            d.setFullYear(d.getFullYear() + 1);
            setEndDate(d.toISOString().split('T')[0]);
        }
    }, [startDate]);


    // Logic
    const calculation = useMemo(() => {
        // If data is not loaded yet
        if (!plansData[currentPlanName] || !plansData[newPlanName]) return {};

        const currentPlan = plansData[currentPlanName];
        const newPlan = plansData[newPlanName];

        // Dates match logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endD = new Date(endDate);
        endD.setHours(0, 0, 0, 0);
        const startD = new Date(startDate);
        startD.setHours(0, 0, 0, 0);

        const isDowngrade = newPlan.price < currentPlan.price;
        const isContractActive = today < endD;
        const isValidDates = endD > startD;

        if (!isValidDates) {
            return { error: "La fecha de finalización debe ser posterior a la de inicio." };
        }

        if (isDowngrade && isContractActive) {
            return { error: "DOWNGRADE_NOT_ALLOWED", isDowngrade: true, isContractActive: true };
        }

        const credit = currentPlan.price;
        const newPlanPrice = newPlan.price;
        const difference = roundToTwo(newPlanPrice - credit);
        const baseImponible = Math.max(0, difference);
        const iva = roundToTwo(baseImponible * IVA_RATE);
        const totalAPagar = roundToTwo(baseImponible + iva);
        const saldoAFavor = Math.abs(roundToTwo(Math.min(0, difference)));

        return {
            credit,
            newPlanPrice,
            difference,
            baseImponible,
            iva,
            totalAPagar,
            saldoAFavor,
            isDowngrade,
            isContractActive
        };
    }, [currentPlanName, newPlanName, startDate, endDate, plansData]);

    // Message Generation
    const generatedMessage = useMemo(() => {
        if (calculation.error && calculation.error !== "DOWNGRADE_NOT_ALLOWED") return "";
        if (!plansData[currentPlanName] || !plansData[newPlanName]) return "";

        const currentPlan = plansData[currentPlanName];
        const newPlan = plansData[newPlanName];

        if (ranOut && !calculation.isDowngrade) {
            // ... Logic for Ran Out ...
            const today = new Date();
            const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1));
            const todayStr = formatDate(today);
            const nextYearStr = formatDate(nextYear);

            const originalStartDate = new Date(startDate);
            const originalEndDate = new Date(endDate);
            const originalStartDateStr = formatDate(originalStartDate);
            const originalEndDateStr = formatDate(originalEndDate);

            const newPlanPrice = newPlan.price;
            const newPlanPriceWithIva = formatCurrency(newPlanPrice * (1 + IVA_RATE));
            const newPlanComprobantes = newPlan.features['Comprobantes año'];
            const option1Text = `OPCIÓN 1: Contratar un ${newPlanName} (${newPlanComprobantes} comprobantes anuales) que empiece desde el día de hoy ${todayStr} y le caduque el ${nextYearStr}. Tendría que pagar ${formatCurrency(newPlanPrice)} + IVA (${newPlanPriceWithIva} final).`;

            const totalAPagarFormatted = formatCurrency(calculation.totalAPagar);
            const baseImponibleFormatted = formatCurrency(calculation.baseImponible);

            const oldComprobantes = parseInt(currentPlan.features['Comprobantes año']);
            const newComprobantes = parseInt(newPlan.features['Comprobantes año']);
            let diffComprobantesText = '';
            if (!isNaN(oldComprobantes) && !isNaN(newComprobantes)) {
                const diff = newComprobantes - oldComprobantes;
                diffComprobantesText = ` y se le acreditarían la diferencia de comprobantes (${diff} comprobantes adicionales)`;
            } else if (!isNaN(oldComprobantes) && (String(newPlan.features['Comprobantes año']).includes("∞") || String(newPlan.features['Comprobantes año']).includes("Ilimitado"))) {
                diffComprobantesText = ` y ahora tendría comprobantes ilimitados`;
            }

            const option2Text = `OPCIÓN 2: Cambiarse del ${currentPlanName} que tiene actualmente al ${newPlanName}. De elegir esta opción, cancelaría la diferencia que son ${baseImponibleFormatted} + IVA (${totalAPagarFormatted} final)${diffComprobantesText}. La vigencia de su plan se mantiene desde ${originalStartDateStr} hasta el ${originalEndDateStr}.`;

            return `Un cliente que agota sus comprobantes tiene dos opciones:\n\n${option1Text}\n\n${option2Text}`;
        }

        // Normal Logic
        let financialSummary = "";
        let vigenciaText = "";

        if (calculation.isDowngrade && calculation.isContractActive) {
            financialSummary = "El downgrade de plan solo es posible al momento de la renovación del servicio.";
        } else {
            const originalStartDate = new Date(startDate);
            const originalEndDate = new Date(endDate);

            if (calculation.isContractActive && !calculation.isDowngrade) {
                vigenciaText = `La vigencia de su plan sera desde ${formatDate(originalStartDate)} hasta el ${formatDate(originalEndDate)}.`;
            } else {
                const today = new Date();
                const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1));
                vigenciaText = `La vigencia de su plan sera desde ${formatDate(today)} hasta el ${formatDate(nextYear)}.`;
            }

            if (calculation.difference > 0) {
                financialSummary = `Para realizar el cambio de plan a ${newPlanName}, el valor a cancelar es de ${formatCurrency(calculation.totalAPagar)} (IVA incluido).\n${vigenciaText}`;
            } else if (calculation.saldoAFavor > 0) {
                financialSummary = `Al cambiar al plan ${newPlanName}, se genera un saldo a favor de ${formatCurrency(calculation.saldoAFavor)}.\n${vigenciaText}`;
            } else {
                const newPlanPriceWithIva = formatCurrency(newPlan.price * (1 + IVA_RATE));
                financialSummary = `El cambio al plan ${newPlanName} tiene un costo anual de ${newPlanPriceWithIva} (IVA incluido).\n${vigenciaText}`;
            }
        }

        let message = financialSummary;

        // Feature Diff
        const gains = [];
        const losses = [];
        const currentFeatures = currentPlan.features;
        const newFeatures = newPlan.features;

        FEATURE_ORDER.forEach(feature => {
            const oldValue = currentFeatures[feature];
            const newValue = newFeatures[feature];

            const displayName = FEATURE_DISPLAY_NAMES[feature] || feature;

            if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;

            if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
                const normOld = oldValue === undefined ? false : oldValue;
                const normNew = newValue === undefined ? false : newValue;

                if (normOld === false && normNew === true) gains.push(`✅ Ahora incluye: ${displayName}`);
                else if (normOld === true && normNew === false) losses.push(`❌ Ya no incluye: ${displayName}`);
                return;
            }

            const oldValNum = parseInt(oldValue);
            const newValNum = parseInt(newValue);
            const oldIsNumeric = !isNaN(oldValNum);
            const newIsNumeric = !isNaN(newValNum);
            const oldIsUnlimited = String(oldValue).includes("Ilimitado") || String(oldValue).includes("∞");
            const newIsUnlimited = String(newValue).includes("Ilimitado") || String(newValue).includes("∞");

            if (oldIsNumeric && newIsNumeric) {
                const diff = newValNum - oldValNum;
                if (diff > 0) {
                    gains.push(`✅ ${diff.toLocaleString('es-EC')} ${displayName} más (ahora tendrá ${newValNum.toLocaleString('es-EC')})`);
                } else if (diff < 0) {
                    losses.push(`❌ ${Math.abs(diff).toLocaleString('es-EC')} ${displayName} menos (ahora tendrá ${newValNum.toLocaleString('es-EC')} en lugar de ${oldValNum.toLocaleString('es-EC')})`);
                }
            } else if ((oldIsUnlimited || !oldIsNumeric) && newIsNumeric) {
                losses.push(`❌ Ya no tendrá ${displayName} ${String(oldValue)} (ahora tendrá ${newValNum.toLocaleString('es-EC')})`);
            } else if (oldIsNumeric && (newIsUnlimited || !newIsNumeric)) {
                gains.push(`✅ Ahora tendrá ${displayName} ${String(newValue)} (antes tenía ${oldValNum.toLocaleString('es-EC')})`);
            } else { // both are strings
                if (oldValue !== newValue) {
                    gains.push(`✅ ${displayName} cambia de ${oldValue} a ${newValue}`);
                }
            }
        });

        if (gains.length > 0) {
            message += "\n\nCon este cambio, obtendrá los siguientes beneficios:\n";
            message += gains.join('\n');
        }

        if (losses.length > 0) {
            message += "\n\nYa no contará con las siguientes características:\n";
            message += losses.join('\n');
        }

        return message.trim();

    }, [calculation, ranOut, currentPlanName, newPlanName, startDate, endDate, plansData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopyNotification('¡Mensaje copiado!');
        setTimeout(() => setCopyNotification(''), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Calculadora de Cambio de Plan</h1>
                <div className="mt-2 text-slate-500">
                    Canal: <span className="font-semibold text-blue-600">{canalSeleccionado}</span> (Precios base mostrados)
                </div>
            </header>

            {loading ? (
                <div className="py-12 text-center text-slate-400">Cargando planes del canal {canalSeleccionado}...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Panel de Configuración */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700 mb-4">1. Plan Actual del Cliente</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Seleccionar Plan Actual</label>
                                        <select
                                            value={currentPlanName}
                                            onChange={(e) => setCurrentPlanName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none"
                                        >
                                            {planNames.map(name => (
                                                <option key={name} value={name}>{name} ({formatCurrency(plansData[name].price)}/Año)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Inicio Vigencia</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Fin Vigencia</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-slate-700 mb-4">2. Nuevo Plan Deseado</h2>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Seleccionar Nuevo Plan</label>
                                    <select
                                        value={newPlanName}
                                        onChange={(e) => setNewPlanName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none"
                                    >
                                        {planNames.map(name => (
                                            <option key={name} value={name}>{name} ({formatCurrency(plansData[name].price)}/Año)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        id="ranOut"
                                        checked={ranOut}
                                        onChange={(e) => setRanOut(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="ranOut" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        ¿Cliente agotó sus comprobantes?
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Resultados */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
                            <h2 className="text-xl font-semibold text-slate-700 mb-6">3. Resumen del Cambio</h2>

                            {calculation.error && calculation.error !== "DOWNGRADE_NOT_ALLOWED" ? (
                                <div className="text-red-500 text-center py-4">{calculation.error}</div>
                            ) : calculation.error === "DOWNGRADE_NOT_ALLOWED" ? (
                                <div className="text-center py-8">
                                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                    <h3 className="font-semibold text-lg text-amber-700">Acción no permitida</h3>
                                    <p className="text-slate-600 mt-2">No se puede realizar un downgrade (bajar de plan) mientras la vigencia actual esté activa.</p>
                                    <p className="text-sm text-slate-500 mt-1">Esta acción solo es posible al momento de la renovación.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Valor del plan actual:</span>
                                        <span className="font-medium text-slate-900">{formatCurrency(plansData[currentPlanName].price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                        <span className="font-semibold text-green-600">Crédito a favor:</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(calculation.credit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-700">Costo del nuevo plan anual:</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(calculation.newPlanPrice)}</span>
                                    </div>

                                    {calculation.difference > 0 ? (
                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <div className="space-y-2 text-right text-slate-600 mb-4">
                                                <div className="flex justify-between items-center"><p>Base Imponible:</p> <p class="font-medium">{formatCurrency(calculation.baseImponible)}</p></div>
                                                <div className="flex justify-between items-center"><p>IVA (15%):</p> <p class="font-medium">{formatCurrency(calculation.iva)}</p></div>
                                            </div>
                                            <div className="bg-blue-600 text-white p-6 rounded-xl flex justify-between items-center shadow-lg transform transition hover:scale-[1.01]">
                                                <span className="text-xl font-bold">TOTAL A PAGAR:</span>
                                                <span className="text-3xl font-extrabold">{formatCurrency(calculation.totalAPagar)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-8">
                                            <div className="bg-green-600 text-white p-6 rounded-xl flex justify-between items-center shadow-lg">
                                                <span className="text-xl font-bold">SALDO A FAVOR:</span>
                                                <span className="text-3xl font-extrabold">{formatCurrency(calculation.saldoAFavor)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-3 text-center">Este saldo puede ser utilizado en futuras renovaciones o compras.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Mensaje */}
                    {generatedMessage && (
                        <div className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Mensaje para Cliente</h2>
                                <span className={`text-green-600 font-semibold text-sm transition-opacity duration-300 ${copyNotification ? 'opacity-100' : 'opacity-0'}`}>
                                    {copyNotification}
                                </span>
                            </div>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={generatedMessage}
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 h-64 resize-y shadow-inner"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-4 right-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 border border-blue-200"
                                >
                                    <Copy className="w-4 h-4" /> Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tabla Comparativa */}
                    {!calculation.error && (
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 overflow-hidden">
                            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Comparativa de Planes</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max text-left border-collapse">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b-2 border-slate-100">
                                            <th className="p-4 text-slate-500 font-semibold w-1/3">Característica</th>
                                            <th className="p-4 text-blue-600 font-bold text-center w-1/3">{currentPlanName}</th>
                                            <th className="p-4 text-green-600 font-bold text-center w-1/3">{newPlanName}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {FEATURE_ORDER.map(feature => {
                                            const currentVal = plansData[currentPlanName]?.features?.[feature];
                                            const newVal = plansData[newPlanName]?.features?.[feature];
                                            const displayName = FEATURE_DISPLAY_NAMES[feature] || feature;

                                            // Normalización para comparación
                                            const normCurrent = currentVal === undefined ? false : currentVal;
                                            const normNew = newVal === undefined ? false : newVal;

                                            const isDiff = JSON.stringify(normCurrent) !== JSON.stringify(normNew);

                                            const renderVal = (v) => {
                                                if (v === true) return <Check className="w-6 h-6 mx-auto text-green-500" />;
                                                if (v === false) return <X className="w-6 h-6 mx-auto text-red-300" />;
                                                if (v === 'N/A') return <span className="text-slate-400 italic">N/A</span>;
                                                return <span className="font-semibold text-slate-700">{v}</span>;
                                            };

                                            return (
                                                <tr key={feature} className={`hover:bg-slate-50 transition-colors ${isDiff ? 'bg-blue-50/40' : ''}`}>
                                                    <td className="p-4 text-slate-600 font-medium">{displayName}</td>
                                                    <td className="p-4 text-center border-l border-slate-100">{renderVal(normCurrent)}</td>
                                                    <td className="p-4 text-center border-l border-slate-100">{renderVal(normNew)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
