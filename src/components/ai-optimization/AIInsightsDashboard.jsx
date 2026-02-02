import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Sparkles, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function AIInsightsDashboard() {
    const [stats, setStats] = useState({
        avgSEO: 0,
        pendingOptimizations: 0,
        pendingPricing: 0,
        totalSavings: 0,
        avgTimeToSell: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [seoAnalyses, pricingHistory, aiLogs] = await Promise.all([
            base44.entities.SEOAnalysis.list('-created_date', 100),
            base44.entities.PricingHistory.list('-created_date', 100),
            base44.entities.AIActivityLog.list('-created_date', 10)
        ]);

        // Calculate stats
        const approvedSEO = seoAnalyses.filter(s => s.status === 'approved');
        const avgSEO = approvedSEO.length > 0 
            ? approvedSEO.reduce((sum, s) => sum + s.seo_score, 0) / approvedSEO.length 
            : 0;

        const pendingOptimizations = seoAnalyses.filter(s => s.status === 'pending').length;
        const pendingPricing = pricingHistory.filter(p => p.status === 'pending').length;

        // Calculate potential savings from applied pricing
        const appliedPricing = pricingHistory.filter(p => p.status === 'applied');
        const totalSavings = appliedPricing.reduce((sum, p) => {
            const diff = (p.new_price || p.suggested_price) - p.previous_price;
            return sum + (diff > 0 ? diff : 0);
        }, 0);

        setStats({
            avgSEO: avgSEO.toFixed(0),
            pendingOptimizations,
            pendingPricing,
            totalSavings,
            avgTimeToSell: 12 // Simulated
        });

        setRecentActivity(aiLogs);
    };

    const getActionTypeLabel = (type) => {
        const labels = {
            price_suggestion: 'Suggerimento Prezzo',
            description_generation: 'Analisi SEO',
            discount_suggestion: 'Suggerimento Sconto',
            social_post: 'Post Social'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            SEO Medio
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stats.avgSEO}/100
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Target className="w-5 h-5 text-violet-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Ottimizzazioni Pending
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stats.pendingOptimizations}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Valore Ottimizzato
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        €{stats.totalSavings.toFixed(0)}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Prezzi Pending
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stats.pendingPricing}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Attività AI Recente
                </h3>
                <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                        >
                            <TrendingUp className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {getActionTypeLabel(activity.action_type)}
                                    </span>
                                    <Badge className={
                                        activity.status === 'approved' || activity.status === 'auto_approved'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : activity.status === 'pending'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-700'
                                    }>
                                        {activity.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(activity.created_date).toLocaleString('it-IT')} • {activity.credits_used} crediti
                                </p>
                            </div>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="text-center text-slate-500 py-8">
                            Nessuna attività recente
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}