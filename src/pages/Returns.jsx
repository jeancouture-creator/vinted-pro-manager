import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, AlertCircle, CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { base44 } from '@/api/base44Client';
import ReturnForm from '@/components/returns/ReturnForm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig = {
    requested: { label: 'Richiesto', color: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Approvato', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    rejected: { label: 'Rifiutato', color: 'bg-rose-100 text-rose-700', icon: XCircle },
    received: { label: 'Ricevuto', color: 'bg-violet-100 text-violet-700', icon: CheckCircle },
    refunded: { label: 'Rimborsato', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
};

const reasonLabels = {
    not_as_described: 'Non come descritto',
    damaged: 'Danneggiato',
    wrong_item: 'Articolo sbagliato',
    changed_mind: 'Ripensamento',
    other: 'Altro'
};

export default function Returns() {
    const [returns, setReturns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReturn, setEditingReturn] = useState(null);
    const [deleteReturn, setDeleteReturn] = useState(null);

    useEffect(() => {
        loadReturns();
    }, []);

    const loadReturns = async () => {
        const data = await base44.entities.Return.list('-created_date');
        setReturns(data);
        setIsLoading(false);
    };

    const handleSubmit = async (formData) => {
        if (editingReturn) {
            await base44.entities.Return.update(editingReturn.id, formData);
        } else {
            await base44.entities.Return.create(formData);
        }
        await loadReturns();
        setShowForm(false);
        setEditingReturn(null);
    };

    const handleDelete = async () => {
        if (deleteReturn) {
            await base44.entities.Return.delete(deleteReturn.id);
            await loadReturns();
            setDeleteReturn(null);
        }
    };

    // Stats
    const totalReturns = returns.length;
    const totalRefunded = returns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);
    const pendingReturns = returns.filter(r => r.status === 'requested' || r.status === 'approved').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        Resi e Reclami
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{totalReturns} resi totali</p>
                </div>
                <Button onClick={() => { setEditingReturn(null); setShowForm(true); }} className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registra Reso
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                            <RotateCcw className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Resi Totali</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalReturns}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">In Gestione</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingReturns}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Rimborsati</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-600">€{totalRefunded.toFixed(2)}</p>
                </div>
            </div>

            {/* Returns Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Articolo</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Importo</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                        <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : returns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <RotateCcw className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                        <p className="text-slate-500 dark:text-slate-400">Nessun reso registrato</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            returns.map((returnItem) => {
                                const status = statusConfig[returnItem.status] || statusConfig.requested;
                                const StatusIcon = status.icon;
                                return (
                                    <TableRow key={returnItem.id}>
                                        <TableCell>
                                            {returnItem.return_date ? format(new Date(returnItem.return_date), 'd MMM yyyy', { locale: it }) : '-'}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900 dark:text-white">
                                            {returnItem.item_name}
                                        </TableCell>
                                        <TableCell>
                                            {returnItem.customer_name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {reasonLabels[returnItem.reason] || returnItem.reason}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold text-rose-600">
                                            €{returnItem.refund_amount?.toFixed(2) || '0.00'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${status.color} border-0`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    onClick={() => { setEditingReturn(returnItem); setShowForm(true); }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    className="text-rose-600"
                                                    onClick={() => setDeleteReturn(returnItem)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <ReturnForm
                        returnItem={editingReturn}
                        onSubmit={handleSubmit}
                        onClose={() => { setShowForm(false); setEditingReturn(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteReturn} onOpenChange={() => setDeleteReturn(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare questo reso?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            Elimina
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}