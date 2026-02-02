import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown, AlertCircle, Check, Loader2, Clock, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const priorityColors = {
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
};

export default function DiscountSuggestions() {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [appliedItems, setAppliedItems] = useState(new Set());

    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('suggestDiscounts');
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
        setIsLoading(false);
    };

    const applyDiscount = async (suggestion) => {
        try {
            await base44.entities.Item.update(suggestion.item_id, {
                selling_price: suggestion.new_price
            });
            setAppliedItems(prev => new Set([...prev, suggestion.item_id]));
        } catch (error) {
            console.error('Error applying discount:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        Sconti Intelligenti AI
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Suggerimenti automatici per velocizzare le vendite
                    </p>
                </div>
                <Button onClick={loadSuggestions} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analisi...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analizza
                        </>
                    )}
                </Button>
            </div>

            <AnimatePresence>
                {suggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-4"
                    >
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30 border border-rose-200 dark:border-rose-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    <span className="text-sm text-rose-600 dark:text-rose-400">Alta Priorità</span>
                                </div>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{suggestions.high_priority}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-sm text-amber-600 dark:text-amber-400">Oltre 60 Giorni</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{suggestions.summary?.items_over_60_days || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm text-blue-600 dark:text-blue-400">Suggerimenti</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{suggestions.total_suggestions}</p>
                            </div>
                        </div>

                        {/* Suggestions List */}
                        <div className="space-y-3">
                            {suggestions.suggestions?.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Check className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                                    <p>Ottimo! Nessun articolo necessita sconti al momento.</p>
                                </div>
                            ) : (
                                suggestions.suggestions?.map((suggestion, index) => (
                                    <motion.div
                                        key={suggestion.item_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">{suggestion.item_name}</h4>
                                                    <Badge className={priorityColors[suggestion.priority]}>
                                                        {suggestion.priority === 'high' ? 'Urgente' : suggestion.priority === 'medium' ? 'Medio' : 'Basso'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{suggestion.reason}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-500">Prezzo attuale:</span>
                                                        <span className="ml-1 font-semibold line-through text-slate-400">€{suggestion.current_price}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Nuovo prezzo:</span>
                                                        <span className="ml-1 font-bold text-emerald-600">€{suggestion.new_price}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Sconto:</span>
                                                        <span className="ml-1 font-semibold text-rose-600">-{suggestion.suggested_discount}%</span>
                                                    </div>
                                                    <div>
                                                        <Badge variant="outline" className="text-xs">
                                                            Margine: {suggestion.expected_margin}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {appliedItems.has(suggestion.item_id) ? (
                                                    <Button disabled variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20">
                                                        <Check className="w-4 h-4 mr-2 text-emerald-600" />
                                                        Applicato
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        onClick={() => applyDiscount(suggestion)}
                                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                                                    >
                                                        <TrendingDown className="w-4 h-4 mr-2" />
                                                        Applica
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}