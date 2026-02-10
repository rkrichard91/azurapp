import { supabase } from './supabaseClient';

// Regla de Negocio: Valores Base
const BASE_CONFIG = {
    price: 100.00,
    docs: 2000,
    name: "Plan Base Integración"
};
const IVA_RATE = 0.15;

/**
 * Calcula cotización acumulativa
 * @param {string} type - 'API' | 'WEB'
 * @param {number} quantity - Cantidad seleccionada (ej: 10000)
 */
const UNLIMITED_PRICING = [
    { qty: 500, price: 10 },
    { qty: 1000, price: 20 },
    { qty: 5000, price: 59 },
    { qty: 10000, price: 118 },
    { qty: 20000, price: 236 },
    { qty: 30000, price: 354 },
    { qty: 40000, price: 472 },
    { qty: 50000, price: 590 },
    { qty: 100000, price: 1180 },
    { qty: 150000, price: 1770 },
    { qty: 180000, price: 2124 },
    { qty: 200000, price: 2360 },
    { qty: 300000, price: 3000 },
    { qty: 500000, price: 5000 }
];

const ACCOUNTING_PRICING = [
    { qty: 125, price: 2.5 },
    { qty: 250, price: 5 },
    { qty: 500, price: 10 },
    { qty: 1000, price: 11.8 },
    { qty: 1500, price: 17.7 },
    { qty: 2000, price: 23.6 },
    { qty: 2500, price: 29.5 },
    { qty: 3000, price: 35.4 },
    { qty: 5000, price: 59 },
    { qty: 10000, price: 118 },
    { qty: 20000, price: 236 },
    { qty: 30000, price: 300 },
    { qty: 50000, price: 500 }
];

/**
 * Calcula cotización acumulativa
 * @param {string} type - 'API' | 'WEB' | 'UNLIMITED' | 'ACCOUNTING'
 * @param {number} quantity - Cantidad seleccionada
 * @param {string} cycle - 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' (Solo para ACCOUNTING)
 */
export async function calculateIntegrationQuote(type, quantity, cycle = 'ANNUAL') {
    let basePrice = 0;
    let baseDocs = 0;
    let additionalPrice = 0;
    let additionalDocs = 0;
    let planName = "";
    let breakdown = [];

    if (type === 'UNLIMITED') {
        basePrice = 150.00;
        baseDocs = 15000;
        planName = "Plan Ilimitado (Reseller)";

        const tier = UNLIMITED_PRICING.find(p => p.qty === quantity);
        additionalPrice = tier ? tier.price : 0;
        if (additionalPrice > 0) additionalDocs = quantity;

        breakdown.push({
            item: "Plan Base Ilimitado",
            desc: "Incluye 15,000 comprobantes anuales",
            price: basePrice.toFixed(2)
        });

        if (additionalPrice > 0) {
            breakdown.push({
                item: "Paquete Adicional",
                desc: `${quantity.toLocaleString()} comprobantes extra`,
                price: additionalPrice.toFixed(2)
            });
        }

    } else if (type === 'ACCOUNTING') {
        const baseMonthly = 25.00;
        const baseDocsMonthly = 1250;
        planName = "Plan Contable";

        const tier = ACCOUNTING_PRICING.find(p => p.qty === quantity);
        const addMonthly = tier ? tier.price : 0;

        // Multiplicador de ciclo
        let multiplier = 1;
        let cycleName = "Mensual";
        if (cycle === 'QUARTERLY') { multiplier = 3; cycleName = "Trimestral"; }
        if (cycle === 'SEMIANNUAL') { multiplier = 6; cycleName = "Semestral"; }
        if (cycle === 'ANNUAL') { multiplier = 12; cycleName = "Anual"; }

        basePrice = baseMonthly * multiplier;
        additionalPrice = addMonthly * multiplier;

        baseDocs = baseDocsMonthly * multiplier;
        additionalDocs = (quantity || 0) * multiplier;

        breakdown.push({
            item: `Plan Base (${cycleName})`,
            desc: `${baseDocsMonthly.toLocaleString()} docs/mes x ${multiplier} meses`,
            price: basePrice.toFixed(2)
        });

        if (additionalPrice > 0) {
            breakdown.push({
                item: `Adicional (${cycleName})`,
                desc: `${quantity.toLocaleString()} docs extra/mes`,
                price: additionalPrice.toFixed(2)
            });
        }

    } else {
        // Lógica Original (API / WEB)
        const { data: pkg, error } = await supabase
            .from('integration_packages')
            .select('*')
            .eq('type', type)
            .eq('quantity', quantity)
            .single();

        if (error || !pkg) return null;

        basePrice = BASE_CONFIG.price;
        baseDocs = BASE_CONFIG.docs;
        additionalPrice = parseFloat(pkg.price);
        additionalDocs = pkg.quantity;
        planName = `Integración ${type}`;

        breakdown.push(
            {
                item: "Plan Base (Obligatorio)",
                desc: "Incluye 2,000 comprobantes anuales",
                price: basePrice.toFixed(2)
            },
            {
                item: `Paquete Adicional ${type}`,
                desc: `${pkg.quantity.toLocaleString()} comprobantes extra`,
                price: additionalPrice.toFixed(2)
            }
        );
    }

    // Cálculo Final
    const subtotal = basePrice + additionalPrice;
    const ivaAmount = subtotal * IVA_RATE;
    const total = subtotal + ivaAmount;
    const totalDocs = baseDocs + additionalDocs;

    return {
        summary: {
            plan_name: planName,
            base_docs: baseDocs,
            additional_docs: additionalDocs,
            total_docs: totalDocs,
            subtotal: subtotal.toFixed(2),
            iva: ivaAmount.toFixed(2),
            total: total.toFixed(2),
            cycle: type === 'ACCOUNTING' ? cycle : 'ANNUAL'
        },
        breakdown
    };
}
