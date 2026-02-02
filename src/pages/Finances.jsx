import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, TrendingUp, TrendingDown, Wallet, CreditCard, Receipt, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const expenseCategories = [
    { value: 'acquisto_merce', label: 'Acquisto Merce' },
    { value: 'spedizione', label: 'Spedizione' },
    { value: 'commissioni', label: 'Commissioni' },
    { value: 'materiali_imballaggio', label: 'Materiali Imballaggio' },
    { value: 'fotografia', label: 'Fotografia' },
    { value: 'abbonamenti', label: 'Abbonamenti' },
    { value: 'resi', label: 'Resi' },
    { value: 'altro', label: 'Altro' }
];

export default function Finances() {
    const [orders, setOrders] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [ordersData, expensesData] = await Promise.all([
            base44.entities.Order.list('-created_date'),
            base44.entities.Expense.list('-created_date')
        ]);
        setOrders(ordersData);
        setExpenses(expensesData);
        setIsLoading(false);
    };

    const handleSubmitExpense = async (formData) => {
        if (editingExpense) {
            await base44.entities.Expense.update(editingExpense.id, formData);
        } else {
            await base44.entities.Expense.create(formData);
        }
        await loadData();
        setShowForm(false);
        setEditingExpense(null);
    };

    const handleDeleteExpense = async (expense) => {
        await base44.entities.Expense.delete(expense.id);
        await loadData();
    };

    // Calculate stats
    const completedOrders = orders.filter(o => o.status !== 'annullato' && o.status !== 'reso');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
    const totalCosts = completedOrders.reduce((sum, o) => sum + (o.purchase_price || 0), 0);
    const totalShipping = completedOrders.reduce((sum, o) => sum + (o.shipping_cost || 0), 0);
    const totalCommissions = completedOrders.reduce((sum, o) => sum + (o.vinted_commission || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalProfit = completedOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
    const netProfit = totalRevenue - totalCosts - totalShipping - totalCommissions - totalExpenses;

    // Chart data
    const getMonthlyData = () => {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        
        return months.slice(0, currentMonth + 1).map((name, index) => {
            const monthOrders = completedOrders.filter(o => {
                const d = new Date(o.created_date);
                return d.getMonth() === index;
            });
            const monthExpenses = expenses.filter(e => {
                const d = new Date(e.created_date);
                return d.getMonth() === index;
            });
            
            return {
                name,
                entrate: monthOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0),
                uscite: monthOrders.reduce((sum, o) => sum + (o.purchase_price || 0) + (o.shipping_cost || 0) + (o.vinted_commission || 0), 0) 
                    + monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
                profitto: monthOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0)
            };
        });
    };

    const getExpensesByCategory = () => {
        const categoryTotals = {};
        expenses.forEach(e => {
            const cat = e.category || 'altro';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
        });
        
        return Object.entries(categoryTotals).map(([name, value]) => ({
            name: expenseCategories.find(c => c.value === name)?.label || name,
            value
        }));
    };

    const exportToCSV = () => {
        const headers = ['Tipo', 'Data', 'Descrizione', 'Categoria', 'Importo'];
        const allTransactions = [
            ...orders.map(o => ({
                type: 'Entrata',
                date: o.order_date || o.created_date,
                description: o.item_name || 'Vendita',
                category: 'Vendita',
                amount: o.sale_price || 0
            })),
            ...expenses.map(e => ({
                type: 'Uscita',
                date: e.expense_date || e.created_date,
                description: e.description,
                category: expenseCategories.find(c => c.value === e.category)?.label || e.category,
                amount: -(e.amount || 0)
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        const csvContent = [
            headers.join(','),
            ...allTransactions.map(t => [
                `"${t.type}"`,
                `"${t.date}"`,
                `"${t.description}"`,
                `"${t.category}"`,
                t.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finanze_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
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
                        Finanze
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Panoramica guadagni e spese</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Esporta
                    </Button>
                    <Button onClick={() => { setEditingExpense(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuova Spesa
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm">Fatturato Totale</p>
                            <p className="text-3xl font-bold mt-1">€{totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm">Costi Merce</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€{totalCosts.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                            <CreditCard className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm">Spese Extra</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€{totalExpenses.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-100 text-sm">Profitto Netto</p>
                            <p className="text-3xl font-bold mt-1">€{netProfit.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Andamento Mensile</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getMonthlyData()}>
                                <defs>
                                    <linearGradient id="colorEntrate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorUscite" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `€${v}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value) => [`€${value.toFixed(2)}`, '']}
                                />
                                <Area type="monotone" dataKey="entrate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEntrate)" name="Entrate" />
                                <Area type="monotone" dataKey="uscite" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorUscite)" name="Uscite" />
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Spese per Categoria</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getExpensesByCategory()} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `€${v}`} />
                                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value) => [`€${value.toFixed(2)}`, 'Totale']}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Expenses Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Registro Spese</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrizione</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Importo</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Nessuna spesa registrata
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        {expense.expense_date ? format(new Date(expense.expense_date), 'd MMM yyyy', { locale: it }) : '-'}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">
                                        {expense.description}
                                    </TableCell>
                                    <TableCell>
                                        {expenseCategories.find(c => c.value === expense.category)?.label || expense.category}
                                    </TableCell>
                                    <TableCell className="font-semibold text-rose-600">
                                        -€{expense.amount?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                                        >
                                            Modifica
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </motion.div>

            {/* Report Generator */}
            <ReportGenerator />

            {/* Expense Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <ExpenseForm
                        expense={editingExpense}
                        onSubmit={handleSubmitExpense}
                        onClose={() => { setShowForm(false); setEditingExpense(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ExpenseForm({ expense, onSubmit, onClose }) {
    const [formData, setFormData] = useState(expense || {
        description: '',
        category: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({
            ...formData,
            amount: parseFloat(formData.amount) || 0
        });
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {expense ? 'Modifica Spesa' : 'Nuova Spesa'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="description">Descrizione *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            required
                            className="mt-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Categoria *</Label>
                            <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Seleziona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategories.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Importo (€) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                required
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="expense_date">Data</Label>
                        <Input
                            id="expense_date"
                            type="date"
                            value={formData.expense_date}
                            onChange={e => setFormData({...formData, expense_date: e.target.value})}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Note</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            rows={2}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annulla
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvataggio...
                                </>
                            ) : (
                                expense ? 'Salva' : 'Aggiungi'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}