import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function PriceSuggestion({ item, onSelectPrice }) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState(null);

    const getSuggestion = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('suggestPrice', { item });
            setSuggestion(response.data);
        } catch (error) {
            console.error('Error getting price suggestion:', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="outline"
                onClick={getSuggestion}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisi in corso...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Suggerisci Prezzo con AI
                    </>
                )}
            </Button>

            <AnimatePresence>
                {suggestion && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40">
                                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">Analisi AI Completata</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{suggestion.reasoning}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => onSelectPrice(suggestion.priceRange.min)}
                                className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-colors text-center"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Minimo</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">€{suggestion.priceRange.min}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectPrice(suggestion.priceRange.suggested)}
                                className="p-3 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-colors text-center"
                            >
                                <p className="text-xs text-violet-100">Consigliato</p>
                                <p className="text-lg font-bold">€{suggestion.priceRange.suggested}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectPrice(suggestion.priceRange.max)}
                                className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-colors text-center"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Massimo</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">€{suggestion.priceRange.max}</p>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Profitto stimato:</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-600">€{suggestion.expectedProfit}</p>
                                <p className="text-xs text-slate-500">+{suggestion.profitMargin}% margine</p>
                            </div>
                        </div>

                        {suggestion.analysis && (
                            <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-blue-900 dark:text-blue-100">
                                            {suggestion.analysis.similarItemsFound > 0 
                                                ? `${suggestion.analysis.similarItemsFound} articoli simili venduti. Prezzo medio: €${suggestion.analysis.averageMarketPrice}`
                                                : 'Nessun articolo simile trovato. Prezzo basato su margini standard.'}
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                                            Competizione: <span className="font-medium">{
                                                suggestion.analysis.competitionLevel === 'high' ? 'Alta' :
                                                suggestion.analysis.competitionLevel === 'medium' ? 'Media' : 'Bassa'
                                            }</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}