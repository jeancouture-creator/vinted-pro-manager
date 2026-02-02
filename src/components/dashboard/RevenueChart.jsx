import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function RevenueChart({ data, title = "Andamento Guadagni" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `€${v}`} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                            formatter={(value) => [`€${value.toFixed(2)}`, '']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="guadagni" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            name="Guadagni"
                        />
                        <Area 
                            type="monotone" 
                            dataKey="spese" 
                            stroke="#f43f5e" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorExpense)" 
                            name="Spese"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}