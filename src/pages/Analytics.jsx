import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Analytics() {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [itemsData, ordersData, customersData] = await Promise.all([
            base44.entities.Item.list('-created_date'),
            base44.entities.Order.list('-created_date'),
            base44.entities.Customer.list('-created_date')
        ]);
        setItems(itemsData);
        setOrders(ordersData);
        setCustomers(customersData);
        setIsLoading(false);
    };

    const filterByPeriod = (data) => {
        const days = parseInt(period);
        const cutoff = subDays(new Date(), days);
        return data.filter(d => new Date(d.created_date) >= cutoff);
    };

    const filteredOrders = filterByPeriod(orders).filter(o => o.status !== 'annullato');
    const filteredItems = filterByPeriod(items);

    // KPIs
    const totalSales = filteredOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
    const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
    const avgOrderValue = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Sales over time
    const getSalesOverTime = () => {
        const days = parseInt(period);
        const dates = eachDayOfInterval({
            start: subDays(new Date(), days),
            end: new Date()
        });

        return dates.map(date => {
            const dayOrders = filteredOrders.filter(o => 
                format(new Date(o.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            return {
                date: format(date, 'd MMM', { locale: it }),
                vendite: dayOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0),
                ordini: dayOrders.length
            };
        });
    };

    // Category performance
    const getCategoryPerformance = () => {
        const categoryStats = {};
        
        filteredOrders.forEach(order => {
            const item = items.find(i => i.id === order.item_id);
            const category = item?.category || 'altro';
            
            if (!categoryStats[category]) {
                categoryStats[category] = { revenue: 0, profit: 0, count: 0 };
            }
            categoryStats[category].revenue += order.sale_price || 0;
            categoryStats[category].profit += order.net_profit || 0;
            categoryStats[category].count += 1;
        });

        return Object.entries(categoryStats).map(([name, stats]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
            vendite: stats.revenue,
            profitto: stats.profit,
            quantità: stats.count
        })).sort((a, b) => b.vendite - a.vendite);
    };

    // Brand performance
    const getBrandPerformance = () => {
        const brandStats = {};
        
        filteredOrders.forEach(order => {
            const item = items.find(i => i.id === order.item_id);
            const brand = item?.brand || 'Altro';
            
            if (!brandStats[brand]) {
                brandStats[brand] = { revenue: 0, count: 0 };
            }
            brandStats[brand].revenue += order.sale_price || 0;
            brandStats[brand].count += 1;
        });

        return Object.entries(brandStats)
            .map(([name, stats]) => ({ name, value: stats.revenue, count: stats.count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    };

    // Inventory status
    const getInventoryStatus = () => {
        const statusCount = {};
        items.forEach(item => {
            const status = item.status || 'in_magazzino';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const statusLabels = {
            in_magazzino: 'In Magazzino',
            in_vendita: 'In Vendita',
            venduto: 'Venduto',
            reso: 'Reso',
            riservato: 'Riservato'
        };

        return Object.entries(statusCount).map(([status, count]) => ({
            name: statusLabels[status] || status,
            value: count
        }));
    };

    // Best sellers
    const getBestSellers = () => {
        const itemSales = {};
        
        filteredOrders.forEach(order => {
            const itemId = order.item_id;
            if (itemId) {
                if (!itemSales[itemId]) {
                    itemSales[itemId] = { 
                        name: order.item_name || 'Articolo',
                        revenue: 0,
                        count: 0
                    };
                }
                itemSales[itemId].revenue += order.sale_price || 0;
                itemSales[itemId].count += 1;
            }
        });

        return Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    };

    // Conversion rate
    const conversionRate = items.length > 0 
        ? ((items.filter(i => i.status === 'venduto').length / items.length) * 100).toFixed(1)
        : 0;

    // Average days to sell
    const getAvgDaysToSell = () => {
        const soldItems = items.filter(i => i.status === 'venduto');
        if (soldItems.length === 0) return 0;

        const totalDays = soldItems.reduce((sum, item) => {
            const published = new Date(item.published_date || item.created_date);
            const sold = new Date(item.updated_date);
            return sum + Math.max(0, (sold - published) / (1000 * 60 * 60 * 24));
        }, 0);

        return Math.round(totalDays / soldItems.length);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Analytics
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Analisi dettagliata delle performance</p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-48">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Ultimi 7 giorni</SelectItem>
                        <SelectItem value="30">Ultimi 30 giorni</SelectItem>
                        <SelectItem value="90">Ultimi 90 giorni</SelectItem>
                        <SelectItem value="365">Ultimo anno</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Fatturato</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{totalSales.toFixed(2)}</p>
                    <p className="text-sm text-slate-500 mt-1">{filteredOrders.length} ordini</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Profitto</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{totalProfit.toFixed(2)}</p>
                    <p className="text-sm text-slate-500 mt-1">{profitMargin.toFixed(1)}% margine</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Valore Medio</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{avgOrderValue.toFixed(2)}</p>
                    <p className="text-sm text-slate-500 mt-1">per ordine</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Conversione</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{conversionRate}%</p>
                    <p className="text-sm text-slate-500 mt-1">~{getAvgDaysToSell()} giorni medi</p>
                </motion.div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vendite nel Tempo</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getSalesOverTime()}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `€${v}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value, name) => [name === 'vendite' ? `€${value}` : value, name === 'vendite' ? 'Vendite' : 'Ordini']}
                                />
                                <Area type="monotone" dataKey="vendite" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance per Categoria</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getCategoryPerformance()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `€${v}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value, name) => [`€${value.toFixed(2)}`, name === 'vendite' ? 'Vendite' : 'Profitto']}
                                />
                                <Bar dataKey="vendite" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vendite" />
                                <Bar dataKey="profitto" fill="#10b981" radius={[4, 4, 0, 0]} name="Profitto" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Brand</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getBrandPerformance()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getBrandPerformance().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value) => [`€${value.toFixed(2)}`, 'Vendite']}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Stato Magazzino</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getInventoryStatus()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getInventoryStatus().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Best Seller</h3>
                    <div className="space-y-3">
                        {getBestSellers().length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Nessun dato disponibile</p>
                        ) : (
                            getBestSellers().map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                            index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[120px]">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-emerald-600">€{item.revenue.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}