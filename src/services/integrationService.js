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
export async function calculateIntegrationQuote(type, quantity) {
    // 1. Buscar precio del paquete variable
    const { data: pkg, error } = await supabase
        .from('integration_packages')
        .select('*')
        .eq('type', type)
        .eq('quantity', quantity)
        .single();

    if (error || !pkg) {
        console.error("Paquete no encontrado", error);
        return null;
    }

    // 2. Cálculo Financiero
    const additionalPrice = parseFloat(pkg.price);
    const subtotal = BASE_CONFIG.price + additionalPrice;
    const ivaAmount = subtotal * IVA_RATE;
    const total = subtotal + ivaAmount;

    // 3. Cálculo de Capacidad
    const totalDocs = BASE_CONFIG.docs + pkg.quantity;

    // 4. Retorno Estructurado
    return {
        summary: {
            plan_name: `Integración ${type} (${totalDocs.toLocaleString()} Docs)`,
            total_docs: totalDocs,
            subtotal: subtotal.toFixed(2),
            iva: ivaAmount.toFixed(2),
            total: total.toFixed(2)
        },
        breakdown: [
            {
                item: "Plan Base (Obligatorio)",
                desc: "Incluye 2,000 comprobantes anuales",
                price: BASE_CONFIG.price.toFixed(2)
            },
            {
                item: `Paquete Adicional ${type}`,
                desc: `${pkg.quantity.toLocaleString()} comprobantes extra`,
                price: additionalPrice.toFixed(2)
            }
        ]
    };
}
