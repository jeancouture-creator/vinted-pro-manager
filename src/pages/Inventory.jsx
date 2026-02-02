import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Grid, List, Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import ItemCard from '@/components/items/ItemCard';
import ItemForm from '@/components/items/ItemForm';
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

const categories = [
    { value: 'all', label: 'Tutte le categorie' },
    { value: 'giacche', label: 'Giacche' },
    { value: 'pantaloni', label: 'Pantaloni' },
    { value: 'maglie', label: 'Maglie' },
    { value: 'camicie', label: 'Camicie' },
    { value: 'felpe', label: 'Felpe' },
    { value: 'vestiti', label: 'Vestiti' },
    { value: 'gonne', label: 'Gonne' },
    { value: 'scarpe', label: 'Scarpe' },
    { value: 'borse', label: 'Borse' },
    { value: 'accessori', label: 'Accessori' },
    { value: 'cappelli', label: 'Cappelli' },
    { value: 'altro', label: 'Altro' }
];

const statuses = [
    { value: 'all', label: 'Tutti gli stati' },
    { value: 'in_magazzino', label: 'In Magazzino' },
    { value: 'in_vendita', label: 'In Vendita' },
    { value: 'venduto', label: 'Venduto' },
    { value: 'reso', label: 'Reso' },
    { value: 'riservato', label: 'Riservato' }
];

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    
    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [sortBy, setSortBy] = useState('created_date');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const data = await base44.entities.Item.list('-created_date');
        setItems(data);
        setIsLoading(false);
    };

    const handleSubmit = async (formData) => {
        if (editingItem) {
            await base44.entities.Item.update(editingItem.id, formData);
        } else {
            await base44.entities.Item.create(formData);
        }
        await loadItems();
        setShowForm(false);
        setEditingItem(null);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (deleteItem) {
            await base44.entities.Item.delete(deleteItem.id);
            await loadItems();
            setDeleteItem(null);
        }
    };

    const exportToCSV = () => {
        const headers = ['Nome', 'Brand', 'Categoria', 'Taglia', 'Colore', 'Prezzo Acquisto', 'Prezzo Vendita', 'Stato'];
        const csvContent = [
            headers.join(','),
            ...filteredItems.map(item => [
                `"${item.name || ''}"`,
                `"${item.brand || ''}"`,
                `"${item.category || ''}"`,
                `"${item.size || ''}"`,
                `"${item.color || ''}"`,
                item.purchase_price || 0,
                item.selling_price || 0,
                `"${item.status || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `magazzino_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Apply filters
    const filteredItems = items.filter(item => {
        const matchesSearch = !search || 
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.brand?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || item.category === category;
        const matchesStatus = status === 'all' || item.status === status;
        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'price_asc': return (a.selling_price || 0) - (b.selling_price || 0);
            case 'price_desc': return (b.selling_price || 0) - (a.selling_price || 0);
            case 'name': return (a.name || '').localeCompare(b.name || '');
            case 'margin': 
                const marginA = (a.selling_price || 0) - (a.purchase_price || 0);
                const marginB = (b.selling_price || 0) - (b.purchase_price || 0);
                return marginB - marginA;
            default: return new Date(b.created_date) - new Date(a.created_date);
        }
    });

    // Stats
    const totalValue = filteredItems.reduce((sum, i) => sum + (i.selling_price || 0), 0);
    const totalCost = filteredItems.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
    const potentialProfit = totalValue - totalCost;

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
                        Magazzino
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredItems.length} articoli</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Esporta CSV
                    </Button>
                    <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Articolo
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Valore Totale</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{totalValue.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Costo Totale</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">€{totalCost.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Profitto Potenziale</p>
                    <p className="text-2xl font-bold text-emerald-600">€{potentialProfit.toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cerca per nome o brand..."
                        className="pl-10"
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Ordina per" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_date">Più recenti</SelectItem>
                        <SelectItem value="price_desc">Prezzo ↓</SelectItem>
                        <SelectItem value="price_asc">Prezzo ↑</SelectItem>
                        <SelectItem value="margin">Margine</SelectItem>
                        <SelectItem value="name">Nome</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex gap-1">
                    <Button 
                        variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant={viewMode === 'list' ? 'default' : 'ghost'} 
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Active Filters */}
            {(category !== 'all' || status !== 'all' || search) && (
                <div className="flex flex-wrap gap-2">
                    {search && (
                        <Badge variant="secondary" className="gap-1">
                            Ricerca: {search}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                        </Badge>
                    )}
                    {category !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {categories.find(c => c.value === category)?.label}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('all')} />
                        </Badge>
                    )}
                    {status !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {statuses.find(s => s.value === status)?.label}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setStatus('all')} />
                        </Badge>
                    )}
                </div>
            )}

            {/* Items Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800 h-80 animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Filter className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nessun articolo trovato</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Prova a modificare i filtri o aggiungi un nuovo articolo</p>
                    <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi Articolo
                    </Button>
                </div>
            ) : (
                <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, index) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onDelete={setDeleteItem}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <ItemForm
                        item={editingItem}
                        onSubmit={handleSubmit}
                        onClose={() => { setShowForm(false); setEditingItem(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare questo articolo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. L'articolo "{deleteItem?.name}" verrà eliminato permanentemente.
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