import { useState, useEffect, useMemo } from 'react';
import { fetchProductsByChannel } from '../services/pricingService';

/**
 * Hook para cargar y categorizar productos desde Supabase por canal.
 * Retorna los productos categorizados listos para usar.
 */
export function useProducts(canalSeleccionado) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchProductsByChannel(canalSeleccionado);
            setProducts(data);
            setLoading(false);
        }
        load();
    }, [canalSeleccionado]);

    // Productos categorizados
    const planProducts = useMemo(() => {
        return products
            .filter(p => p.category?.code === 'PLAN')
            .sort((a, b) => {
                const isContableA = a.name.toUpperCase().includes('CONTABLE');
                const isContableB = b.name.toUpperCase().includes('CONTABLE');

                // Los planes contables van al final, después de los planes ilimitados
                if (isContableA !== isContableB) {
                    return isContableA ? 1 : -1;
                }

                // Obtener precio base para ordenamiento (preferir precio a 1 AÑO o el primer precio disponible)
                const getBasePrice = (p) => {
                    const price1Yr = p.prices?.find(pr => pr.duration_label === '1 AÑO')?.price;
                    if (price1Yr !== undefined) return price1Yr;
                    return p.prices && p.prices.length > 0 ? p.prices[0].price : 0;
                };

                return getBasePrice(a) - getBasePrice(b);
            });
    }, [products]);
    const signatureProducts = useMemo(() => products.filter(p => p.category?.code === 'SIGNATURE'), [products]);
    const moduleProducts = useMemo(() => {
        const raw = products.filter(p => p.category?.code === 'MODULE');
        const orderMap = {
            'Usuario Adicional (Planes Estándar)': 1,
            'Usuario adicional (Anual)': 1,
            'Usuario Adicional (Planes Ilimitados)': 2,
            'Usuario Adicional (Plan Contable)': 3,
            'Empleado Adicional (Plan Contable)': 4,
            'Establecimiento Adicional (Plan Contable)': 5,
            'Establecimiento Adicional': 6,
            'Empresa adicional': 7,
            'Punto de venta': 8,
            'Soporte Técnico': 9,
            'Generación de ATS': 10,
            'Compras con ATS': 11,
            'Compras sin ATS': 12,
            'Módulo Documentos Recibidos': 13,
            'Factura Recurrente': 14,
        };

        return raw.sort((a, b) => {
            const orderA = orderMap[a.name] ?? 99;
            const orderB = orderMap[b.name] ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
        });
    }, [products]);
    const emissionPointProduct = useMemo(() => products.find(p => p.name === 'Establecimiento Adicional' || p.name === 'Punto de venta'), [products]);

    // Opciones de firma mapeadas
    const signatureOptions = useMemo(() => {
        const mapping = [
            { label: "Firma P. Natural", dbName: "Firma P. Natural (Cédula)" },
            { label: "Firma P. Jurídica", dbName: "Firma P. Jurídica (Empresa)" },
            { label: "Firma en Token (Persona Natural)", dbName: "Firma en Token (Persona Natural)" },
            { label: "Firma Token (Persona Jurídica)", dbName: "Firma Token (Persona Jurídica)" }
        ];

        return mapping.map(opt => {
            const product = signatureProducts.find(p => p.name === opt.dbName);
            return { label: opt.label, product };
        }).filter(opt => opt.product);
    }, [signatureProducts]);

    return {
        products,
        loading,
        planProducts,
        signatureProducts,
        moduleProducts,
        emissionPointProduct,
        signatureOptions,
    };
}
