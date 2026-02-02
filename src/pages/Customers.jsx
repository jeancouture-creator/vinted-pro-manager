import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Edit, Trash2, MapPin, Mail, Phone, ShoppingBag, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
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

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deleteCustomer, setDeleteCustomer] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [customersData, ordersData] = await Promise.all([
            base44.entities.Customer.list('-created_date'),
            base44.entities.Order.list('-created_date')
        ]);
        setCustomers(customersData);
        setOrders(ordersData);
        setIsLoading(false);
    };

    const handleSubmit = async (formData) => {
        if (editingCustomer) {
            await base44.entities.Customer.update(editingCustomer.id, formData);
        } else {
            await base44.entities.Customer.create(formData);
        }
        await loadData();
        setShowForm(false);
        setEditingCustomer(null);
    };

    const handleDelete = async () => {
        if (deleteCustomer) {
            await base44.entities.Customer.delete(deleteCustomer.id);
            await loadData();
            setDeleteCustomer(null);
        }
    };

    const getCustomerOrders = (customerId) => {
        return orders.filter(o => o.customer_id === customerId);
    };

    const filteredCustomers = customers.filter(c =>
        !search ||
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.vinted_username?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

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
                        Clienti
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{customers.length} clienti registrati</p>
                </div>
                <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuovo Cliente
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cerca clienti..."
                    className="pl-10"
                />
            </div>

            {/* Customers Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800 h-48 animate-pulse" />
                    ))}
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nessun cliente trovato</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Aggiungi il primo cliente</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi Cliente
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer, index) => {
                        const customerOrders = getCustomerOrders(customer.id);
                        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
                        
                        return (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-semibold">
                                            {customer.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{customer.full_name}</h3>
                                            {customer.vinted_username && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400">@{customer.vinted_username}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); setShowForm(true); }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost"
                                            className="text-rose-600"
                                            onClick={(e) => { e.stopPropagation(); setDeleteCustomer(customer); }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.city && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{customer.city}, {customer.province}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{customerOrders.length} ordini</span>
                                    </div>
                                    <span className="font-semibold text-emerald-600">€{totalSpent.toFixed(2)}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Customer Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <CustomerForm
                        customer={editingCustomer}
                        onSubmit={handleSubmit}
                        onClose={() => { setShowForm(false); setEditingCustomer(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <CustomerDetail
                        customer={selectedCustomer}
                        orders={getCustomerOrders(selectedCustomer.id)}
                        onClose={() => setSelectedCustomer(null)}
                        onEdit={() => { setEditingCustomer(selectedCustomer); setShowForm(true); setSelectedCustomer(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare questo cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. Il cliente "{deleteCustomer?.full_name}" verrà eliminato permanentemente.
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

function CustomerForm({ customer, onSubmit, onClose }) {
    const [formData, setFormData] = useState(customer || {
        full_name: '',
        vinted_username: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        province: '',
        country: 'Italia',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="full_name">Nome e Cognome *</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="vinted_username">Username Vinted</Label>
                                <Input
                                    id="vinted_username"
                                    value={formData.vinted_username}
                                    onChange={e => setFormData({...formData, vinted_username: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telefono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address">Indirizzo</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="city">Città</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postal_code">CAP</Label>
                                <Input
                                    id="postal_code"
                                    value={formData.postal_code}
                                    onChange={e => setFormData({...formData, postal_code: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="province">Provincia</Label>
                                <Input
                                    id="province"
                                    value={formData.province}
                                    onChange={e => setFormData({...formData, province: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
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
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
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
                                customer ? 'Salva Modifiche' : 'Aggiungi Cliente'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

function CustomerDetail({ customer, orders, onClose, onEdit }) {
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dettaglio Cliente</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-semibold">
                            {customer.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{customer.full_name}</h3>
                            {customer.vinted_username && (
                                <p className="text-slate-500 dark:text-slate-400">@{customer.vinted_username}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {customer.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-900 dark:text-white">{customer.email}</span>
                            </div>
                        )}
                        {customer.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-900 dark:text-white">{customer.phone}</span>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div className="text-slate-900 dark:text-white">
                                    <p>{customer.address}</p>
                                    <p>{customer.postal_code} {customer.city} ({customer.province})</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Storico Ordini ({orders.length})</h4>
                        {orders.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">Nessun ordine</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{order.item_name}</p>
                                            <p className="text-xs text-slate-500">{order.order_date}</p>
                                        </div>
                                        <span className="font-semibold text-emerald-600">€{order.sale_price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                    <Button onClick={onEdit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica Cliente
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}