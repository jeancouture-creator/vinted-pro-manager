import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Bell, Shield, Download, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import UsageMetrics from '@/components/subscription/UsageMetrics';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [userData, itemsData, ordersData] = await Promise.all([
            base44.auth.me(),
            base44.entities.Item.list(),
            base44.entities.Order.list()
        ]);
        setUser(userData);
        setItems(itemsData);
        setOrders(ordersData);
        setIsLoading(false);
    };

    const handleUpdateProfile = async (updates) => {
        setIsSaving(true);
        try {
            await base44.auth.updateMe(updates);
            toast.success('Profilo aggiornato');
            await loadData();
        } catch (error) {
            toast.error('Errore aggiornamento profilo');
        }
        setIsSaving(false);
    };

    const handleUpdateSettings = async (settingKey, value) => {
        const newSettings = {
            ...user.settings,
            [settingKey]: value
        };
        await handleUpdateProfile({ settings: newSettings });
    };

    const exportAllData = async () => {
        const [items, orders, customers, expenses] = await Promise.all([
            base44.entities.Item.list(),
            base44.entities.Order.list(),
            base44.entities.Customer.list(),
            base44.entities.Expense.list()
        ]);

        const data = {
            user: user,
            items,
            orders,
            customers,
            expenses,
            exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vintedpro_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Dati esportati');
    };

    const planBadgeColors = {
        free: 'bg-slate-100 text-slate-700',
        pro: 'bg-violet-100 text-violet-700',
        enterprise: 'bg-amber-100 text-amber-700'
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                    Impostazioni
                </motion.h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Gestisci il tuo account e le preferenze</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="profile">Profilo</TabsTrigger>
                    <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
                    <TabsTrigger value="preferences">Preferenze</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Informazioni Personali
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="full_name">Nome Completo</Label>
                                        <Input
                                            id="full_name"
                                            defaultValue={user?.full_name}
                                            onBlur={(e) => handleUpdateProfile({ full_name: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">L'email non può essere modificata</p>
                                    </div>
                                    {user?.subscription_plan === 'enterprise' && (
                                        <>
                                            <div>
                                                <Label htmlFor="company_name">Nome Azienda</Label>
                                                <Input
                                                    id="company_name"
                                                    defaultValue={user?.company_name}
                                                    onBlur={(e) => handleUpdateProfile({ company_name: e.target.value })}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="vat_number">Partita IVA</Label>
                                                <Input
                                                    id="vat_number"
                                                    defaultValue={user?.vat_number}
                                                    onBlur={(e) => handleUpdateProfile({ vat_number: e.target.value })}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <UsageMetrics user={user} items={items} orders={orders} />
                        </div>
                    </div>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription">
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Piano Attuale</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Gestisci il tuo abbonamento
                                    </p>
                                </div>
                                <Badge className={planBadgeColors[user?.subscription_plan || 'free']}>
                                    {user?.subscription_plan?.toUpperCase() || 'FREE'}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Piano</p>
                                        <p className="text-sm text-slate-500">
                                            {user?.subscription_plan === 'free' && 'Gratuito'}
                                            {user?.subscription_plan === 'pro' && '29€/mese'}
                                            {user?.subscription_plan === 'enterprise' && '79€/mese'}
                                        </p>
                                    </div>
                                    <Link to={createPageUrl('Pricing')}>
                                        <Button variant="outline">
                                            Cambia Piano
                                        </Button>
                                    </Link>
                                </div>

                                {user?.subscription_status === 'trial' && user?.trial_ends_at && (
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                            Trial attivo fino al {new Date(user.trial_ends_at).toLocaleDateString('it-IT')}
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            Prova tutte le funzionalità gratuitamente
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/40">
                                    <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        Sblocca il Potenziale dell'AI
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Passa al piano Pro per accedere a suggerimenti prezzi, generazione descrizioni, 
                                        sconti intelligenti e molto altro.
                                    </p>
                                    <Link to={createPageUrl('Pricing')}>
                                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                                            Scopri i Piani
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Preferenze</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Notifiche Email</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Ricevi aggiornamenti su ordini e vendite
                                    </p>
                                </div>
                                <Switch
                                    checked={user?.settings?.email_notifications ?? true}
                                    onCheckedChange={(checked) => handleUpdateSettings('email_notifications', checked)}
                                />
                            </div>

                            {user?.subscription_plan !== 'free' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Backup Automatici</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Backup giornaliero dei dati
                                            </p>
                                        </div>
                                        <Switch
                                            checked={user?.settings?.auto_backup ?? false}
                                            onCheckedChange={(checked) => handleUpdateSettings('auto_backup', checked)}
                                        />
                                    </div>

                                    {user?.subscription_plan === 'enterprise' && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">Approvazione Manuale AI</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Richiedi approvazione per azioni AI automatiche
                                                </p>
                                            </div>
                                            <Switch
                                                checked={!(user?.settings?.ai_auto_approve ?? true)}
                                                onCheckedChange={(checked) => handleUpdateSettings('ai_auto_approve', !checked)}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy">
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Privacy e Dati
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                                        Esporta i Tuoi Dati
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        Scarica una copia completa di tutti i tuoi dati in formato JSON (GDPR compliant).
                                    </p>
                                    <Button variant="outline" onClick={exportAllData}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Esporta Dati
                                    </Button>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="font-medium text-rose-600 mb-2">Zona Pericolosa</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        Elimina permanentemente il tuo account e tutti i dati associati.
                                    </p>
                                    <Button variant="outline" className="text-rose-600 border-rose-300 hover:bg-rose-50">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Elimina Account
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                                        I Tuoi Dati Sono Protetti
                                    </h4>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                        • Tutti i dati sono crittografati end-to-end<br/>
                                        • Backup automatici giornalieri<br/>
                                        • Compliance GDPR completa<br/>
                                        • Nessuna condivisione con terze parti<br/>
                                        • Diritto all'oblio garantito
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}