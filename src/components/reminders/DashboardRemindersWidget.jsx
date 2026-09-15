import React, { useState } from 'react';
import { Calendar, Plus, Bell, Clock, Search, Video, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useRemindersContext } from '../../context/ReminderContext';
import ReminderCard from './ReminderCard';
import ReminderModal from './ReminderModal';

export default function DashboardRemindersWidget() {
    const {
        reminders,
        loading,
        pendingCount,
        hasNotificationPermission,
        requestNotificationPermission
    } = useRemindersContext();

    const [activeTab, setActiveTab] = useState('hoy'); // 'hoy', 'proximas', 'todas', 'completadas'
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    // Helpers
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filter logic
    const filteredReminders = reminders.filter(r => {
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchTitle = r.title?.toLowerCase().includes(term);
            const matchClient = r.client_name?.toLowerCase().includes(term);
            const matchAddress = r.location_address?.toLowerCase().includes(term);
            if (!matchTitle && !matchClient && !matchAddress) return false;
        }

        const rDate = r.date_time ? new Date(r.date_time) : null;
        if (!rDate) return false;
        const rDateStr = rDate.toISOString().split('T')[0];

        if (activeTab === 'completadas') {
            return r.status === 'completada';
        }

        if (r.status === 'completada') return false;

        if (activeTab === 'hoy') {
            return rDateStr === todayStr;
        }

        if (activeTab === 'proximas') {
            const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return rDate >= now && rDate <= oneWeekLater;
        }

        return true; // 'todas'
    });

    // Metric counts
    const todayEvents = reminders.filter(r => {
        if (!r.date_time || r.status === 'completada') return false;
        return new Date(r.date_time).toISOString().split('T')[0] === todayStr;
    });

    const countCapacitaciones = todayEvents.filter(r => r.type === 'capacitacion').length;
    const countSoporte = todayEvents.filter(r => r.type === 'soporte_tecnico').length;
    const countComercial = todayEvents.filter(r => r.type === 'reunion_cliente').length;

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingReminder(null);
        setIsModalOpen(true);
    };

    return (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 mb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <Calendar size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Agenda & Recordatorios
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Capacitaciones, soporte y reuniones vía Zoom o Presenciales con alertas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Native notification activation banner button */}
                    {!hasNotificationPermission && (
                        <button
                            onClick={requestNotificationPermission}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                            title="Permite que el navegador te avise con alarmas de escritorio"
                        >
                            <Bell size={14} className="text-amber-600" />
                            Activar Alertas de Escritorio
                        </button>
                    )}

                    <button
                        onClick={handleNew}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:scale-[1.02]"
                    >
                        <Plus size={18} />
                        Nueva Cita / Visita
                    </button>
                </div>
            </div>

            {/* Metrics Ribbon for Today */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {todayEvents.length}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-blue-950">Total Hoy</div>
                        <div className="text-[11px] text-blue-600">Reuniones y visitas</div>
                    </div>
                </div>

                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {countCapacitaciones}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-purple-950">Capacitaciones</div>
                        <div className="text-[11px] text-purple-600">Onboarding / Planes</div>
                    </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {countSoporte}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-amber-950">Soporte Técnico</div>
                        <div className="text-[11px] text-amber-600">Firmas / Incidencias</div>
                    </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {countComercial}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-emerald-950">Comercial / Demos</div>
                        <div className="text-[11px] text-emerald-600">Clientes & Prospectos</div>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-fit">
                    {[
                        { id: 'hoy', label: 'Hoy', count: todayEvents.length },
                        { id: 'proximas', label: 'Próximos 7 días' },
                        { id: 'todas', label: 'Todas' },
                        { id: 'completadas', label: 'Historial' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar cliente o cita..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                    Cargando recordatorios...
                </div>
            ) : filteredReminders.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Clock size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">
                        {activeTab === 'hoy'
                            ? 'No hay citas o capacitaciones agendadas para hoy'
                            : 'No se encontraron recordatorios en esta vista'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                        Agenda una visita presencial o reunión por Zoom para mantener a tus clientes y soporte atendidos a tiempo.
                    </p>
                    <button
                        onClick={handleNew}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                    >
                        <Plus size={15} /> Agendar Primera Cita
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReminders.map(reminder => (
                        <ReminderCard
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <ReminderModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingReminder(null);
                }}
                initialData={editingReminder}
            />
        </section>
    );
}
