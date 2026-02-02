import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ShoppingCart, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ items: [], orders: [], customers: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ items: [], orders: [], customers: [] });
            return;
        }

        const searchTimer = setTimeout(async () => {
            setIsSearching(true);
            const [items, orders, customers] = await Promise.all([
                base44.entities.Item.list(),
                base44.entities.Order.list(),
                base44.entities.Customer.list()
            ]);

            const lowerQuery = query.toLowerCase();
            
            setResults({
                items: items.filter(i => 
                    i.name?.toLowerCase().includes(lowerQuery) || 
                    i.brand?.toLowerCase().includes(lowerQuery)
                ).slice(0, 5),
                orders: orders.filter(o => 
                    o.order_number?.toLowerCase().includes(lowerQuery) ||
                    o.item_name?.toLowerCase().includes(lowerQuery) ||
                    o.customer_name?.toLowerCase().includes(lowerQuery)
                ).slice(0, 5),
                customers: customers.filter(c => 
                    c.full_name?.toLowerCase().includes(lowerQuery) ||
                    c.vinted_username?.toLowerCase().includes(lowerQuery)
                ).slice(0, 5)
            });
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [query]);

    const totalResults = results.items.length + results.orders.length + results.customers.length;

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Cerca articoli, ordini, clienti..."
                    className="pl-10 pr-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 w-full md:w-80"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && query.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                        {isSearching ? (
                            <div className="p-4 text-center text-slate-500">Ricerca in corso...</div>
                        ) : totalResults === 0 ? (
                            <div className="p-4 text-center text-slate-500">Nessun risultato trovato</div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {results.items.length > 0 && (
                                    <div className="p-2">
                                        <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase">Articoli</div>
                                        {results.items.map(item => (
                                            <Link
                                                key={item.id}
                                                to={createPageUrl('Inventory')}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-500">{item.brand} • €{item.selling_price}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {results.orders.length > 0 && (
                                    <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                        <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase">Ordini</div>
                                        {results.orders.map(order => (
                                            <Link
                                                key={order.id}
                                                to={createPageUrl('Orders')}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                <ShoppingCart className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{order.item_name || order.order_number}</p>
                                                    <p className="text-xs text-slate-500">{order.customer_name} • €{order.sale_price}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {results.customers.length > 0 && (
                                    <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                        <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase">Clienti</div>
                                        {results.customers.map(customer => (
                                            <Link
                                                key={customer.id}
                                                to={createPageUrl('Customers')}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{customer.full_name}</p>
                                                    <p className="text-xs text-slate-500">@{customer.vinted_username}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}