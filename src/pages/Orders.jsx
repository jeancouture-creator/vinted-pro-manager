import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Search, Package, Truck, CheckCircle, Clock, XCircle, RotateCcw, Edit, Trash2, Eye } from 'lucide-react';
import TrackingPanel from '@/components/shipping/TrackingPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { base44 } from '@/api/base44Client';
import OrderForm from '@/components/orders/OrderForm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig = {
    in_attesa: { label: 'In Attesa', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    pagato: { label: 'Pagato', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
    spedito: { label: 'Spedito', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: Truck },
    consegnato: { label: 'Consegnato', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    completato: { label: 'Completato', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    annullato: { label: 'Annullato', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400', icon: XCircle },
    reso: { label: 'Reso', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: RotateCcw }
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [deleteOrder, setDeleteOrder] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const data = await base44.entities.Order.list('-created_date');
        setOrders(data);
        setIsLoading(false);
    };

    const handleSubmit = async (formData) => {
        if (editingOrder) {
            await base44.entities.Order.update(editingOrder.id, formData);
            
            // Update item status if order is completed
            if (formData.status === 'completato' && formData.item_id) {
                await base44.entities.Item.update(formData.item_id, { status: 'venduto' });
            }
        } else {
            await base44.entities.Order.create(formData);
            
            // Update item status to sold
            if (formData.item_id) {
                await base44.entities.Item.update(formData.item_id, { status: 'venduto' });
            }
            
            // Update customer stats
            if (formData.customer_id) {
                const customer = await base44.entities.Customer.filter({ id: formData.customer_id });
                if (customer.length > 0) {
                    await base44.entities.Customer.update(formData.customer_id, {
                        total_orders: (customer[0].total_orders || 0) + 1,
                        total_spent: (customer[0].total_spent || 0) + (formData.sale_price || 0)
                    });
                }
            }
        }
        await loadOrders();
        setShowForm(false);
        setEditingOrder(null);
    };

    const handleDelete = async () => {
        if (deleteOrder) {
            await base44.entities.Order.delete(deleteOrder.id);
            await loadOrders();
            setDeleteOrder(null);
        }
    };

    const exportToCSV = () => {
        const headers = ['Numero Ordine', 'Data', 'Articolo', 'Cliente', 'Prezzo Vendita', 'Spedizione', 'Commissione', 'Profitto', 'Stato'];
        const csvContent = [
            headers.join(','),
            ...filteredOrders.map(order => [
                `"${order.order_number || ''}"`,
                `"${order.order_date || ''}"`,
                `"${order.item_name || ''}"`,
                `"${order.customer_name || ''}"`,
                order.sale_price || 0,
                order.shipping_cost || 0,
                order.vinted_commission || 0,
                order.net_profit || 0,
                `"${statusConfig[order.status]?.label || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ordini_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !search ||
            order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            order.item_name?.toLowerCase().includes(search.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalSales = filteredOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
    const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
    const pendingOrders = filteredOrders.filter(o => o.status === 'in_attesa' || o.status === 'pagato').length;

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
                        Ordini
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredOrders.length} ordini</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Esporta CSV
                    </Button>
                    <Button onClick={() => { setEditingOrder(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Ordine
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vendite Totali</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{totalSales.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Profitto Totale</p>
                    <p className="text-2xl font-bold text-emerald-600">€{totalProfit.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Da Spedire</p>
                    <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cerca ordini..."
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti gli stati</SelectItem>
                        {Object.entries(statusConfig).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tracking Panel */}
            <TrackingPanel />

            {/* Orders Table */}
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ordine</TableHead>
                            <TableHead>Articolo</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Vendita</TableHead>
                            <TableHead>Profitto</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                        <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    Nessun ordine trovato
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.in_attesa;
                                const StatusIcon = status.icon;
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    #{order.order_number || order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {order.order_date ? format(new Date(order.order_date), 'd MMM yyyy', { locale: it }) : '-'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-slate-900 dark:text-white">{order.item_name || '-'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-slate-900 dark:text-white">{order.customer_name || '-'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-slate-900 dark:text-white">€{order.sale_price?.toFixed(2)}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className={`font-semibold ${(order.net_profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                €{order.net_profit?.toFixed(2) || '0.00'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${status.color} border-0`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    onClick={() => { setEditingOrder(order); setShowForm(true); }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    className="text-rose-600"
                                                    onClick={() => setDeleteOrder(order)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <OrderForm
                        order={editingOrder}
                        onSubmit={handleSubmit}
                        onClose={() => { setShowForm(false); setEditingOrder(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare questo ordine?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. L'ordine verrà eliminato permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            Elimina
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}