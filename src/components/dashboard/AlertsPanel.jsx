import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlertsPanel({ unsoldItems, lowMarginItems }) {
    const alerts = [];
    
    if (unsoldItems?.length > 0) {
        alerts.push({
            type: 'warning',
            icon: Clock,
            title: `${unsoldItems.length} articoli invenduti da oltre 30 giorni`,
            description: 'Considera di abbassare il prezzo o promuoverli',
            items: unsoldItems.slice(0, 3)
        });
    }
    
    if (lowMarginItems?.length > 0) {
        alerts.push({
            type: 'info',
            icon: TrendingDown,
            title: `${lowMarginItems.length} articoli con margine basso`,
            description: 'Rivedi i prezzi per ottimizzare i profitti',
            items: lowMarginItems.slice(0, 3)
        });
    }

    if (alerts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white/20">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Tutto sotto controllo!</h3>
                        <p className="text-sm text-emerald-100">Nessun avviso importante al momento</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Avvisi
            </h3>
            <div className="space-y-4">
                {alerts.map((alert, index) => {
                    const AlertIcon = alert.icon;
                    return (
                        <div key={index} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                            <div className="flex items-start gap-3">
                                <AlertIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-amber-800 dark:text-amber-300">{alert.title}</p>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{alert.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}