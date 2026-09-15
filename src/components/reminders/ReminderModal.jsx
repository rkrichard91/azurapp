import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin, User, Phone, Mail, FileText, Bell, Sparkles } from 'lucide-react';
import { useRemindersContext } from '../../context/ReminderContext';

export default function ReminderModal({ isOpen, onClose, initialData = null }) {
    const { createReminder, updateReminder } = useRemindersContext();

    const [formData, setFormData] = useState({
        title: '',
        type: 'capacitacion',
        modality: 'zoom',
        client_name: '',
        client_phone: '',
        client_email: '',
        date_time: '',
        meeting_url: '',
        location_address: '',
        notify_advance_minutes: 15,
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Prepopulate or set defaults
    useEffect(() => {
        if (initialData) {
            // Format ISO date to YYYY-MM-DDTHH:mm
            let formattedDate = '';
            if (initialData.date_time) {
                const d = new Date(initialData.date_time);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                formattedDate = d.toISOString().slice(0, 16);
            }

            setFormData({
                title: initialData.title || '',
                type: initialData.type || 'capacitacion',
                modality: initialData.modality || 'zoom',
                client_name: initialData.client_name || '',
                client_phone: initialData.client_phone || '',
                client_email: initialData.client_email || '',
                date_time: formattedDate,
                meeting_url: initialData.meeting_url || '',
                location_address: initialData.location_address || '',
                notify_advance_minutes: initialData.notify_advance_minutes ?? 15,
                notes: initialData.notes || ''
            });
        } else {
            // Default to next hour
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            nextHour.setMinutes(nextHour.getMinutes() - nextHour.getTimezoneOffset());

            setFormData({
                title: '',
                type: 'capacitacion',
                modality: 'zoom',
                client_name: '',
                client_phone: '',
                client_email: '',
                date_time: nextHour.toISOString().slice(0, 16),
                meeting_url: '',
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
            setError('Por favor ingresa un título para el recordatorio.');
            return;
        }
        if (!formData.client_name.trim()) {
            setError('Por favor ingresa el nombre del cliente.');
            return;
        }
        if (!formData.date_time) {
            setError('Por favor selecciona la fecha y hora.');
            return;
        }

        try {
            setIsSubmitting(true);
            const isoDateTime = new Date(formData.date_time).toISOString();

            if (initialData?.id) {
                await updateReminder(initialData.id, {
                    ...formData,
                    date_time: isoDateTime
                });
            } else {
                await createReminder({
                    ...formData,
                    date_time: isoDateTime
                });
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError('Hubo un error guardando el recordatorio.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quick presets for title
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
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {initialData ? 'Editar Cita / Recordatorio' : 'Agendar Nueva Cita o Visita'}
                                </h3>
                                <p className="text-xs text-blue-100">
                                    Capacitaciones, soporte y reuniones con alertas
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
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Modality Selector (Zoom vs Presencial) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Modalidad de la Reunión
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, modality: 'zoom' })}
                                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 font-semibold text-sm transition-all ${
                                        formData.modality === 'zoom'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <Video size={18} className={formData.modality === 'zoom' ? 'text-blue-600' : 'text-slate-400'} />
                                    <span>💻 Vía Zoom / Virtual</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, modality: 'presencial', notify_advance_minutes: 30 })}
                                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 font-semibold text-sm transition-all ${
                                        formData.modality === 'presencial'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <MapPin size={18} className={formData.modality === 'presencial' ? 'text-emerald-600' : 'text-slate-400'} />
                                    <span>🏢 Visita Presencial</span>
                                </button>
                            </div>
                        </div>

                        {/* Event Type & Quick Presets */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Tipo de Actividad
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { id: 'capacitacion', label: '🎓 Capacitación', color: 'hover:border-purple-300' },
                                    { id: 'soporte_tecnico', label: '🛠️ Soporte Técnico', color: 'hover:border-amber-300' },
                                    { id: 'reunion_cliente', label: '🤝 Reunión Comercial', color: 'hover:border-emerald-300' },
                                    { id: 'otro', label: '📌 Otro Asunto', color: 'hover:border-blue-300' },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: item.id })}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                                            formData.type === item.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : `bg-slate-50 text-slate-700 border-slate-200 ${item.color}`
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Presets chips */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Sparkles size={13} className="text-amber-500" /> Ejemplos:</span>
                            <button
                                type="button"
                                onClick={() => applyPreset('Capacitación Sistema & Facturación', 'capacitacion')}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                                Capacitación Facturación
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('Soporte Firma Electrónica / API', 'soporte_tecnico')}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                                Soporte Firma / API
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('Demo Comercial & Cotización', 'reunion_cliente')}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                                Demo Comercial
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Título del Recordatorio *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Capacitación Facturación y Módulos - Ferretería El Sol"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                required
                            />
                        </div>

                        {/* Modality Specific Input */}
                        {formData.modality === 'zoom' ? (
                            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                                <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                    <Video size={14} /> Enlace de la Reunión (Zoom / Meet)
                                </label>
                                <input
                                    type="url"
                                    value={formData.meeting_url}
                                    onChange={e => setFormData({ ...formData, meeting_url: e.target.value })}
                                    placeholder="https://zoom.us/j/123456789 o https://meet.google.com/..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <p className="text-[11px] text-blue-600">
                                    Te permitirá unirte con 1 clic directo desde la alarma y enviar el link al cliente por WhatsApp.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                                <label className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                    <MapPin size={14} /> Dirección Física de la Visita Presencial
                                </label>
                                <input
                                    type="text"
                                    value={formData.location_address}
                                    onChange={e => setFormData({ ...formData, location_address: e.target.value })}
                                    placeholder="Ej: Av. 10 de Agosto y Colón, Edif. Torres del Parque, Piso 3"
                                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                                <p className="text-[11px] text-emerald-700">
                                    Podrás abrir directamente la ubicación en Google Maps desde el móvil o la app.
                                </p>
                            </div>
                        )}

                        {/* Client details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <User size={13} /> Nombre del Cliente o Empresa *
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_name}
                                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    placeholder="Ej: Distribuidora Los Andes"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Phone size={13} /> Celular / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={formData.client_phone}
                                    onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                                    placeholder="Ej: 0991234567"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Date Time & Notification Advance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Clock size={13} /> Fecha y Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.date_time}
                                    onChange={e => setFormData({ ...formData, date_time: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                    <Bell size={13} /> Avisar con anticipación
                                </label>
                                <select
                                    value={formData.notify_advance_minutes}
                                    onChange={e => setFormData({ ...formData, notify_advance_minutes: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    <option value={0}>A la hora exacta</option>
                                    <option value={5}>5 minutos antes</option>
                                    <option value={15}>15 minutos antes (Ideal Zoom)</option>
                                    <option value={30}>30 minutos antes (Ideal Traslado)</option>
                                    <option value={45}>45 minutos antes</option>
                                    <option value={60}>1 hora antes</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <FileText size={13} /> Notas / Temas a tratar
                            </label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Detalles, dudas del cliente o preparativos previos..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Cita' : 'Guardar en Agenda'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
