import React, { useState, useEffect } from 'react';
import { X, Save, Search, Loader2 } from 'lucide-react';
import { salesService } from '../../services/salesService';
import { useApp } from '../../context/AppContext';

export default function SaleRegistrationModal({ isOpen, onClose, cartItems, total, planAmount, signatureAmount, moduleAmount, initialData, isManual, description }) {
    const { canalSeleccionado } = useApp();

    const [formData, setFormData] = useState({
        client_ruc: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        product_category: '',
        sale_type: 'NUEVA',
        status: 'EN GESTIÓN',
        description: '',
        next_contact_date: '',
        total_amount: 0,
        origin: '',
        management_type: 'N/A'
    });
    
    const [isSearchingSRI, setIsSearchingSRI] = useState(false);

    // Cargar datos iniciales cuando se abre el modal
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                client_ruc: initialData?.client_ruc || '',
                client_name: initialData?.client_name || '',
                client_phone: initialData?.client_phone || '',
                client_email: initialData?.client_email || '',
                product_category: initialData?.product_details?.category || '',
                sale_type: initialData?.sale_type || 'NUEVA',
                status: initialData?.status || 'EN GESTIÓN',
                description: initialData?.description || description || '',
                next_contact_date: initialData?.next_contact_date || '',
                total_amount: initialData?.total_amount || total || 0,
                origin: initialData?.origin || '',
                management_type: initialData?.management_type || 'N/A'
            });
            setError(null);
        }
    }, [isOpen, initialData, total, description]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!formData.client_ruc.trim() && !formData.client_name.trim() && !formData.client_phone.trim()) {
            setError("Debe ingresar al menos uno: RUC/Cédula, Razón Social o Teléfono.");
            return;
        }

        setSaving(true);
        try {
            const finalContactDate = (formData.status === 'EN GESTIÓN' && formData.next_contact_date) 
                ? formData.next_contact_date 
                : null;

            if (initialData && initialData.id) {
                // UPDATE MODE
                const saleData = {
                    ...formData,
                    next_contact_date: finalContactDate,
                    channel: initialData.channel || canalSeleccionado,
                    total_amount: parseFloat(formData.total_amount) || initialData.total_amount || 0,
                    plan_amount: initialData.plan_amount ?? 0,
                    signature_amount: initialData.signature_amount ?? 0,
                    module_amount: initialData.module_amount ?? 0,
                    product_details: { ...(initialData.product_details || {}), category: formData.product_category }
                };
                await salesService.updateSale(initialData.id, saleData);
                alert("Venta actualizada exitosamente!");
            } else if (isManual || !cartItems || cartItems.length === 0) {
                // MANUAL / EMPTY CART MODE
                const saleData = {
                    ...formData,
                    next_contact_date: finalContactDate,
                    channel: canalSeleccionado,
                    total_amount: parseFloat(formData.total_amount) || 0,
                    plan_amount: 0,
                    signature_amount: 0,
                    module_amount: 0,
                    product_details: { category: formData.product_category }
                };
                await salesService.createSale(saleData);
                alert("Venta registrada exitosamente!");
            } else {
                // AUTOMATIC CART MODE - SPLIT ITEMS
                const promises = cartItems.map(item => {
                    let desc = `${item.quantity}x ${item.name} (${item.duration})`;
                    if (item.details) desc += ` - ${item.details}`;
                    if (formData.description && formData.description.trim() !== '') {
                        desc += ` | Nota: ${formData.description}`;
                    }

                    const itemData = {
                        ...formData,
                        description: desc,
                        next_contact_date: finalContactDate,
                        channel: canalSeleccionado,
                        total_amount: item.total,
                        plan_amount: item.type === 'PLAN' ? item.total : 0,
                        signature_amount: item.type === 'SIGNATURE' ? item.total : 0,
                        module_amount: ['MODULE', 'EXTRA'].includes(item.type) ? item.total : 0,
                        product_details: [item],
                        management_type: item.type === 'SIGNATURE' ? (item.gestion || 'Gestión Vendedor') : 'N/A'
                    };
                    return salesService.createSale(itemData);
                });
                
                await Promise.all(promises);
                alert("Ventas registradas exitosamente de manera individual!");
            }
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message || 'Error al guardar la venta');
        } finally {
            setSaving(false);
        }
    };

    const handleSearchSRI = async () => {
        if (!formData.client_ruc || formData.client_ruc.trim() === '') return;
        
        setIsSearchingSRI(true);
        setError('');
        
        try {
            const razonSocial = await salesService.querySRI(formData.client_ruc);
            if (razonSocial) {
                setFormData(prev => ({
                    ...prev,
                    client_name: razonSocial
                }));
            }
        } catch (err) {
            setError(err.message || "Error consultando el SRI. Verifique el número provisto.");
        } finally {
            setIsSearchingSRI(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">{initialData?.id ? 'Editar Venta' : (isManual ? 'Registrar Venta Manual' : 'Registrar Venta')}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-bold border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">RUC / Cédula</label>
                            <div className="relative">
                                <input 
                                    name="client_ruc" value={formData.client_ruc} onChange={handleChange}
                                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: 0951091727"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchSRI}
                                    disabled={isSearchingSRI || !formData.client_ruc}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-100 text-blue-600 rounded flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
                                    title="Buscar Razón Social en el SRI"
                                >
                                    {isSearchingSRI ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre / Razón Social</label>
                            <input 
                                name="client_name" value={formData.client_name} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Empresa S.A."
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                            <input 
                                name="client_phone" value={formData.client_phone} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="099xxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
                            <input 
                                name="client_email" type="email" value={formData.client_email} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="email@dominio.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                            <select 
                                name="product_category" value={formData.product_category} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option value="">Seleccione...</option>
                                <option value="Firma">Firma</option>
                                <option value="Plan">Plan</option>
                                <option value="Módulo">Módulo</option>
                                <option value="Cambio de Plan">Cambio de Plan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Venta</label>
                            <select 
                                name="sale_type" value={formData.sale_type} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option value="NUEVA">NUEVA</option>
                                <option value="RENOVACION">RENOVACIÓN</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                            <select 
                                name="status" value={formData.status} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option value="EN GESTIÓN">EN GESTIÓN</option>
                                <option value="VENTA CERRADA">VENTA CERRADA</option>
                                <option value="DESCARTADA">DESCARTADA</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Origen de la Venta</label>
                            <select 
                                name="origin" value={formData.origin} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccione un origen...</option>
                                <option value="World Trade Center">World Trade Center</option>
                                <option value="Samanes">Samanes</option>
                                <option value="Albán Borja">Albán Borja</option>
                                <option value="Páginas Web">Páginas Web</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Descripción de la Venta</label>
                            <input 
                                name="description" value={formData.description} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Plan Básico + Firma Electrónica"
                            />
                        </div>
                    </div>

                    {isManual && (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Clasificación / Gestión</label>
                                <select 
                                    name="management_type" value={formData.management_type} onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                >
                                    <option value="N/A">N/A</option>
                                    <option value="Gestión Vendedor">Gestión Vendedor</option>
                                    <option value="Autogestión">Autogestión</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {formData.status === 'EN GESTIÓN' && (
                            <div>
                                <label className="block text-xs font-bold text-amber-600 mb-1">Fecha de Próximo Seguimiento</label>
                                <input 
                                    type="date"
                                    name="next_contact_date" value={formData.next_contact_date} onChange={handleChange}
                                    className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl mt-4 flex items-center justify-between border border-blue-100">
                        <span className="text-sm font-bold text-blue-800">Total a Registrar</span>
                        {isManual ? (
                            <div className="flex items-center">
                                <span className="text-blue-700 font-bold mr-1">$</span>
                                <input 
                                    name="total_amount"
                                    type="number" 
                                    step="0.01"
                                    value={formData.total_amount} 
                                    onChange={handleChange}
                                    className="w-24 p-2 bg-white border border-blue-200 rounded-lg font-bold text-blue-700 text-right outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-blue-700">${parseFloat(total).toFixed(2)}</span>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Venta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
