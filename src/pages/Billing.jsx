import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import InvoiceHistory from '@/components/billing/InvoiceHistory';
import UsageMetrics from '@/components/subscription/UsageMetrics';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function Billing() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-slate-900 dark:text-white"
                        >
                            Fatturazione
                        </motion.h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestisci il tuo abbonamento e le fatture
                        </p>
                    </div>
                </div>
                <Link to={createPageUrl('Pricing')}>
                    <Button variant="outline">
                        Cambia Piano
                    </Button>
                </Link>
            </div>

            <InvoiceHistory />
        </div>
    );
}