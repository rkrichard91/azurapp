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
                const priceA = a.prices && a.prices.length > 0 ? a.prices[0].price : 0;
                const priceB = b.prices && b.prices.length > 0 ? b.prices[0].price : 0;
                return priceA - priceB;
            });
    }, [products]);
    const signatureProducts = useMemo(() => products.filter(p => p.category?.code === 'SIGNATURE'), [products]);
    const moduleProducts = useMemo(() => products.filter(p => p.category?.code === 'MODULE'), [products]);
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
