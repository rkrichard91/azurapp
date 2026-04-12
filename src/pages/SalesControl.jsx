import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, CalendarDays, Activity, Edit, Plus, Search, X, Download, Clock, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';
import { salesService } from '../services/salesService';
import SaleRegistrationModal from '../components/sale/SaleRegistrationModal';

export default function SalesControl() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [filterType, setFilterType] = useState('TODOS');
    const [filterOrigin, setFilterOrigin] = useState('');
    const [filterManagement, setFilterManagement] = useState('TODOS');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        totalAchieved: 0,
        totalInProcess: 0,
        newSalesRatio: 0
    });

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const data = await salesService.getSales();
            setSales(data || []);
        } catch (error) {
            console.error("Error loading sales:", error);
            alert("Error al cargar las ventas.");
        } finally {
            setLoading(false);
        }
    };

    // Derived state / Filtering
    useEffect(() => {
        let result = sales;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s => 
                (s.client_name && s.client_name.toLowerCase().includes(term)) ||
                (s.client_ruc && s.client_ruc.includes(term)) ||
                (s.description && s.description.toLowerCase().includes(term))
            );
        }

        if (filterStatus !== 'TODOS') {
            result = result.filter(s => s.status === filterStatus);
        }

        if (filterType !== 'TODOS') {
            result = result.filter(s => s.sale_type === filterType);
        }

        if (filterOrigin) {
            const originTerm = filterOrigin.toLowerCase();
            result = result.filter(s => s.origin && s.origin.toLowerCase().includes(originTerm));
        }

        if (filterManagement !== 'TODOS') {
            result = result.filter(s => s.management_type === filterManagement);
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            result = result.filter(s => new Date(s.created_at) >= fromDate);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(s => new Date(s.created_at) <= toDate);
        }

        // Sort descending by date
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFilteredSales(result);
        calculateStats(result);
    }, [sales, searchTerm, filterStatus, filterType, filterOrigin, filterManagement, dateFrom, dateTo]);

    const calculateStats = (data) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let today = 0;
        let week = 0;
        let month = 0;
        let year = 0;
        let achieved = 0;
        let inProcess = 0;
        let newCount = 0;

        data.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const amount = parseFloat(sale.total_amount) || 0;

            if (sale.status === 'VENTA CERRADA') {
                achieved += amount;
                
                if (saleDate >= startOfDay) today += amount;
                if (saleDate >= startOfWeek) week += amount;
                if (saleDate >= startOfMonth) month += amount;
                if (saleDate >= startOfYear) year += amount;
            } else if (sale.status === 'EN GESTIÓN') {
                inProcess += amount;
            }

            if (sale.sale_type === 'NUEVA') {
                newCount++;
            }
        });

        const ratio = data.length > 0 ? Math.round((newCount / data.length) * 100) : 0;

        setStats({
            today,
            week,
            month,
            year,
            totalAchieved: achieved,
            totalInProcess: inProcess,
            newSalesRatio: ratio
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await salesService.updateSaleStatus(id, newStatus);
            loadSales();
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    const handleNewManualSale = () => {
        setSelectedSale(null);
        setIsModalOpen(true);
    };

    const handleEditSale = (sale) => {
        setSelectedSale(sale);
        setIsModalOpen(true);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('TODOS');
        setFilterType('TODOS');
        setFilterOrigin('');
        setFilterManagement('TODOS');
        setDateFrom('');
        setDateTo('');
    };

    const recaudadoFiltrado = filteredSales.filter(s => s.status === 'VENTA CERRADA').reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
    const pendienteFiltrado = filteredSales.filter(s => s.status === 'EN GESTIÓN').reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);

    const handleExportCSV = () => {
        const headers = ['Fecha', 'Origen', 'RUC/Cédula', 'Razón Social', 'Tipo', 'Gestión', 'Estado', 'Monto', 'Seguimiento', 'Descripción'];
        const csvContent = [
            headers.join(','),
            ...filteredSales.map(s => {
                const date = new Date(s.created_at).toLocaleDateString('es-ES');
                const escapeCSV = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
                return [
                    date,
                    escapeCSV(s.origin),
                    escapeCSV(s.client_ruc),
                    escapeCSV(s.client_name),
                    s.sale_type,
                    escapeCSV(s.management_type || 'N/A'),
                    s.status,
                    s.total_amount,
                    s.next_contact_date ? new Date(s.next_contact_date).toLocaleDateString('es-ES') : '',
                    escapeCSV(s.description)
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ALERTS & CHARTS DATA
    const now = new Date();
    // Start of current day without time for comparisons
    const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const renewals = sales.filter(s => {
        if (s.status !== 'VENTA CERRADA') return false;
        const created = new Date(s.created_at);
        const daysOld = (now - created) / (1000 * 60 * 60 * 24);
        return daysOld >= 330 && daysOld <= 365; // almost a year old
    });

    const pieData = [
        { name: 'Cerradas', value: stats.totalAchieved, color: '#10b981' },
        { name: 'En Gestión', value: stats.totalInProcess, color: '#f59e0b' },
    ];
    
    // Group sales by month for the current year
    const getMonthlyData = () => {
        const data = Array(12).fill(0);
        sales.forEach(s => {
            const d = new Date(s.created_at);
            if (s.status === 'VENTA CERRADA' && d.getFullYear() === now.getFullYear()) {
                data[d.getMonth()] += parseFloat(s.total_amount) || 0;
            }
        });
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return data.map((val, idx) => ({ name: monthNames[idx], amount: val }));
    };
    const barData = getMonthlyData();

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800">Control de Ventas</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {renewals.length > 0 && (
                    <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800">Alertas de Renovación</h3>
                            <p className="text-sm text-red-700 mt-1">Tienes <b>{renewals.length}</b> clientes de {now.getFullYear() - 1} próximos a renovar su anualidad. Revisa el historial para contactarlos.</p>
                        </div>
                    </div>
                )}

                {/* METRICS DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Ventas de Hoy</p>
                            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.today)}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Este Mes</p>
                            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.month)}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Este Año</p>
                            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.year)}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="w-full">
                            <p className="text-sm text-slate-500 font-medium">En Gestión</p>
                            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalInProcess)}</h3>
                        </div>
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 text-center">Éxito de Cierre (Global)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Cerradas</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> En Gestión</div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 text-center">Curva de Ingresos ({now.getFullYear()})</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <YAxis tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(val) => formatCurrency(val)} labelStyle={{color: '#334155', fontWeight: 'bold'}} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* FILTERS SECTION */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Buscar (Nombre, RUC, Detalle)</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe aquí..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="TODOS">Todos</option>
                                <option value="EN GESTIÓN">En Gestión</option>
                                <option value="VENTA CERRADA">Venta Cerrada</option>
                                <option value="DESCARTADA">Descartada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="TODOS">Todos</option>
                                <option value="NUEVA">NUEVA</option>
                                <option value="RENOVACION">RENOVACION</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Origen (ej. Samanes)</label>
                            <input 
                                type="text"
                                value={filterOrigin} 
                                onChange={e => setFilterOrigin(e.target.value)} 
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Locales, web..." 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Gestión</label>
                            <select value={filterManagement} onChange={e => setFilterManagement(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="TODOS">Todos</option>
                                <option value="Gestión Vendedor">Gestión Vendedor</option>
                                <option value="Autogestión">Autogestión</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Desde</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Hasta</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleClearFilters} className="p-2 w-full lg:w-auto flex justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent" title="Limpiar Filtros">
                                <X className="w-5 h-5 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SALES DATA TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-800">Reporte de Registros</h2>
                            <span className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full w-fit">{filteredSales.length} items</span>
                            <span className="text-sm bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full w-fit">Recaudado: {formatCurrency(recaudadoFiltrado)}</span>
                            <span className="text-sm bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full w-fit">Pendiente: {formatCurrency(pendienteFiltrado)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Exportar CSV</span>
                            </button>
                            <button
                                onClick={handleNewManualSale}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Venta Manual</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse select-text">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                    <th className="p-4 font-semibold">Fecha</th>
                                    <th className="p-4 font-semibold">RUC / Cédula</th>
                                    <th className="p-4 font-semibold">Razón Social</th>
                                    <th className="p-4 font-semibold">Tipo</th>
                                    <th className="p-4 font-semibold">Origen</th>
                                    <th className="p-4 font-semibold">Gestión</th>
                                    <th className="p-4 font-semibold">Descripción</th>
                                    <th className="p-4 font-semibold text-center">Monto</th>
                                    <th className="p-4 font-semibold text-center" style={{minWidth: "160px"}}>Estado</th>
                                    <th className="p-4 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-400">Cargando ventas...</td>
                                    </tr>
                                ) : filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-400">No hay resultados para los filtros seleccionados.</td>
                                    </tr>
                                ) : (
                                    filteredSales.map(sale => {
                                        const dateLabel = new Date(sale.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                                        
                                        // Follow-Up tracking logic
                                        let urgentFollowUp = false;
                                        if(sale.status === 'EN GESTIÓN' && sale.next_contact_date) {
                                            const followDate = new Date(sale.next_contact_date);
                                            // Is followDate today or earlier?
                                            if(followDate <= todayNoTime) {
                                                urgentFollowUp = true;
                                            }
                                        }

                                        return (
                                            <tr key={sale.id} className={`hover:bg-slate-50 transition-colors ${urgentFollowUp ? 'bg-amber-50/50' : ''}`}>
                                                <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                                    {dateLabel}
                                                    {urgentFollowUp && (
                                                        <div className="flex items-center gap-1 mt-1 text-amber-600 font-bold" title="Llamada de Seguimiento Pendiente">
                                                            <Clock size={12} />
                                                            <span style={{fontSize: '10px'}}>HOY</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-slate-600">{sale.client_ruc}</td>
                                                <td className="p-4 text-sm font-bold text-slate-800">{sale.client_name}</td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${sale.sale_type === 'NUEVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {sale.sale_type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 max-w-[100px] truncate" title={sale.origin || '-'}>
                                                    {sale.origin || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                                        !sale.management_type || sale.management_type === 'N/A' ? 'border-slate-200 text-slate-400 bg-slate-50' : 
                                                        sale.management_type === 'Autogestión' ? 'border-blue-200 text-blue-700 bg-blue-50' : 
                                                        'border-emerald-200 text-emerald-700 bg-emerald-50'
                                                    }`}>
                                                        {sale.management_type || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={sale.description || '-'}>
                                                    {sale.description || '-'}
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-900">{formatCurrency(sale.total_amount)}</td>
                                                <td className="p-4">
                                                    <select 
                                                        value={sale.status} 
                                                        onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                                        className={`w-full text-sm font-bold p-2 rounded-lg border-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500
                                                            ${sale.status === 'VENTA CERRADA' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                                              sale.status === 'EN GESTIÓN' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                                              'border-red-200 text-red-700 bg-red-50'}`}
                                                    >
                                                        <option value="EN GESTIÓN">EN GESTIÓN</option>
                                                        <option value="VENTA CERRADA">VENTA CERRADA</option>
                                                        <option value="DESCARTADA">DESCARTADA</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => handleEditSale(sale)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar Venta"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SaleRegistrationModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    loadSales();
                }}
                isManual={true}
                initialData={selectedSale}
            />
        </div>
    );
}
