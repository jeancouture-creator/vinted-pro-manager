import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import AccountManager from '@/components/accounts/AccountManager';

export default function Accounts() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Account Vinted
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gestisci tutti i tuoi account Vinted
                    </p>
                </div>
            </div>

            <AccountManager />
        </div>
    );
}