import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsageMetrics({ user, items, orders }) {
    const limits = {
        free: { items: 50, orders: 20, ai_credits: 10 },
        pro: { items: 500, orders: 200, ai_credits: 500 },
        enterprise: { items: Infinity, orders: Infinity, ai_credits: 2000 }
    };

    const currentLimits = limits[user?.subscription_plan || 'free'];
    const itemsCount = items?.length || 0;
    const ordersCount = orders?.length || 0;
    const aiCredits = user?.ai_credits_used || 0;
    const aiLimit = user?.ai_credits_limit || currentLimits.ai_credits;

    const itemsPercent = currentLimits.items === Infinity ? 0 : (itemsCount / currentLimits.items) * 100;
    const ordersPercent = currentLimits.orders === Infinity ? 0 : (ordersCount / currentLimits.orders) * 100;
    const aiPercent = (aiCredits / aiLimit) * 100;

    const isNearLimit = itemsPercent > 80 || ordersPercent > 80 || aiPercent > 80;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Utilizzo Piano</h3>
                <Badge className={
                    user?.subscription_plan === 'enterprise' 
                        ? 'bg-amber-100 text-amber-700' 
                        : user?.subscription_plan === 'pro'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-700'
                }>
                    {user?.subscription_plan?.toUpperCase() || 'FREE'}
                </Badge>
            </div>

            {isNearLimit && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                                Stai raggiungendo i limiti del piano
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Considera l'upgrade per sbloccare più funzionalità
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Items */}
                {currentLimits.items !== Infinity && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Articoli</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {itemsCount} / {currentLimits.items}
                            </span>
                        </div>
                        <Progress value={itemsPercent} className="h-2" />
                    </div>
                )}

                {/* Orders */}
                {currentLimits.orders !== Infinity && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Ordini</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {ordersCount} / {currentLimits.orders}
                            </span>
                        </div>
                        <Progress value={ordersPercent} className="h-2" />
                    </div>
                )}

                {/* AI Credits */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-violet-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Crediti AI</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {aiCredits} / {aiLimit}
                        </span>
                    </div>
                    <Progress value={aiPercent} className="h-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Reset mensile • {aiLimit - aiCredits} rimanenti
                    </p>
                </div>
            </div>

            {currentLimits.items === Infinity && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                            Utilizzo illimitato
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}