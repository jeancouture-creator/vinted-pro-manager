import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';

const statusConfig = {
    in_attesa: { label: 'In Attesa', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    pagato: { label: 'Pagato', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
    spedito: { label: 'Spedito', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: Truck },
    consegnato: { label: 'Consegnato', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    completato: { label: 'Completato', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    annullato: { label: 'Annullato', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400', icon: XCircle },
    reso: { label: 'Reso', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: RotateCcw }
};

export default function RecentOrders({ orders }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ordini Recenti</h3>
            <div className="space-y-3">
                {orders.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Nessun ordine recente</p>
                ) : (
                    orders.slice(0, 5).map((order, index) => {
                        const status = statusConfig[order.status] || statusConfig.in_attesa;
                        const StatusIcon = status.icon;
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white dark:bg-slate-600 shadow-sm">
                                        <StatusIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{order.item_name || 'Articolo'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.customer_name || 'Cliente'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-slate-900 dark:text-white">€{order.sale_price?.toFixed(2)}</span>
                                    <Badge className={`${status.color} border-0`}>{status.label}</Badge>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}