import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink, Package, ShoppingBag, CheckCircle, RotateCcw, Bookmark } from 'lucide-react';

const statusConfig = {
    in_magazzino: { label: 'In Magazzino', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: Package },
    in_vendita: { label: 'In Vendita', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ShoppingBag },
    venduto: { label: 'Venduto', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    reso: { label: 'Reso', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: RotateCcw },
    riservato: { label: 'Riservato', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Bookmark }
};

const conditionLabels = {
    nuovo_con_cartellino: 'Nuovo con cartellino',
    nuovo_senza_cartellino: 'Nuovo senza cartellino',
    come_nuovo: 'Come nuovo',
    buono: 'Buono',
    usato: 'Usato',
    molto_usato: 'Molto usato'
};

export default function ItemCard({ item, onEdit, onDelete, index = 0 }) {
    const status = statusConfig[item.status] || statusConfig.in_magazzino;
    const StatusIcon = status.icon;
    const margin = item.selling_price - item.purchase_price;
    const marginPercent = item.purchase_price > 0 ? ((margin / item.purchase_price) * 100).toFixed(0) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                {item.photos?.[0] ? (
                    <img 
                        src={item.photos[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <Badge className={`${status.color} border-0 shadow-sm`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                    </Badge>
                </div>
                {item.vinted_url && (
                    <a 
                        href={item.vinted_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </a>
                )}
            </div>
            
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.brand}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {item.size && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Taglia {item.size}
                        </span>
                    )}
                    {item.color && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.color}
                        </span>
                    )}
                    {item.condition && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {conditionLabels[item.condition] || item.condition}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">€{item.selling_price?.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Costo: €{item.purchase_price?.toFixed(2)} • 
                            <span className={margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {' '}+€{margin.toFixed(2)} ({marginPercent}%)
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item)} className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}