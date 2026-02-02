import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Activity, Crown, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [aiLogs, setAiLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.role !== 'admin') {
            return;
        }

        const [usersData, subsData, logsData] = await Promise.all([
            base44.asServiceRole.entities.User.list('-created_date'),
            base44.asServiceRole.entities.SubscriptionHistory.list('-created_date', 50),
            base44.asServiceRole.entities.AIActivityLog.list('-created_date', 100)
        ]);
        
        setUsers(usersData);
        setSubscriptions(subsData);
        setAiLogs(logsData);
        setIsLoading(false);
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Accesso Negato
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Solo gli amministratori possono accedere a questa sezione
                    </p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.subscription_status === 'active').length;
    const proUsers = users.filter(u => u.subscription_plan === 'pro').length;
    const enterpriseUsers = users.filter(u => u.subscription_plan === 'enterprise').length;
    const monthlyRevenue = (proUsers * 29) + (enterpriseUsers * 79);
    const totalAICreditsUsed = users.reduce((sum, u) => sum + (u.ai_credits_used || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Admin Dashboard
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestione piattaforma SaaS</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Utenti Totali"
                    value={totalUsers}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Abbonamenti Attivi"
                    value={activeSubscriptions}
                    icon={Activity}
                    color="emerald"
                />
                <StatsCard
                    title="MRR"
                    value={`€${monthlyRevenue}`}
                    icon={DollarSign}
                    color="violet"
                />
                <StatsCard
                    title="AI Credits Usati"
                    value={totalAICreditsUsed}
                    icon={TrendingUp}
                    color="amber"
                />
            </div>

            {/* Users Table */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Utenti</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Piano</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead>AI Credits</TableHead>
                            <TableHead>Registrato</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">
                                    {user.full_name}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        user.subscription_plan === 'enterprise' ? 'bg-amber-100 text-amber-700' :
                                        user.subscription_plan === 'pro' ? 'bg-violet-100 text-violet-700' :
                                        'bg-slate-100 text-slate-700'
                                    }>
                                        {user.subscription_plan?.toUpperCase() || 'FREE'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        user.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        user.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                    }>
                                        {user.subscription_status || 'trial'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {user.ai_credits_used || 0} / {user.ai_credits_limit || 10}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500">
                                    {new Date(user.created_date).toLocaleDateString('it-IT')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Recent AI Activity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Attività AI Recente
                </h3>
                <div className="space-y-2">
                    {aiLogs.slice(0, 10).map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {log.action_type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {new Date(log.created_date).toLocaleString('it-IT')}
                                </p>
                            </div>
                            <Badge className={
                                log.status === 'auto_approved' ? 'bg-emerald-100 text-emerald-700' :
                                log.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                log.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                            }>
                                {log.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}