import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    Wallet, 
    TrendingUp,
    Menu,
    X,
    Moon,
    Sun,
    ChevronRight,
    Settings,
    LogOut,
    RotateCcw,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/common/SearchBar';
import ChatBot from '@/components/chat/ChatBot';
import GDPRBanner from '@/components/compliance/GDPRBanner';
import { base44 } from '@/api/base44Client';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Magazzino', icon: Package, page: 'Inventory' },
    { name: 'Ordini', icon: ShoppingCart, page: 'Orders' },
    { name: 'Clienti', icon: Users, page: 'Customers' },
    { name: 'Finanze', icon: Wallet, page: 'Finances' },
    { name: 'Analytics', icon: TrendingUp, page: 'Analytics' },
    { name: 'Marketing', icon: Sparkles, page: 'Marketing' },
    { name: 'Resi', icon: RotateCcw, page: 'Returns' }
];

const adminNavItems = [
    { name: 'Admin', icon: Settings, page: 'Admin' }
];

export default function Layout({ children, currentPageName }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const loadUser = async () => {
        const userData = await base44.auth.me();
        setUser(userData);
    };

    const handleLogout = () => {
        base44.auth.logout();
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${isDark ? 'dark' : ''}`}>
            <style>{`
                :root {
                    --color-primary: #10b981;
                    --color-primary-dark: #059669;
                }
                .dark {
                    --color-background: #0f172a;
                    --color-surface: #1e293b;
                }
            `}</style>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
                <div className="p-6">
                    <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 dark:text-white">VintedPro</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Gestionale</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = currentPageName === item.page;
                            return (
                                <li key={item.page}>
                                    <Link
                                        to={createPageUrl(item.page)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            isActive 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                                        <span className="font-medium">{item.name}</span>
                                        {isActive && (
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}

                        {user?.role === 'admin' && (
                            <>
                                <div className="my-4 border-t border-slate-200 dark:border-slate-700" />
                                {adminNavItems.map((item) => {
                                    const isActive = currentPageName === item.page;
                                    return (
                                        <li key={item.page}>
                                            <Link
                                                to={createPageUrl(item.page)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                    isActive 
                                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                                                <span className="font-medium">{item.name}</span>
                                                {isActive && (
                                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </>
                        )}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    {user && (
                        <Link to={createPageUrl('Settings')}>
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                    {user.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">{user.full_name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user.subscription_plan?.toUpperCase() || 'FREE'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 z-50 lg:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <h1 className="font-bold text-lg text-slate-900 dark:text-white">VintedPro</h1>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <nav className="flex-1 px-4">
                                <ul className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = currentPageName === item.page;
                                        return (
                                            <li key={item.page}>
                                                <Link
                                                    to={createPageUrl(item.page)}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                        isActive 
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                                            : 'text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                            <SearchBar />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setIsDark(!isDark)}
                                className="rounded-full"
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleLogout}
                                className="rounded-full text-slate-500 hover:text-rose-600"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* ChatBot */}
            <ChatBot />

            {/* GDPR Banner */}
            <GDPRBanner />
        </div>
    );
}