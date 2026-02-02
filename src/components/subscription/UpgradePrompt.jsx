import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UpgradePrompt({ feature, requiredPlan = 'pro' }) {
    const planInfo = {
        pro: {
            name: 'Pro',
            icon: Sparkles,
            color: 'from-violet-500 to-purple-600',
            price: '29€/mese'
        },
        enterprise: {
            name: 'Enterprise',
            icon: Crown,
            color: 'from-amber-500 to-orange-600',
            price: '79€/mese'
        }
    };

    const plan = planInfo[requiredPlan];
    const Icon = plan.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 text-center"
        >
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`}>
                <Lock className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Funzionalità {plan.name}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                {feature} è disponibile solo nel piano <span className="font-semibold">{plan.name}</span>.
                Sblocca questa e molte altre funzionalità avanzate.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl('Pricing')}>
                    <Button className={`bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}>
                        <Icon className="w-4 h-4 mr-2" />
                        Passa a {plan.name} - {plan.price}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
                <Link to={createPageUrl('Pricing')}>
                    <Button variant="outline">
                        Confronta Piani
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}