import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "emerald" }) {
    const colors = {
        emerald: "from-emerald-500 to-emerald-600",
        blue: "from-blue-500 to-blue-600",
        amber: "from-amber-500 to-amber-600",
        rose: "from-rose-500 to-rose-600",
        violet: "from-violet-500 to-violet-600"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                    {trend && (
                        <div className={`mt-2 flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${colors[color]} opacity-10`} />
        </motion.div>
    );
}