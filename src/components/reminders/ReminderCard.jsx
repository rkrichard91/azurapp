import React from 'react';
import { Video, MapPin, Clock, CheckCircle2, Circle, MessageSquare, ExternalLink, Edit2, Trash2, Calendar } from 'lucide-react';
import { useRemindersContext } from '../../context/ReminderContext';

export default function ReminderCard({ reminder, onEdit }) {
    const { markCompleted, deleteReminder } = useRemindersContext();

    const isZoom = reminder.modality === 'zoom';
    const isCompleted = reminder.status === 'completada';

    const eventDate = new Date(reminder.date_time);
    const today = new Date();
    const isToday = eventDate.toDateString() === today.toDateString();

    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = eventDate.toLocaleDateString([], { day: '2-digit', month: 'short' });

    const typeConfig = {
        capacitacion: { label: 'Capacitación', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        reunion_cliente: { label: 'Reunión Comercial', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        soporte_tecnico: { label: 'Soporte Técnico', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        otro: { label: 'Recordatorio', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };

    const typeInfo = typeConfig[reminder.type] || typeConfig.otro;

    // WhatsApp handler
    const handleWhatsApp = () => {
        if (!reminder.client_phone) return;
        const phone = reminder.client_phone.replace(/\D/g, '');
        const message = isZoom
            ? `Hola ${reminder.client_name}, te saluda el equipo de Azur. Te confirmamos nuestra reunión (${reminder.title}) vía Zoom programada para ${isToday ? 'hoy a las ' + timeStr : dateStr + ' a las ' + timeStr}: ${reminder.meeting_url || ''}`
            : `Hola ${reminder.client_name}, te saluda el equipo de Azur. Te confirmamos nuestra visita presencial programada para ${isToday ? 'hoy a las ' + timeStr : dateStr + ' a las ' + timeStr} (${reminder.title}). ¡Saludos!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Maps handler
    const handleOpenMap = () => {
        if (!reminder.location_address) return;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reminder.location_address)}`, '_blank');
    };

    return (
        <div
            className={`group p-5 rounded-2xl border transition-all ${
                isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
            }`}
        >
            <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.color}`}>
                        {typeInfo.label}
                    </span>

                    {isZoom ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Video size={12} /> Zoom
                        </span>
                    ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <MapPin size={12} /> Presencial
                        </span>
                    )}

                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 ml-auto">
                        <Clock size={13} className={isToday ? 'text-blue-600' : 'text-slate-400'} />
                        {isToday ? `Hoy, ${timeStr}` : `${dateStr}, ${timeStr}`}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(reminder)}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Deseas eliminar este recordatorio?')) {
                                deleteReminder(reminder.id);
                            }
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <h4 className={`font-bold text-base text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                    {reminder.title}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                    Cliente: <span className="font-semibold text-slate-900">{reminder.client_name}</span>
                    {reminder.client_phone && <span className="text-slate-400 ml-1.5">• {reminder.client_phone}</span>}
                </p>
            </div>

            {/* Address or Meeting Link Display */}
            {isZoom && reminder.meeting_url && (
                <div className="mb-3 p-2 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
                    <span className="truncate max-w-[240px]">{reminder.meeting_url}</span>
                    <a
                        href={reminder.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 ml-2"
                    >
                        Entrar <ExternalLink size={12} />
                    </a>
                </div>
            )}

            {!isZoom && reminder.location_address && (
                <div className="mb-3 p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                    <span className="truncate max-w-[240px] flex items-center gap-1">
                        <MapPin size={13} className="shrink-0 text-emerald-600" />
                        {reminder.location_address}
                    </span>
                    <button
                        onClick={handleOpenMap}
                        className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 ml-2 shrink-0"
                    >
                        Mapa <ExternalLink size={12} />
                    </button>
                </div>
            )}

            {reminder.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-3 line-clamp-2">
                    {reminder.notes}
                </p>
            )}

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {isZoom && reminder.meeting_url && (
                        <a
                            href={reminder.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                            <Video size={13} /> Unirse a Zoom
                        </a>
                    )}

                    {!isZoom && reminder.location_address && (
                        <button
                            onClick={handleOpenMap}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                            <MapPin size={13} /> Ver Mapa
                        </button>
                    )}

                    {reminder.client_phone && (
                        <button
                            onClick={handleWhatsApp}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Enviar WhatsApp"
                        >
                            <MessageSquare size={13} /> WhatsApp
                        </button>
                    )}
                </div>

                <button
                    onClick={() => markCompleted(reminder.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCompleted
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800'
                    }`}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle2 size={14} className="text-emerald-600" /> Completada
                        </>
                    ) : (
                        <>
                            <Circle size={14} /> Marcar Lista
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
