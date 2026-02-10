import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchProductsByChannel } from '../services/pricingService';
import SummaryCard from '../components/SummaryCard';

const CATEGORY_TABS = [
    { id: 'PLAN', label: 'Planes' },
    { id: 'SIGNATURE', label: 'Firmas' },
    { id: 'MODULE', label: 'Módulos' },
];

export default function NewSale() {
    const { canalSeleccionado, setCanalSeleccionado } = useApp();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('PLAN');

    // Selección del usuario
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPriceId, setSelectedPriceId] = useState(null); // Track specific price/duration
    const [quantity, setQuantity] = useState(1);
    const [isRenewal, setIsRenewal] = useState(false); // Para mostrar precio renovación

    // Carrito de compras
    const [cartItems, setCartItems] = useState([]);

    // Cargar productos al iniciar o cambiar canal
    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchProductsByChannel(canalSeleccionado);
            setProducts(data);
            setLoading(false);

            // Recalcular precios del carrito con el nuevo canal
            setCartItems(prevCart => {
                if (prevCart.length === 0) return prevCart;

                return prevCart.map(item => {
                    const product = data.find(p => p.name === item.name);
                    if (!product) return item;

                    const priceObj = product.prices.find(p => p.duration_label === item.duration);

                    if (priceObj) {
                        const newUnitPrice = item.isRenewal
                            ? (parseFloat(priceObj.renewal_price) || parseFloat(priceObj.price))
                            : parseFloat(priceObj.price);

                        return {
                            ...item,
                            unitPrice: newUnitPrice,
                            price: newUnitPrice * item.quantity,
                        };
                    }
                    return item;
                });
            });

            // Resetear selección al cambiar canal
            setSelectedProduct(null);
            setQuantity(1);
            setIsRenewal(false);
        }
        load();
    }, [canalSeleccionado]);

    // Filtrar productos por tab actual
    const filteredProducts = products.filter(p => p.category?.code === activeTab);



    // Calcular precio actual (Preview)
    const currentPriceObj = React.useMemo(() => {
        if (!selectedProduct) return null;
        return selectedProduct.prices.find(p => p.id === selectedPriceId) || selectedProduct.prices[0];
    }, [selectedProduct, selectedPriceId]); // Fix: Added selectedPriceId to dependencies

    const currentUnitPrice = React.useMemo(() => {
        if (!currentPriceObj) return 0;
        return isRenewal
            ? (parseFloat(currentPriceObj.renewal_price) || parseFloat(currentPriceObj.price))
            : parseFloat(currentPriceObj.price);
    }, [currentPriceObj, isRenewal]);

    const addToCart = () => {
        if (!selectedProduct || !currentPriceObj) return;

        const newItem = {
            name: selectedProduct.name,
            desc: `${isRenewal ? 'Renovación' : 'Venta Nueva'} - ${currentPriceObj.duration_label}`,
            price: currentUnitPrice * quantity, // Precio total de este item
            unitPrice: currentUnitPrice,
            quantity: quantity,
            duration: currentPriceObj.duration_label,
            isRenewal: isRenewal
        };

        setCartItems([...cartItems, newItem]);

        // Reset selección parcial pero mantener categoría
        setSelectedProduct(null);
        setSelectedPriceId(null);
        setQuantity(1);
        setIsRenewal(false);
    };

    const removeFromCart = (index) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        setCartItems(newCart);
    };

    const handleCopySummarized = () => {
        if (cartItems.length === 0) return;

        const total = cartItems.reduce((sum, item) => sum + (item.price * 1.15), 0).toFixed(2);
        let text = `Serían los siguientes servicios:\n`;
        cartItems.forEach(item => {
            text += `* ${item.name} ${item.duration}\n`;
        });
        text += `\nTOTAL $${total}+IVA`;

        navigator.clipboard.writeText(text);
        alert('Cotización Resumida copiada al portapapeles');
    };

    const handleCopyDetailed = () => {
        if (cartItems.length === 0) return;

        const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);
        const total = (parseFloat(subtotal) * 1.15).toFixed(2);

        let text = `Serían los siguientes servicios:\n`;
        cartItems.forEach(item => {
            // Determine category label for clarity
            let categoryLabel = "Producto";
            if (item.name.toUpperCase().includes("PLAN")) categoryLabel = "Plan";
            else if (item.name.toUpperCase().includes("FIRMA")) categoryLabel = "Firma";
            else categoryLabel = "Módulo";

            text += `* ${categoryLabel}: ${item.name} (${item.duration}): +iva $${item.price.toFixed(2)}\n`;
        });

        text += `\nTOTAL: $${subtotal}+IVA\n`;
        text += `TOTAL A PAGAR: $${total}`;

        navigator.clipboard.writeText(text);
        alert('Cotización Detallada copiada al portapapeles');
    };

    const handleClearCart = () => {
        if (window.confirm('¿Estás seguro de que deseas limpiar toda la cotización?')) {
            setCartItems([]);
            setSelectedProduct(null);
            setSelectedPriceId(null);
            setQuantity(1);
            setIsRenewal(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans h-[calc(100vh-100px)]">
            <div className="mb-6 flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Nueva Venta</h1>
            </div>
            <div className="grid grid-cols-12 gap-6 h-full">

                {/* 1. SIDEBAR DE NAVEGACIÓN (Col-span-3) */}
                <div className="col-span-12 md:col-span-3 lg:col-span-2 flex flex-col gap-6">
                    {/* Selector de Canal */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Canal de Venta</label>
                        <div className="flex flex-col gap-2">
                            {['AZUR', 'LOCAL', 'WEB'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setCanalSeleccionado(c);
                                        // setCartItems([]); // Ya no borramos, ahora recalculamos
                                    }}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-all ${canalSeleccionado === c
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navegación por Categorías */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Categorías</label>
                        <nav className="space-y-1">
                            {CATEGORY_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSelectedProduct(null);
                                        setSelectedPriceId(null);
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors flex justify-between items-center ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* 2. ÁREA CENTRAL DE CONFIGURACIÓN (Col-span-6) */}
                <div className="col-span-12 md:col-span-9 lg:col-span-7">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full flex flex-col">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">Configurar</span>
                            {CATEGORY_TABS.find(t => t.id === activeTab)?.label}
                        </h2>

                        {/* SELECTOR DE PRODUCTO */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccione Producto</label>
                            {loading ? (
                                <div className="animate-pulse h-12 bg-slate-100 rounded-lg"></div>
                            ) : (
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 transition-all cursor-pointer"
                                    value={selectedProduct?.id || ""}
                                    onChange={(e) => {
                                        const prod = products.find(p => p.id === e.target.value);
                                        setSelectedProduct(prod);
                                        if (prod && prod.prices && prod.prices.length > 0) {
                                            setSelectedPriceId(prod.prices[0].id);
                                        }
                                    }}
                                >
                                    <option value="">-- Seleccione una opción --</option>
                                    {filteredProducts.map(prod => (
                                        <option key={prod.id} value={prod.id}>
                                            {prod.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* FORMULARIO DE CONFIGURACIÓN (Visible solo si hay producto seleccionado) */}
                        {selectedProduct ? (
                            <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">

                                <div className="space-y-8">
                                    {/* Descripción */}
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                        {selectedProduct.description}
                                    </div>

                                    {/* Vigencia */}
                                    {selectedProduct.prices && selectedProduct.prices.length > 1 && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-3 block">Vigencia / Duración</label>
                                            <div className="flex flex-wrap gap-3">
                                                {selectedProduct.prices.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setSelectedPriceId(p.id)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedPriceId === p.id
                                                            ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {p.duration_label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Cantidad */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad</label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-20 p-2 text-center border-b-2 border-slate-300 focus:border-blue-600 outline-none font-bold text-lg"
                                                />
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Renovación */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Venta</label>
                                            <div
                                                onClick={() => setIsRenewal(!isRenewal)}
                                                className={`cursor-pointer p-1 rounded-xl border-2 transition-colors flex items-center gap-3 ${isRenewal ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${isRenewal ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${isRenewal ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {isRenewal ? 'Precio Renovación' : 'Venta Nueva'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER: PRECIO Y BOTÓN */}
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="text-slate-500 text-sm">
                                            Precio Unitario: <span className="font-semibold text-slate-800">${currentUnitPrice.toFixed(2)}</span>
                                            <br />
                                            <span className="text-xs text-slate-400">Canal: {canalSeleccionado}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-400 uppercase">Total Item</div>
                                            <div className="text-3xl font-bold text-slate-900 tracking-tight">
                                                ${(currentUnitPrice * quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={addToCart}
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Agregar a Cotización
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">👈</span>
                                </div>
                                <p className="text-lg">Selecciona un producto arriba para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RESUMEN CARRITO (Col-span-3) */}
                <div className="col-span-12 md:col-span-12 lg:col-span-3">
                    <div className="sticky top-6 h-fit">
                        <SummaryCard
                            items={cartItems}
                            onRemove={removeFromCart}
                            onCopySummarized={handleCopySummarized}
                            onCopyDetailed={handleCopyDetailed}
                            onClear={handleClearCart}
                        />
                        {cartItems.length === 0 && (
                            <div className="mt-4 p-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 flex gap-2">
                                <span className="text-xl">💡</span>
                                <p>Agrega planes, firmas o módulos. Tu cotización se irá armando aquí.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
