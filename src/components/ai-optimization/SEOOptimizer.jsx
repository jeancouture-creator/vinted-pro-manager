import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Check, X, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SEOOptimizer({ item, onUpdate }) {
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const analyzeSEO = async () => {
        setIsAnalyzing(true);
        try {
            const response = await base44.functions.invoke('analyzeItemSEO', {
                item_id: item.id
            });
            setAnalysis(response.data.analysis);
            toast.success('Analisi SEO completata');
        } catch (error) {
            toast.error('Errore analisi SEO');
        }
        setIsAnalyzing(false);
    };

    const applySEO = async () => {
        setIsApplying(true);
        try {
            await base44.entities.Item.update(item.id, {
                name: analysis.optimized_title,
                description: analysis.optimized_description
            });

            await base44.entities.SEOAnalysis.update(analysis.id, {
                status: 'approved',
                applied_at: new Date().toISOString()
            });

            toast.success('Ottimizzazioni SEO applicate');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Errore applicazione SEO');
        }
        setIsApplying(false);
    };

    const rejectSEO = async () => {
        await base44.entities.SEOAnalysis.update(analysis.id, {
            status: 'rejected'
        });
        setAnalysis(null);
        toast.info('Suggerimenti SEO rifiutati');
    };

    const getSEOScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    return (
        <div className="space-y-4">
            {!analysis ? (
                <Button
                    onClick={analyzeSEO}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analisi in corso...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analizza SEO con AI
                        </>
                    )}
                </Button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800"
                >
                    {/* SEO Score */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Punteggio SEO</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Ottimizzazione attuale</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${getSEOScoreColor(analysis.seo_score)}`}>
                                {analysis.seo_score}/100
                            </div>
                            <Progress value={analysis.seo_score} className="w-24 mt-2" />
                        </div>
                    </div>

                    {/* Optimized Title */}
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Titolo Ottimizzato
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    navigator.clipboard.writeText(analysis.optimized_title);
                                    toast.success('Copiato');
                                }}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {analysis.optimized_title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-through">
                            {analysis.original_title}
                        </p>
                    </div>

                    {/* Optimized Description */}
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Descrizione Ottimizzata
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    navigator.clipboard.writeText(analysis.optimized_description);
                                    toast.success('Copiato');
                                }}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                            {analysis.optimized_description}
                        </p>
                    </div>

                    {/* Keywords */}
                    <div>
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Keyword Principali
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {analysis.primary_keywords?.map((kw, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-700">
                                    {kw}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Hashtag Suggeriti
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {analysis.suggested_hashtags?.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-cyan-600">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div>
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Suggerimenti
                        </h5>
                        <ul className="space-y-1">
                            {analysis.improvements?.map((imp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    {analysis.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
                            <Button
                                onClick={applySEO}
                                disabled={isApplying}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Applica Ottimizzazioni
                            </Button>
                            <Button
                                onClick={rejectSEO}
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