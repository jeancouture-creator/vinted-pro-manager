import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Megaphone } from 'lucide-react';
import DiscountSuggestions from '@/components/marketing/DiscountSuggestions';
import SocialMediaGenerator from '@/components/marketing/SocialMediaGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Marketing() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                    Marketing AI
                </motion.h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Strumenti intelligenti per aumentare le vendite
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="discounts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="discounts" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Sconti Intelligenti
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        Social Media
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discounts">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                    >
                        <DiscountSuggestions />
                    </motion.div>
                </TabsContent>

                <TabsContent value="social">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                    >
                        <SocialMediaGenerator />
                    </motion.div>
                </TabsContent>
            </Tabs>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/30 border border-violet-200 dark:border-violet-800"
                >
                    <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Analisi intelligente basata su dati storici e tendenze di mercato
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800"
                >
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Aumenta le Vendite</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sconti strategici per velocizzare la rotazione del magazzino
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/30 border border-pink-200 dark:border-pink-800"
                >
                    <Megaphone className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Social Ready</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Contenuti ottimizzati pronti per essere pubblicati
                    </p>
                </motion.div>
            </div>
        </div>
    );
}