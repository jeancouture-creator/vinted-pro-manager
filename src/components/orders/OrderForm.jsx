import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const shippingMethods = [
    { value: 'poste_italiane', label: 'Poste Italiane' },
    { value: 'brt', label: 'BRT' },
    { value: 'gls', label: 'GLS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'inpost', label: 'InPost' },
    { value: 'altro', label: 'Altro' }
];

const orderStatuses = [
    { value: 'in_attesa', label: 'In Attesa' },
    { value: 'pagato', label: 'Pagato' },
    { value: 'spedito', label: 'Spedito' },
    { value: 'consegnato', label: 'Consegnato' },
    { value: 'completato', label: 'Completato' },
    { value: 'annullato', label: 'Annullato' },
    { value: 'reso', label: 'Reso' }
];

export default function OrderForm({ order, onSubmit, onClose }) {
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(order || {
        order_number: '',
        item_id: '',
        item_name: '',
        customer_id: '',
        customer_name: '',
        sale_price: '',
        purchase_price: 0,
        shipping_cost: '',
        vinted_commission: '',
        status: 'in_attesa',
        shipping_method: '',
        tracking_number: '',
        order_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [itemsData, customersData] = await Promise.all([
            base44.entities.Item.filter({ status: 'in_vendita' }),
            base44.entities.Customer.list()
        ]);
        setItems(itemsData);
        setCustomers(customersData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemSelect = (itemId) => {
        const selectedItem = items.find(i => i.id === itemId);
        if (selectedItem) {
            setFormData(prev => ({
                ...prev,
                item_id: itemId,
                item_name: selectedItem.name,
                sale_price: selectedItem.selling_price || '',
                purchase_price: selectedItem.purchase_price || 0
            }));
        }
    };

    const handleCustomerSelect = (customerId) => {
        const selectedCustomer = customers.find(c => c.id === customerId);
        if (selectedCustomer) {
            setFormData(prev => ({
                ...prev,
                customer_id: customerId,
                customer_name: selectedCustomer.full_name
            }));
        }
    };

    const calculateNetProfit = () => {
        const salePrice = parseFloat(formData.sale_price) || 0;
        const purchasePrice = parseFloat(formData.purchase_price) || 0;
        const shippingCost = parseFloat(formData.shipping_cost) || 0;
        const commission = parseFloat(formData.vinted_commission) || 0;
        return salePrice - purchasePrice - shippingCost - commission;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const data = {
            ...formData,
            sale_price: parseFloat(formData.sale_price) || 0,
            purchase_price: parseFloat(formData.purchase_price) || 0,
            shipping_cost: parseFloat(formData.shipping_cost) || 0,
            vinted_commission: parseFloat(formData.vinted_commission) || 0,
            net_profit: calculateNetProfit()
        };
        
        await onSubmit(data);
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {order ? 'Modifica Ordine' : 'Nuovo Ordine'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="order_number">Numero Ordine Vinted</Label>
                                <Input
                                    id="order_number"
                                    value={formData.order_number}
                                    onChange={e => handleChange('order_number', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="order_date">Data Ordine</Label>
                                <Input
                                    id="order_date"
                                    type="date"
                                    value={formData.order_date}
                                    onChange={e => handleChange('order_date', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Articolo Venduto *</Label>
                                <Select value={formData.item_id} onValueChange={handleItemSelect}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona articolo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} - €{item.selling_price}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Cliente</Label>
                                <Select value={formData.customer_id} onValueChange={handleCustomerSelect}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="sale_price">Prezzo Vendita (€) *</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.sale_price}
                                    onChange={e => handleChange('sale_price', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="shipping_cost">Spedizione (€)</Label>
                                <Input
                                    id="shipping_cost"
                                    type="number"
                                    step="0.01"
                                    value={formData.shipping_cost}
                                    onChange={e => handleChange('shipping_cost', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="vinted_commission">Commissione (€)</Label>
                                <Input
                                    id="vinted_commission"
                                    type="number"
                                    step="0.01"
                                    value={formData.vinted_commission}
                                    onChange={e => handleChange('vinted_commission', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Guadagno Netto</Label>
                                <div className={`mt-1 px-3 py-2 rounded-md border text-center font-semibold ${calculateNetProfit() >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                    €{calculateNetProfit().toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Stato Ordine</Label>
                                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orderStatuses.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Metodo Spedizione</Label>
                                <Select value={formData.shipping_method} onValueChange={v => handleChange('shipping_method', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shippingMethods.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tracking_number">Codice Tracking</Label>
                            <Input
                                id="tracking_number"
                                value={formData.tracking_number}
                                onChange={e => handleChange('tracking_number', e.target.value)}
                                placeholder="Inserisci codice tracking"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Note</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={e => handleChange('notes', e.target.value)}
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
                                order ? 'Salva Modifiche' : 'Crea Ordine'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}