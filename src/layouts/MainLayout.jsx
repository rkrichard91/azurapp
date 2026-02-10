import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars


export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Background Decor (Subtle Gradients) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />
            </div>

            <Navbar />

            {/* Content Area with Top Padding for Navbar */}
            <main className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
