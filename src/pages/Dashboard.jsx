import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp, Wallet, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import CategoryChart from '@/components/dashboard/CategoryChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';

export default function Dashboard() {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [itemsData, ordersData, expensesData] = await Promise.all([
            base44.entities.Item.list('-created_date'),
            base44.entities.Order.list('-created_date'),
            base44.entities.Expense.list('-created_date')
        ]);
        setItems(itemsData);
        setOrders(ordersData);
        setExpenses(expensesData);
        setIsLoading(false);
    };

    // Calculate stats
    const totalItems = items.length;
    const itemsInStock = items.filter(i => i.status === 'in_magazzino' || i.status === 'in_vendita').length;
    const soldItems = items.filter(i => i.status === 'venduto').length;
    
    const totalRevenue = orders
        .filter(o => o.status !== 'annullato' && o.status !== 'reso')
        .reduce((sum, o) => sum + (o.sale_price || 0), 0);
    
    const totalProfit = orders
        .filter(o => o.status !== 'annullato' && o.status !== 'reso')
        .reduce((sum, o) => sum + (o.net_profit || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Chart data
    const getMonthlyData = () => {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        
        return months.slice(0, currentMonth + 1).map((name, index) => {
            const monthOrders = orders.filter(o => {
                const orderDate = new Date(o.created_date);
                return orderDate.getMonth() === index && o.status !== 'annullato';
            });
            const monthExpenses = expenses.filter(e => {
                const expenseDate = new Date(e.created_date);
                return expenseDate.getMonth() === index;
            });
            
            return {
                name,
                guadagni: monthOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0),
                spese: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
            };
        });
    };

    const getCategoryData = () => {
        const categoryCount = {};
        items.filter(i => i.status === 'venduto').forEach(item => {
            const cat = item.category || 'altro';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        return Object.entries(categoryCount).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
            value
        }));
    };

    // Unsold items (more than 30 days)
    const unsoldItems = items.filter(item => {
        if (item.status !== 'in_vendita') return false;
        const publishedDate = new Date(item.published_date || item.created_date);
        const daysSince = Math.floor((new Date() - publishedDate) / (1000 * 60 * 60 * 24));
        return daysSince > 30;
    });

    // Low margin items
    const lowMarginItems = items.filter(item => {
        if (item.status === 'venduto') return false;
        const margin = item.selling_price - item.purchase_price;
        const marginPercent = item.purchase_price > 0 ? (margin / item.purchase_price) * 100 : 0;
        return marginPercent < 20 && marginPercent > 0;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Dashboard
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Panoramica del tuo negozio Vinted</p>
                </div>
                <div className="flex gap-3">
                    <Link to={createPageUrl('Inventory')}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuovo Articolo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Articoli in Stock"
                    value={itemsInStock}
                    icon={Package}
                    color="blue"
                    trend="up"
                    trendValue={`${soldItems} venduti`}
                />
                <StatsCard
                    title="Ordini Totali"
                    value={orders.length}
                    icon={ShoppingCart}
                    color="violet"
                />
                <StatsCard
                    title="Fatturato"
                    value={`€${totalRevenue.toFixed(2)}`}
                    icon={Wallet}
                    color="emerald"
                />
                <StatsCard
                    title="Profitto Netto"
                    value={`€${totalProfit.toFixed(2)}`}
                    icon={TrendingUp}
                    color="amber"
                    trend={totalProfit >= 0 ? 'up' : 'down'}
                    trendValue={`${((totalProfit / totalRevenue) * 100 || 0).toFixed(1)}% margine`}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={getMonthlyData()} />
                </div>
                <div>
                    <CategoryChart data={getCategoryData()} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders orders={orders} isLoading={isLoading} />
                <AlertsPanel unsoldItems={unsoldItems} lowMarginItems={lowMarginItems} />
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Link to={createPageUrl('Inventory')} className="group">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                        <Package className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Gestisci Magazzino</h3>
                        <p className="text-blue-100 text-sm mt-1">Aggiungi e modifica articoli</p>
                        <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </Link>
                <Link to={createPageUrl('Orders')} className="group">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                        <ShoppingCart className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Nuovo Ordine</h3>
                        <p className="text-violet-100 text-sm mt-1">Registra una vendita</p>
                        <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </Link>
                <Link to={createPageUrl('Finances')} className="group">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                        <Wallet className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Report Finanziari</h3>
                        <p className="text-emerald-100 text-sm mt-1">Analizza guadagni e spese</p>
                        <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}