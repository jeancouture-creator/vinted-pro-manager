import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, RefreshCw, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function DescriptionGenerator({ item, onSelectDescription }) {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState(null);

    const generateDescription = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('generateDescription', { item });
            setDescription(response.data.description);
        } catch (error) {
            console.error('Error generating description:', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-3">
            <Button
                type="button"
                variant="outline"
                onClick={generateDescription}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generazione in corso...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Genera Descrizione con AI
                    </>
                )}
            </Button>

            <AnimatePresence>
                {description && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                    <Wand2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">Descrizione Generata</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={generateDescription}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => onSelectDescription(description)}
                                    className="bg-amber-600 hover:bg-amber-700"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Usa
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}