import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MapPin, Bell, Clock, CheckCircle, MessageSquare, ExternalLink, X } from 'lucide-react';
import { useRemindersContext } from '../../context/ReminderContext';

export default function AlarmAlertModal() {
    const { activeAlarm, snoozeReminder, markCompleted, dismissAlarm } = useRemindersContext();

    if (!activeAlarm) return null;

    const isZoom = activeAlarm.modality === 'zoom';
    const eventTime = new Date(activeAlarm.date_time);
    const timeFormatted = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const typeConfig = {
        capacitacion: { label: 'Capacitación', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
        reunion_cliente: { label: 'Reunión Comercial', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        soporte_tecnico: { label: 'Soporte Técnico', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
        otro: { label: 'Recordatorio', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
    };

    const typeInfo = typeConfig[activeAlarm.type] || typeConfig.otro;

    // WhatsApp quick link
    const handleWhatsApp = () => {
        if (!activeAlarm.client_phone) return;
        const phone = activeAlarm.client_phone.replace(/\D/g, '');
        const message = isZoom
            ? `Hola ${activeAlarm.client_name}, te saluda el equipo de Azur. Te recordamos que está por iniciar nuestra reunión (${activeAlarm.title}) vía Zoom: ${activeAlarm.meeting_url || ''}`
            : `Hola ${activeAlarm.client_name}, te saluda el equipo de Azur. Te recordamos nuestra visita/reunión presencial programada para hoy: ${activeAlarm.title}. ¡Nos vemos pronto!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Google Maps quick link
    const handleOpenMap = () => {
        if (!activeAlarm.location_address) return;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeAlarm.location_address)}`, '_blank');
    };

    const alertContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                    {/* Glowing Top Banner */}
                    <div className="bg-gradient-to-r from-red-500 via-amber-500 to-blue-600 p-1">
                        <div className="bg-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center animate-bounce shadow-inner">
                                    <Bell size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        ¡Alarma de Recordatorio!
                                    </h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={13} /> Programado para las: <strong className="text-slate-800">{timeFormatted}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={dismissAlarm}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeInfo.bg}`}>
                                {typeInfo.label}
                            </span>
                            {isZoom ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                                    <Video size={13} /> Vía Zoom
                                </span>
                            ) : (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                    <MapPin size={13} /> Presencial
                                </span>
                            )}
                        </div>

                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">{activeAlarm.title}</h4>
                            <p className="text-sm font-medium text-slate-600">
                                Cliente: <span className="text-slate-900 font-semibold">{activeAlarm.client_name}</span>
                                {activeAlarm.client_phone && (
                                    <span className="text-slate-400 font-normal ml-2">({activeAlarm.client_phone})</span>
                                )}
                            </p>
                        </div>

                        {/* Modality Specific Details */}
                        {isZoom ? (
                            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 space-y-2">
                                <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Video size={14} /> Sala Virtual / Enlace
                                </div>
                                {activeAlarm.meeting_url ? (
                                    <a
                                        href={activeAlarm.meeting_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-[1.01]"
                                    >
                                        <Video size={18} />
                                        Entrar a la Sala de Zoom ahora
                                        <ExternalLink size={15} />
                                    </a>
                                ) : (
                                    <p className="text-xs text-blue-600 italic">No se especificó URL de Zoom</p>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-2">
                                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin size={14} /> Ubicación de la Visita Presencial
                                </div>
                                <p className="text-sm text-slate-700 font-medium">{activeAlarm.location_address || 'Sin dirección registrada'}</p>
                                {activeAlarm.location_address && (
                                    <button
                                        onClick={handleOpenMap}
                                        className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                                    >
                                        <MapPin size={16} />
                                        Abrir en Google Maps
                                        <ExternalLink size={14} />
                                    </button>
                                )}
                            </div>
                        )}

                        {activeAlarm.notes && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 font-medium mb-1">Notas / Instrucciones:</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{activeAlarm.notes}</p>
                            </div>
                        )}

                        {/* WhatsApp reminder button */}
                        {activeAlarm.client_phone && (
                            <button
                                onClick={handleWhatsApp}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 font-medium text-sm transition-colors"
                            >
                                <MessageSquare size={16} />
                                Enviar recordatorio por WhatsApp al cliente
                            </button>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <button
                            onClick={() => snoozeReminder(activeAlarm.id, 5)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors shadow-sm text-sm"
                        >
                            <Clock size={16} className="text-slate-500" />
                            Posponer 5 min
                        </button>

                        <button
                            onClick={() => markCompleted(activeAlarm.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md transition-colors text-sm"
                        >
                            <CheckCircle size={16} />
                            Marcar como Atendido
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return typeof document !== 'undefined' ? createPortal(alertContent, document.body) : alertContent;
}
