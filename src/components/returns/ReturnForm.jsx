import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const returnReasons = [
    { value: 'not_as_described', label: 'Non come descritto' },
    { value: 'damaged', label: 'Danneggiato' },
    { value: 'wrong_item', label: 'Articolo sbagliato' },
    { value: 'changed_mind', label: 'Ripensamento' },
    { value: 'other', label: 'Altro' }
];

const returnStatuses = [
    { value: 'requested', label: 'Richiesto' },
    { value: 'approved', label: 'Approvato' },
    { value: 'rejected', label: 'Rifiutato' },
    { value: 'received', label: 'Ricevuto' },
    { value: 'refunded', label: 'Rimborsato' }
];

export default function ReturnForm({ returnItem, onSubmit, onClose }) {
    const [orders, setOrders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(returnItem || {
        order_id: '',
        item_id: '',
        item_name: '',
        customer_id: '',
        customer_name: '',
        reason: '',
        reason_details: '',
        status: 'requested',
        refund_amount: '',
        return_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const data = await base44.entities.Order.list('-created_date');
        setOrders(data.filter(o => o.status !== 'annullato'));
    };

    const handleOrderSelect = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setFormData(prev => ({
                ...prev,
                order_id: orderId,
                item_id: order.item_id,
                item_name: order.item_name,
                customer_id: order.customer_id,
                customer_name: order.customer_name,
                refund_amount: order.sale_price || ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({
            ...formData,
            refund_amount: parseFloat(formData.refund_amount) || 0
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {returnItem ? 'Modifica Reso' : 'Nuovo Reso'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-4">
                        {!returnItem && (
                            <div>
                                <Label>Ordine di Riferimento *</Label>
                                <Select value={formData.order_id} onValueChange={handleOrderSelect}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona ordine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orders.map(order => (
                                            <SelectItem key={order.id} value={order.id}>
                                                {order.item_name} - {order.customer_name} - €{order.sale_price}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Motivo Reso *</Label>
                                <Select value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {returnReasons.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Stato</Label>
                                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {returnStatuses.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reason_details">Dettagli</Label>
                            <Textarea
                                id="reason_details"
                                value={formData.reason_details}
                                onChange={e => setFormData({...formData, reason_details: e.target.value})}
                                rows={2}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="refund_amount">Importo Rimborso (€)</Label>
                                <Input
                                    id="refund_amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.refund_amount}
                                    onChange={e => setFormData({...formData, refund_amount: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="return_date">Data Richiesta</Label>
                                <Input
                                    id="return_date"
                                    type="date"
                                    value={formData.return_date}
                                    onChange={e => setFormData({...formData, return_date: e.target.value})}
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
                        <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvataggio...
                                </>
                            ) : (
                                returnItem ? 'Salva' : 'Registra Reso'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}