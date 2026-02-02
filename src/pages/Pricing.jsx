import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PlanCard from '@/components/subscription/PlanCard';
import { toast } from 'sonner';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        trial: false,
        featured: false,
        features: [
            'Fino a 50 articoli',
            'Fino a 20 ordini/mese',
            '10 crediti AI/mese',
            'Dashboard guadagni base',
            'Gestione clienti',
            'Export CSV base',
            'Chatbot assistenza'
        ],
        limitations: [
            'No AI suggerimenti prezzi',
            'No generazione descrizioni',
            'No analytics avanzate',
            'No report PDF'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        trial: true,
        featured: true,
        features: [
            'Fino a 500 articoli',
            'Fino a 200 ordini/mese',
            '500 crediti AI/mese',
            'AI suggerimenti prezzi intelligenti',
            'Generazione descrizioni ottimizzate',
            'Sconti automatici AI',
            'Post social media AI',
            'Analytics avanzate con KPI',
            'Report PDF completi',
            'Integrazione Google Sheets',
            'Gestione resi avanzata',
            'Tracking spedizioni',
            'Backup automatici'
        ],
        limitations: []
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 79,
        trial: true,
        featured: false,
        features: [
            'Articoli illimitati',
            'Ordini illimitati',
            '2000 crediti AI/mese',
            'Multi-account Vinted',
            'Multi-utente collaborativo',
            'Tutte le funzionalità Pro',
            'Modalità approvazione manuale AI',
            'Report fiscali annuali',
            'API access per integrazioni',
            'White-label opzionale',
            'Supporto prioritario',
            'Onboarding personalizzato',
            'Account manager dedicato'
        ],
        limitations: []
    }
];

export default function Pricing() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLoading(false);
    };

    const handleSelectPlan = async (plan) => {
        if (plan.id === user?.subscription_plan) return;

        // In a real app, this would integrate with Stripe
        // For now, we'll just update the user record
        try {
            const updateData = {
                subscription_plan: plan.id,
                subscription_status: plan.price === 0 ? 'active' : 'trial',
                ai_credits_limit: plan.id === 'free' ? 10 : plan.id === 'pro' ? 500 : 2000
            };

            if (plan.price > 0 && !user?.trial_ends_at) {
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 14);
                updateData.trial_ends_at = trialEnd.toISOString().split('T')[0];
            }

            await base44.auth.updateMe(updateData);

            // Log subscription change
            await base44.entities.SubscriptionHistory.create({
                user_id: user.id,
                action: plan.id === 'free' ? 'downgrade' : 'upgrade',
                from_plan: user?.subscription_plan || 'free',
                to_plan: plan.id,
                amount: plan.price
            });

            toast.success(`Piano ${plan.name} attivato con successo!`);
            await loadUser();
        } catch (error) {
            toast.error('Errore durante il cambio piano');
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Prezzi Trasparenti</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Scegli il Piano Perfetto
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Inizia gratis e passa al piano Pro quando sei pronto. 
                        Nessun costo nascosto, cancellazione in qualsiasi momento.
                    </p>
                </motion.div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrentPlan={user?.subscription_plan === plan.id}
                        onSelect={handleSelectPlan}
                        index={index}
                    />
                ))}
            </div>

            {/* FAQ Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-3xl mx-auto mt-16"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
                    Domande Frequenti
                </h2>
                <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Come funziona il trial gratuito?
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Puoi provare i piani Pro ed Enterprise per 14 giorni senza inserire carta di credito. 
                            Alla fine del trial, puoi scegliere se continuare o tornare al piano Free.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Cosa succede se raggiungo i limiti?
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Riceverai un avviso quando ti avvicini ai limiti. Puoi fare upgrade in qualsiasi momento 
                            per aumentare i limiti e sbloccare nuove funzionalità.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Posso cambiare piano in qualsiasi momento?
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Sì, puoi fare upgrade o downgrade in qualsiasi momento. 
                            Gli upgrade sono immediati, i downgrade avvengono alla fine del periodo di fatturazione.
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            I miei dati sono al sicuro?
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Assolutamente. Tutti i dati sono crittografati, con backup automatici e compliance GDPR completa. 
                            Puoi esportare o eliminare i tuoi dati in qualsiasi momento.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-8 pt-8 border-t border-slate-200 dark:border-slate-700"
            >
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Pagamenti Sicuri</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Dati Crittografati</span>
                </div>
            </motion.div>
        </div>
    );
}