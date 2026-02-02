import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, TrendingUp, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import AIInsightsDashboard from '@/components/ai-optimization/AIInsightsDashboard';
import SEOOptimizer from '@/components/ai-optimization/SEOOptimizer';
import CompetitorAnalysis from '@/components/ai-optimization/CompetitorAnalysis';
import DynamicPricing from '@/components/ai-optimization/DynamicPricing';
import AIDisclaimer from '@/components/compliance/AIDisclaimer';
import ItemCard from '@/components/items/ItemCard';

export default function AIOptimization() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [items, searchTerm, statusFilter]);

    const loadItems = async () => {
        const data = await base44.entities.Item.list('-created_date');
        setItems(data);
    };

    const filterItems = () => {
        let filtered = items;

        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        setFilteredItems(filtered);
    };

    if (selectedItem) {
        return (
            <div className="space-y-6">
                <Button 
                    variant="ghost" 
                    onClick={() => setSelectedItem(null)}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Torna alla Lista
                </Button>

                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {selectedItem.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Ottimizzazione AI Completa
                        </p>
                    </div>
                </div>

                <AIDisclaimer />

                <Tabs defaultValue="seo" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                        <TabsTrigger value="seo">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            SEO
                        </TabsTrigger>
                        <TabsTrigger value="competitor">
                            <Target className="w-4 h-4 mr-2" />
                            Competitor
                        </TabsTrigger>
                        <TabsTrigger value="pricing">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Pricing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="seo">
                        <SEOOptimizer 
                            item={selectedItem} 
                            onUpdate={loadItems}
                        />
                    </TabsContent>

                    <TabsContent value="competitor">
                        <CompetitorAnalysis item={selectedItem} />
                    </TabsContent>

                    <TabsContent value="pricing">
                        <DynamicPricing 
                            item={selectedItem}
                            onUpdate={loadItems}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                    >
                        AI Optimization Hub
                    </motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        SEO, Analisi Competitiva e Pricing Dinamico
                    </p>
                </div>
            </div>

            <AIDisclaimer />

            <AIInsightsDashboard />

            {/* Filters */}
            <div className="flex gap-3">
                <Input
                    placeholder="Cerca articolo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti gli Stati</SelectItem>
                        <SelectItem value="in_vendita">In Vendita</SelectItem>
                        <SelectItem value="in_magazzino">In Magazzino</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedItem(item)}
                        className="cursor-pointer"
                    >
                        <ItemCard item={item} />
                    </motion.div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Nessun articolo trovato</p>
                </div>
            )}
        </div>
    );
}