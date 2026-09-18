import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Phone, FileText, Bell, Sparkles } from 'lucide-react';
import { useRemindersContext } from '../../context/ReminderContext';

export default function ReminderModal({ isOpen, onClose, initialData = null }) {
    const { createReminder, updateReminder } = useRemindersContext();

    const [formData, setFormData] = useState({
        title: '',
        type: 'reunion_comercial',
        client_name: '',
        client_phone: '',
        date_time: '',
        location_address: '',
        notify_advance_minutes: 15,
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Prepopulate or set defaults
    useEffect(() => {
        if (initialData) {
            let formattedDate = '';
            if (initialData.date_time) {
                const d = new Date(initialData.date_time);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                formattedDate = d.toISOString().slice(0, 16);
            }

            const initialType = initialData.type === 'otro' || initialData.type === 'soporte_tecnico'
                ? 'otro'
                : 'reunion_comercial';

            setFormData({
                title: initialData.title || '',
                type: initialType,
                client_name: initialData.client_name || '',
                client_phone: initialData.client_phone || '',
                date_time: formattedDate,
                location_address: initialData.location_address || '',
                notify_advance_minutes: initialData.notify_advance_minutes ?? 15,
                notes: initialData.notes || ''
            });
        } else {
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            nextHour.setMinutes(nextHour.getMinutes() - nextHour.getTimezoneOffset());

            setFormData({
                title: '',
                type: 'reunion_comercial',
                client_name: '',
                client_phone: '',
                date_time: nextHour.toISOString().slice(0, 16),
                location_address: '',
                notify_advance_minutes: 15,
                notes: ''
            });
        }
        setError('');
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Por favor ingresa un título o asunto.');
            return;
        }
        if (!formData.client_name.trim()) {
            setError('Por favor ingresa el nombre del cliente o contacto.');
            return;
        }
        if (!formData.date_time) {
            setError('Por favor selecciona la fecha y hora.');
            return;
        }

        try {
            setIsSubmitting(true);
            const isoDateTime = new Date(formData.date_time).toISOString();

            const payload = {
                ...formData,
                date_time: isoDateTime,
                modality: 'presencial' // standard default
            };

            if (initialData?.id) {
                await updateReminder(initialData.id, payload);
            } else {
                await createReminder(payload);
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError('Hubo un error guardando el recordatorio.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const applyPreset = (presetTitle, presetType) => {
        setFormData(prev => ({
            ...prev,
            title: presetTitle,
            type: presetType
        }));
    };

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {initialData ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
                                </h3>
                                <p className="text-xs text-blue-100">
                                    Reuniones comerciales y asuntos con alertas programadas
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Tipo de Recordatorio: 2 Opciones Claras */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Tipo de Recordatorio
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'reunion_comercial' })}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                                        formData.type === 'reunion_comercial'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span>🤝 Reunión Comercial</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'otro' })}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                                        formData.type === 'otro'
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span>📌 Otro Asunto</span>
                                </button>
                            </div>
                        </div>

                        {/* Ejemplos rápidos */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Sparkles size={13} className="text-amber-500" /> Plantillas:</span>
                            <button
                                type="button"
                                onClick={() => applyPreset('Reunión de Cierre de Venta', 'reunion_comercial')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                            >
                                Cierre Comercial
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('Demostración Comercial del Sistema', 'reunion_comercial')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                            >
                                Demo Comercial
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('Llamada de Seguimiento / Propuesta', 'otro')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                            >
                                Seguimiento
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Título o Asunto *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Reunión comercial con Gerencia - Distribuidora Los Andes"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                required
                            />
                        </div>

                        {/* Client details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <User size={13} /> Nombre del Cliente o Contacto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_name}
                                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    placeholder="Ej: Ing. Carlos Pérez"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Phone size={13} /> Celular / WhatsApp (opcional)
                                </label>
                                <input
                                    type="tel"
                                    value={formData.client_phone}
                                    onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                                    placeholder="Ej: 0991234567"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Date Time & Notification Advance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Clock size={13} /> Fecha y Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.date_time}
                                    onChange={e => setFormData({ ...formData, date_time: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Bell size={13} /> Alarma / Recordar
                                </label>
                                <select
                                    value={formData.notify_advance_minutes}
                                    onChange={e => setFormData({ ...formData, notify_advance_minutes: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    <option value={0}>A la hora exacta</option>
                                    <option value={5}>5 minutos antes</option>
                                    <option value={15}>15 minutos antes</option>
                                    <option value={30}>30 minutos antes</option>
                                    <option value={60}>1 hora antes</option>
                                </select>
                            </div>
                        </div>

                        {/* Location Address (Optional) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <MapPin size={13} /> Lugar o Dirección (opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.location_address}
                                onChange={e => setFormData({ ...formData, location_address: e.target.value })}
                                placeholder="Ej: Oficinas del cliente, cafetería o dirección de visita"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <FileText size={13} /> Notas / Observaciones (opcional)
                            </label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Detalles clave, propuesta enviada o temas a tratar..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Recordatorio' : 'Guardar Recordatorio'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
