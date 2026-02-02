import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CompetitorAnalysis({ item }) {
    const [insight, setInsight] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await base44.functions.invoke('analyzeCompetitors', {
                item_id: item.id
            });
            setInsight(response.data.insight);
            toast.success('Analisi competitiva completata');
        } catch (error) {
            toast.error('Errore analisi competitiva');
        }
        setIsAnalyzing(false);
    };

    const getPositionBadge = (position) => {
        const configs = {
            above_market: { label: 'Sopra Mercato', className: 'bg-amber-100 text-amber-700' },
            in_market: { label: 'Nel Mercato', className: 'bg-emerald-100 text-emerald-700' },
            below_market: { label: 'Sotto Mercato', className: 'bg-blue-100 text-blue-700' },
            underpriced: { label: 'Sottocosto', className: 'bg-rose-100 text-rose-700' }
        };
        return configs[position] || configs.in_market;
    };

    const getDemandBadge = (level) => {
        const configs = {
            high: { label: 'Alta Domanda', className: 'bg-emerald-100 text-emerald-700' },
            medium: { label: 'Domanda Media', className: 'bg-amber-100 text-amber-700' },
            low: { label: 'Bassa Domanda', className: 'bg-slate-100 text-slate-700' }
        };
        return configs[level] || configs.medium;
    };

    return (
        <div className="space-y-4">
            {!insight ? (
                <Button
                    onClick={analyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analisi in corso...
                        </>
                    ) : (
                        <>
                            <Target className="w-4 h-4 mr-2" />
                            Analizza Competitor
                        </>
                    )}
                </Button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Market Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-violet-600" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Prezzo Medio Mercato
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                €{insight.market_avg_price?.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Range: €{insight.price_range_min} - €{insight.price_range_max}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Tempo Medio Vendita
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {insight.avg_days_to_sell} giorni
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {insight.total_similar_items} articoli simili
                            </div>
                        </div>
                    </div>

                    {/* Position & Demand */}
                    <div className="flex gap-2">
                        <Badge className={getPositionBadge(insight.competitive_position).className}>
                            {getPositionBadge(insight.competitive_position).label}
                        </Badge>
                        <Badge className={getDemandBadge(insight.demand_level).className}>
                            {getDemandBadge(insight.demand_level).label}
                        </Badge>
                    </div>

                    {/* Winning Strategies */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            Strategie Vincenti Competitor
                        </h5>
                        <ul className="space-y-2">
                            {insight.winning_strategies?.map((strategy, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                    {strategy}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Differentiation */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-600" />
                            Opportunità Differenziazione
                        </h5>
                        <ul className="space-y-2">
                            {insight.differentiation_opportunities?.map((opp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                    {opp}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </div>
    );
}