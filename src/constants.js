/**
 * Constantes globales del sistema Azurapp
 */

// Tasa de IVA (15% Ecuador)
export const IVA_RATE = 0.15;

// Opciones de envío de Token (precios incluyen IVA)
export const TOKEN_SHIPPING_OPTIONS = [
    { label: "Retiro en Oficina", price: 0 },
    { label: "Guayaquil", price: 4.02 },
    { label: "Costa", price: 5.75 },
    { label: "Sierra", price: 6.90 },
    { label: "Oriente", price: 9.20 },
    { label: "Galápagos", price: 16.10 },
];

// Precios de Puntos de Emisión (escalado por volumen)
export const EMISSION_POINT_TIERS = [
    { minQty: 50, price: 1.75 },
    { minQty: 12, price: 2.00 },
    { minQty: 1, price: 2.25 },
];

// Orden de features para comparativa de planes
export const FEATURE_ORDER = [
    "Comprobantes año", "Usuarios", "Puntos de Emisión", "Empresas", "Establecimientos",
    "Inventario", "Proformas", "Soporte Técnico", "Portal Clientes", "SMTP Propio",
    "Compras", "Retenciones", "Guías de Remisión", "Liquidación Compras", "Cuentas por Cobrar",
    "Cuentas por Pagar", "Notas de Débito", "Generación ATS"
];

// Nombres de display para features
export const FEATURE_DISPLAY_NAMES = {
    "Comprobantes año": "Comprobantes al año",
};
