/**
 * Funciones utilitarias de formateo — Azurapp
 */

/**
 * Formatea un número como moneda USD.
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Ej: "$100.00"
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Redondea un número a 2 decimales (seguro contra floating point).
 * @param {number} num
 * @returns {number}
 */
export function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formatea una fecha como DD/MM/YYYY (UTC).
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
    if (!date) return '';
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
