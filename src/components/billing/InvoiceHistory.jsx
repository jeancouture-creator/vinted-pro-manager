import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { base44 } from '@/api/base44Client';

export default function InvoiceHistory() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        const data = await base44.entities.Invoice.list('-created_date');
        setInvoices(data);
        setIsLoading(false);
    };

    const downloadInvoice = (invoice) => {
        // In real implementation, this would download the PDF from Stripe
        console.log('Download invoice:', invoice.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Storico Fatture
                    </h3>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                    Caricamento...
                </div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    Nessuna fattura disponibile
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Piano</TableHead>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Importo</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map(invoice => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    {new Date(invoice.created_date).toLocaleDateString('it-IT')}
                                </TableCell>
                                <TableCell>
                                    <Badge className="capitalize">
                                        {invoice.plan}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                    {new Date(invoice.period_start).toLocaleDateString('it-IT')} - {' '}
                                    {new Date(invoice.period_end).toLocaleDateString('it-IT')}
                                </TableCell>
                                <TableCell className="font-semibold">
                                    €{invoice.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        invoice.status === 'paid' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-amber-100 text-amber-700'
                                    }>
                                        {invoice.status === 'paid' ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Pagato
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3 h-3 mr-1" />
                                                In sospeso
                                            </>
                                        )}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => downloadInvoice(invoice)}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </motion.div>
    );
}