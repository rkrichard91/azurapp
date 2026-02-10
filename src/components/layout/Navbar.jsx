import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from '../auth/EditProfileModal';
import ChangePasswordModal from '../auth/ChangePasswordModal';

import { LayoutDashboard, ShoppingCart, Repeat, Package, Menu, X, LogOut, User, Lock, ChevronDown } from 'lucide-react';
import logo from '../../assets/logo.png';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Nueva Venta', path: '/new-sale', icon: ShoppingCart },
    { name: 'Adicionales', path: '/integrations', icon: Package },
    { name: 'Cambio de Plan', path: '/plan-change', icon: Repeat },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Get initials
    const getInitials = () => {
        if (!user) return '??';
        const name = user.user_metadata?.full_name || user.email || '';
        if (!name) return '??';
        if (name.includes('@')) return name.substring(0, 2).toUpperCase();

        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

    return (
        <>
            <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
            <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {/* Desktop Navbar (Floating Glass) */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 hidden md:block"
            >
                <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg shadow-slate-200/50 rounded-2xl px-6 py-3 flex items-center justify-between">

                    {/* Logo Area */}
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Azur Logo" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group"
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                                <item.icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                                {item.name}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="navbar-active"
                                                    className="absolute inset-0 bg-blue-50/80 border border-blue-100/50 rounded-xl shadow-sm z-0"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/50 transition-colors border border-transparent hover:border-slate-200/50"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-500/20">
                                {getInitials()}
                            </div>
                            < ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50 origin-top-right"
                                >
                                    <div className="px-4 py-3 border-b border-slate-50 mb-2">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                    </div>

                                    <button
                                        onClick={() => { setShowEditProfile(true); setIsProfileMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                    >
                                        <User size={16} /> Editar Perfil
                                    </button>

                                    <button
                                        onClick={() => { setShowChangePassword(true); setIsProfileMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                    >
                                        <Lock size={16} /> Cambiar Contraseña
                                    </button>

                                    <div className="h-px bg-slate-50 my-2" />

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navbar (Top Fixed) */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Azur Logo" className="h-9 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white"
                    >
                        {getInitials()}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Profile Menu Overlay */}
            <AnimatePresence>
                {isProfileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[60] flex items-start justify-end p-4 md:hidden pointer-events-none"
                    >
                        <div className="w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 pointer-events-auto mt-14">
                            <div className="px-4 py-3 border-b border-slate-50 mb-2">
                                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => { setShowEditProfile(true); setIsProfileMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                            >
                                <User size={18} /> Editar Perfil
                            </button>
                            <button
                                onClick={() => { setShowChangePassword(true); setIsProfileMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                            >
                                <Lock size={18} /> Cambiar Contraseña
                            </button>
                            <div className="h-px bg-slate-50 my-2" />
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                            >
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                            <button
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="w-full text-center py-3 text-xs text-slate-400 border-t border-slate-50 mt-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-xl md:hidden flex flex-col p-6 space-y-4"
                    >
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`
                                }
                            >
                                <item.icon className="w-6 h-6" />
                                {item.name}
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
