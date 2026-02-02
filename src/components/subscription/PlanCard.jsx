import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import StripeCheckout from '@/components/billing/StripeCheckout';

const planIcons = {
    free: Zap,
    pro: Sparkles,
    enterprise: Crown
};

const planColors = {
    free: 'from-slate-500 to-slate-600',
    pro: 'from-violet-500 to-purple-600',
    enterprise: 'from-amber-500 to-orange-600'
};

export default function PlanCard({ plan, isCurrentPlan, onSelect, index = 0 }) {
    const Icon = planIcons[plan.id];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-2xl border-2 ${
                isCurrentPlan 
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                    : plan.featured
                    ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
        >
            {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1">
                        Più Popolare
                    </Badge>
                </div>
            )}

            {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white px-3 py-1">
                        Piano Attuale
                    </Badge>
                </div>
            )}

            <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${planColors[plan.id]} mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                        <span className="text-slate-500 dark:text-slate-400">/mese</span>
                    )}
                </div>
                {plan.trial && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">14 giorni di prova gratuita</p>
                )}
            </div>

            <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>

            {plan.limitations && plan.limitations.length > 0 && (
                <div className="mb-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Limitazioni:</p>
                    <ul className="space-y-1">
                        {plan.limitations.map((limit, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400">• {limit}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isCurrentPlan ? (
                <Button 
                    disabled
                    className="w-full"
                >
                    Piano Attuale
                </Button>
            ) : plan.price === 0 ? (
                <Button 
                    onClick={() => onSelect(plan)}
                    className="w-full"
                >
                    Inizia Gratis
                </Button>
            ) : (
                <StripeCheckout plan={plan} onSuccess={() => onSelect(plan)} />
            )}
        </motion.div>
    );
}