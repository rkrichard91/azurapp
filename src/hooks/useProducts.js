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
    const planProducts = useMemo(() => products.filter(p => p.category?.code === 'PLAN'), [products]);
    const signatureProducts = useMemo(() => products.filter(p => p.category?.code === 'SIGNATURE'), [products]);
    const moduleProducts = useMemo(() => products.filter(p => p.category?.code === 'MODULE'), [products]);
    const emissionPointProduct = useMemo(() => products.find(p => p.name === 'Establecimiento Adicional' || p.name === 'Punto de venta'), [products]);

    // Opciones de firma mapeadas
    const signatureOptions = useMemo(() => {
        const mapping = [
            { label: "Firma P. Natural (Cédula)", dbName: "Firma P. Natural (Cédula)" },
            { label: "Firma P. Jurídica (RUC)", dbName: "Firma P. Jurídica (Empresa)" },
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
