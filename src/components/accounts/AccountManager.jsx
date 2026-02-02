import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, XCircle, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [accountsData, userData] = await Promise.all([
            base44.entities.VintedAccount.list('-created_date'),
            base44.auth.me()
        ]);
        setAccounts(accountsData);
        setUser(userData);
    };

    const addAccount = async () => {
        if (!newUsername.trim()) return;

        setIsAdding(true);
        try {
            await base44.entities.VintedAccount.create({
                user_id: user.id,
                username: newUsername,
                is_primary: accounts.length === 0,
                connected_date: new Date().toISOString().split('T')[0]
            });
            toast.success('Account aggiunto con successo');
            setNewUsername('');
            await loadData();
        } catch (error) {
            toast.error('Errore aggiunta account');
        }
        setIsAdding(false);
    };

    const setPrimary = async (accountId) => {
        // Remove primary from all accounts
        await Promise.all(
            accounts.map(acc => 
                base44.entities.VintedAccount.update(acc.id, { is_primary: acc.id === accountId })
            )
        );
        toast.success('Account primario aggiornato');
        await loadData();
    };

    const toggleActive = async (account) => {
        await base44.entities.VintedAccount.update(account.id, {
            is_active: !account.is_active
        });
        await loadData();
    };

    const deleteAccount = async (accountId) => {
        if (accounts.length === 1) {
            toast.error('Non puoi eliminare l\'unico account');
            return;
        }
        await base44.entities.VintedAccount.delete(accountId);
        toast.success('Account eliminato');
        await loadData();
    };

    const toggleSetting = async (account, setting) => {
        const newSettings = {
            ...account.settings,
            [setting]: !account.settings?.[setting]
        };
        await base44.entities.VintedAccount.update(account.id, { settings: newSettings });
        await loadData();
    };

    if (user?.subscription_plan !== 'enterprise') {
        return <UpgradePrompt feature="Gestione Multi-Account Vinted" requiredPlan="enterprise" />;
    }

    return (
        <div className="space-y-6">
            {/* Add Account */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Aggiungi Nuovo Account
                </h3>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Label htmlFor="username">Username Vinted</Label>
                        <Input
                            id="username"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            placeholder="es. username_vinted"
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={addAccount}
                            disabled={isAdding || !newUsername.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Aggiungi
                        </Button>
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <div className="grid grid-cols-1 gap-4">
                {accounts.map((account, index) => (
                    <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-6 rounded-2xl border-2 ${
                            account.is_primary
                                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        @{account.username}
                                    </h4>
                                    {account.is_primary && (
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            Primario
                                        </Badge>
                                    )}
                                    {account.is_active ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Package className="w-4 h-4" />
                                        <span>{account.total_items || 0} articoli</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>€{account.total_sales || 0} vendite</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Auto-ripubblicazione
                                        </span>
                                        <Switch
                                            checked={account.settings?.auto_republish || false}
                                            onCheckedChange={() => toggleSetting(account, 'auto_republish')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Auto-boost annunci
                                        </span>
                                        <Switch
                                            checked={account.settings?.auto_boost || false}
                                            onCheckedChange={() => toggleSetting(account, 'auto_boost')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {!account.is_primary && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPrimary(account.id)}
                                    >
                                        Imposta Primario
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleActive(account)}
                                >
                                    {account.is_active ? 'Disattiva' : 'Attiva'}
                                </Button>
                                {!account.is_primary && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-rose-600"
                                        onClick={() => deleteAccount(account.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {accounts.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Nessun account collegato</p>
                </div>
            )}
        </div>
    );
}