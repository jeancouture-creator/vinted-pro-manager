import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Zap, Calendar, TrendingUp } from 'lucide-react';
import SocialScheduler from '@/components/social/SocialScheduler';
import AIDisclaimer from '@/components/compliance/AIDisclaimer';

export default function SocialAutomation() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                    <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Automazioni Social
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Programma e automatizza i tuoi post social con AI
                    </p>
                </div>
            </div>

            <AIDisclaimer />

            <SocialScheduler />

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800"
                >
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Programmazione</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pianifica i tuoi post in anticipo per massimizzare la visibilità
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/30 border border-violet-200 dark:border-violet-800"
                >
                    <Zap className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Generativa</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Contenuti ottimizzati generati automaticamente dall'intelligenza artificiale
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-800"
                >
                    <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Multi-Platform</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pubblica simultaneamente su Instagram, Facebook e TikTok
                    </p>
                </motion.div>
            </div>
        </div>
    );
}