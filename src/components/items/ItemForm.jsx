import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PriceSuggestion from './PriceSuggestion';
import DescriptionGenerator from './DescriptionGenerator';

const categories = [
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
    { value: 'intimo', label: 'Intimo' },
    { value: 'costumi', label: 'Costumi' },
    { value: 'altro', label: 'Altro' }
];

const conditions = [
    { value: 'nuovo_con_cartellino', label: 'Nuovo con cartellino' },
    { value: 'nuovo_senza_cartellino', label: 'Nuovo senza cartellino' },
    { value: 'come_nuovo', label: 'Come nuovo' },
    { value: 'buono', label: 'Buono' },
    { value: 'usato', label: 'Usato' },
    { value: 'molto_usato', label: 'Molto usato' }
];

const statuses = [
    { value: 'in_magazzino', label: 'In Magazzino' },
    { value: 'in_vendita', label: 'In Vendita' },
    { value: 'venduto', label: 'Venduto' },
    { value: 'reso', label: 'Reso' },
    { value: 'riservato', label: 'Riservato' }
];

export default function ItemForm({ item, onSubmit, onClose }) {
    const [formData, setFormData] = useState(item || {
        name: '',
        category: '',
        brand: '',
        condition: '',
        description: '',
        size: '',
        color: '',
        material: '',
        purchase_price: '',
        selling_price: '',
        status: 'in_magazzino',
        photos: [],
        vinted_url: '',
        notes: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setIsUploading(true);
        const newPhotos = [...(formData.photos || [])];
        
        for (const file of files) {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            newPhotos.push(file_url);
        }
        
        setFormData(prev => ({ ...prev, photos: newPhotos }));
        setIsUploading(false);
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({
            ...formData,
            purchase_price: parseFloat(formData.purchase_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0
        });
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {item ? 'Modifica Articolo' : 'Nuovo Articolo'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        {/* Photos */}
                        <div>
                            <Label className="mb-2 block">Foto</Label>
                            <div className="flex flex-wrap gap-3">
                                {formData.photos?.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={photo} 
                                            alt={`Foto ${index + 1}`}
                                            className="w-24 h-24 object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-slate-400" />
                                            <span className="text-xs text-slate-400 mt-1">Aggiungi</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Nome Articolo *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={e => handleChange('brand', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Categoria *</Label>
                                <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Condizioni</Label>
                                <Select value={formData.condition} onValueChange={v => handleChange('condition', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditions.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Stato</Label>
                                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleziona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="size">Taglia</Label>
                                <Input
                                    id="size"
                                    value={formData.size}
                                    onChange={e => handleChange('size', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="color">Colore</Label>
                                <Input
                                    id="color"
                                    value={formData.color}
                                    onChange={e => handleChange('color', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="material">Materiale</Label>
                                <Input
                                    id="material"
                                    value={formData.material}
                                    onChange={e => handleChange('material', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="purchase_price">Prezzo Acquisto (€) *</Label>
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        step="0.01"
                                        value={formData.purchase_price}
                                        onChange={e => handleChange('purchase_price', e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="selling_price">Prezzo Vendita (€) *</Label>
                                    <Input
                                        id="selling_price"
                                        type="number"
                                        step="0.01"
                                        value={formData.selling_price}
                                        onChange={e => handleChange('selling_price', e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            
                            {formData.purchase_price && formData.category && (
                                <PriceSuggestion 
                                    item={formData} 
                                    onSelectPrice={(price) => handleChange('selling_price', price)}
                                />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Descrizione</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                                rows={3}
                                className="mt-1"
                            />
                            <DescriptionGenerator 
                                item={formData} 
                                onSelectDescription={(desc) => handleChange('description', desc)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="vinted_url">Link Vinted</Label>
                            <Input
                                id="vinted_url"
                                value={formData.vinted_url}
                                onChange={e => handleChange('vinted_url', e.target.value)}
                                placeholder="https://www.vinted.it/items/..."
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Note</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={e => handleChange('notes', e.target.value)}
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annulla
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvataggio...
                                </>
                            ) : (
                                item ? 'Salva Modifiche' : 'Aggiungi Articolo'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}