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

// Constante de precio base Módulo Médico (incluye 1 doctor)
export const MEDICAL_BASE_PRICE = 150;

// Obtener precio unitario por doctor según el rango total:
// 1 doctor (base): $150.00 (incluye 1 doctor)
// 2 a 5 doctores: $80.00 c/u adicional
// 6 a 15 doctores: $55.00 c/u adicional
// 16 en adelante: $40.00 c/u adicional
export function getMedicalDoctorUnitPrice(numDoctors = 1) {
    const qty = Math.max(1, parseInt(numDoctors) || 1);
    if (qty >= 16) return 40;
    if (qty >= 6) return 55;
    if (qty >= 2) return 80;
    return MEDICAL_BASE_PRICE;
}

// Cálculo del total Módulo Médico: Plan Base ($150 incluye 1 doctor) + doctores adicionales * precio del rango
export function calculateMedicalModuleCost(numDoctors = 1) {
    const qty = Math.max(1, parseInt(numDoctors) || 1);
    if (qty <= 1) return MEDICAL_BASE_PRICE;
    const additionalPrice = getMedicalDoctorUnitPrice(qty);
    return MEDICAL_BASE_PRICE + (qty - 1) * additionalPrice;
}



// Orden de features para comparativa de planes (basado en la matriz oficial de características)
export const FEATURE_ORDER = [
    "Comprobantes año",
    "Comprobantes mes",
    "Límite API REST",
    "Usuarios",
    "Empresas",
    "Establecimientos",
    "Puntos de Emisión",
    "Empleados (Nómina)",
    "Facturas",
    "Retenciones",
    "Notas de crédito",
    "Notas de débito",
    "Guías de remisión",
    "Liquidación compras",
    "Proformas",
    "Inventario",
    "Compras",
    "Contabilidad Automática",
    "Estados Financieros",
    "Bancos y Cartera",
    "Nómina",
    "Reportes",
    "Cuentas por cobrar",
    "Cuentas por pagar",
    "ATS",
    "SMTP propio",
    "API REST",
    "Portal documentación",
    "Soporte"
];

// Nombres de display para features
export const FEATURE_DISPLAY_NAMES = {
    "Comprobantes año": "Comprobantes al año",
    "Comprobantes mes": "Comprobantes al mes",
    "Límite API REST": "Límite API REST (anual)",
    "Puntos de Emisión": "Puntos de emisión",
    "Empleados (Nómina)": "Empleados en nómina",
    "Guías de remisión": "Guías de remisión",
    "Liquidación compras": "Liquidaciones de compra",
    "Cuentas por cobrar": "Cuentas por cobrar",
    "Cuentas por pagar": "Cuentas por pagar",
    "Contabilidad Automática": "Contabilidad automática",
    "Estados Financieros": "Estados financieros completos",
    "Bancos y Cartera": "Bancos y Cartera (CxC / CxP)",
    "Nómina": "Módulo de nómina (rol de pagos)",
    "ATS": "Generación de ATS",
    "SMTP propio": "Correo SMTP propio",
    "API REST": "API REST",
    "Portal documentación": "Portal de comprobantes (clientes)",
    "Soporte": "Soporte técnico"
};

