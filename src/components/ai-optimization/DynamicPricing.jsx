import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Minus, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DynamicPricing({ item, onUpdate }) {
    const [pricing, setPricing] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const analyzePricing = async () => {
        setIsAnalyzing(true);
        try {
            const response = await base44.functions.invoke('suggestDynamicPricing', {
                item_id: item.id
            });
            setPricing({ ...response.data.pricing, days_on_market: response.data.days_on_market });
            toast.success('Analisi pricing completata');
        } catch (error) {
            toast.error('Errore analisi pricing');
        }
        setIsAnalyzing(false);
    };

    const applyPricing = async () => {
        setIsApplying(true);
        try {
            await base44.entities.Item.update(item.id, {
                selling_price: pricing.suggested_price
            });

            await base44.entities.PricingHistory.update(pricing.id, {
                new_price: pricing.suggested_price,
                status: 'applied',
                applied_at: new Date().toISOString()
            });

            toast.success('Nuovo prezzo applicato');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Errore applicazione prezzo');
        }
        setIsApplying(false);
    };

    const rejectPricing = async () => {
        await base44.entities.PricingHistory.update(pricing.id, {
            status: 'rejected'
        });
        setPricing(null);
        toast.info('Suggerimento prezzo rifiutato');
    };

    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'increase': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
            case 'decrease': return <TrendingDown className="w-5 h-5 text-rose-600" />;
            default: return <Minus className="w-5 h-5 text-slate-600" />;
        }
    };

    const getPriceChange = () => {
        if (!pricing) return null;
        const change = pricing.suggested_price - pricing.previous_price;
        const percentage = ((change / pricing.previous_price) * 100).toFixed(1);
        return { change, percentage };
    };

    return (
        <div className="space-y-4">
            {!pricing ? (
                <Button
                    onClick={analyzePricing}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analisi in corso...
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Suggerisci Prezzo Dinamico
                        </>
                    )}
                </Button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
                >
                    {/* Price Comparison */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Prezzo Attuale</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                €{pricing.previous_price.toFixed(2)}
                            </p>
                        </div>
                        {getActionIcon(pricing.action_type)}
                        <div className="text-right">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Prezzo Suggerito</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                €{pricing.suggested_price.toFixed(2)}
                            </p>
                            {getPriceChange() && (
                                <p className={`text-sm ${getPriceChange().change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {getPriceChange().change >= 0 ? '+' : ''}
                                    €{getPriceChange().change.toFixed(2)} ({getPriceChange().percentage}%)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                            Motivazione
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            {pricing.reason}
                        </p>
                    </div>

                    {/* Factors */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Domanda Mercato</p>
                            <Badge variant="outline">{pricing.factors?.market_demand}</Badge>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Stagionalità</p>
                            <Badge variant="outline">{pricing.factors?.seasonality}</Badge>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Competizione</p>
                            <Badge variant="outline">{pricing.factors?.competition}</Badge>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Giorni In Vendita</p>
                            <Badge variant="outline">{pricing.days_on_market} giorni</Badge>
                        </div>
                    </div>

                    {/* Margin */}
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Margine Stimato
                            </span>
                            <span className="text-lg font-bold text-emerald-600">
                                {pricing.estimated_margin?.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Warning if low margin */}
                    {pricing.estimated_margin < 20 && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Margine inferiore al 20%. Considera se il prezzo è sostenibile per il tuo business.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    {pricing.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                            <Button
                                onClick={applyPricing}
                                disabled={isApplying}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Applica Prezzo
                            </Button>
                            <Button
                                onClick={rejectPricing}
                                variant="outline"
                                className="flex-1"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Rifiuta
                            </Button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}