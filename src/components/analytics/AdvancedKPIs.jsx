import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Clock, Percent, Package, Zap } from 'lucide-react';

export default function AdvancedKPIs({ items, orders, expenses }) {
    // ROI Calculation
    const totalInvestment = items.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
    const totalRevenue = orders
        .filter(o => o.status !== 'annullato' && o.status !== 'reso')
        .reduce((sum, o) => sum + (o.sale_price || 0), 0);
    const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment * 100).toFixed(1) : 0;

    // Average Margin
    const soldItems = items.filter(i => i.status === 'venduto');
    const avgMargin = soldItems.length > 0
        ? soldItems.reduce((sum, i) => {
            const margin = ((i.selling_price - i.purchase_price) / i.purchase_price) * 100;
            return sum + margin;
        }, 0) / soldItems.length
        : 0;

    // Average Time to Sell
    const avgDaysToSell = soldItems.length > 0
        ? soldItems.reduce((sum, i) => {
            const published = new Date(i.published_date || i.created_date);
            const sold = new Date(i.updated_date);
            const days = Math.max(0, (sold - published) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0) / soldItems.length
        : 0;

    // Inventory Turnover (times per year)
    const inventoryTurnover = soldItems.length > 0 ? (365 / avgDaysToSell).toFixed(1) : 0;

    // Sell-through Rate
    const sellThroughRate = items.length > 0 
        ? ((soldItems.length / items.length) * 100).toFixed(1)
        : 0;

    // Revenue per Item
    const revenuePerItem = soldItems.length > 0 
        ? (totalRevenue / soldItems.length).toFixed(2)
        : 0;

    // Profit Margin %
    const totalCosts = orders.reduce((sum, o) => sum + (o.purchase_price || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profitMargin = totalRevenue > 0 
        ? (((totalRevenue - totalCosts - totalExpenses) / totalRevenue) * 100).toFixed(1)
        : 0;

    // Active Listings
    const activeListings = items.filter(i => i.status === 'in_vendita').length;

    const kpis = [
        {
            label: 'ROI',
            value: `${roi}%`,
            icon: TrendingUp,
            color: parseFloat(roi) > 50 ? 'emerald' : parseFloat(roi) > 20 ? 'blue' : 'amber',
            trend: parseFloat(roi) > 0 ? 'up' : 'down',
            subtitle: 'Return on Investment'
        },
        {
            label: 'Margine Medio',
            value: `${avgMargin.toFixed(1)}%`,
            icon: Percent,
            color: avgMargin > 50 ? 'emerald' : avgMargin > 30 ? 'blue' : 'amber',
            subtitle: 'Su articoli venduti'
        },
        {
            label: 'Tempo Vendita',
            value: `${Math.round(avgDaysToSell)}gg`,
            icon: Clock,
            color: avgDaysToSell < 30 ? 'emerald' : avgDaysToSell < 60 ? 'blue' : 'rose',
            subtitle: 'Media giorni in vendita'
        },
        {
            label: 'Rotazione Stock',
            value: `${inventoryTurnover}x`,
            icon: Zap,
            color: parseFloat(inventoryTurnover) > 6 ? 'emerald' : parseFloat(inventoryTurnover) > 3 ? 'blue' : 'amber',
            subtitle: 'Volte/anno'
        },
        {
            label: 'Sell-through',
            value: `${sellThroughRate}%`,
            icon: BarChart3,
            color: parseFloat(sellThroughRate) > 70 ? 'emerald' : parseFloat(sellThroughRate) > 50 ? 'blue' : 'amber',
            subtitle: 'Tasso di vendita'
        },
        {
            label: 'Revenue/Item',
            value: `€${revenuePerItem}`,
            icon: DollarSign,
            color: 'violet',
            subtitle: 'Media per articolo'
        },
        {
            label: 'Margine Profitto',
            value: `${profitMargin}%`,
            icon: TrendingUp,
            color: parseFloat(profitMargin) > 40 ? 'emerald' : parseFloat(profitMargin) > 20 ? 'blue' : 'rose',
            subtitle: 'Netto su fatturato'
        },
        {
            label: 'Listing Attivi',
            value: activeListings,
            icon: Package,
            color: 'blue',
            subtitle: 'Articoli in vendita'
        }
    ];

    const colorClasses = {
        emerald: 'from-emerald-500 to-emerald-600',
        blue: 'from-blue-500 to-blue-600',
        violet: 'from-violet-500 to-violet-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600'
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.subtitle}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClasses[kpi.color]} shadow-lg`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        {kpi.trend && (
                            <div className="flex items-center gap-1 text-xs">
                                {kpi.trend === 'up' ? (
                                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-rose-600" />
                                )}
                            </div>
                        )}
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorClasses[kpi.color]} opacity-5`} />
                    </motion.div>
                );
            })}
        </div>
    );
}