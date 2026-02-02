import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Instagram, Facebook, Video, Copy, Check, Loader2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    tiktok: Video
};

export default function SocialMediaGenerator() {
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [platform, setPlatform] = useState('instagram');
    const [tone, setTone] = useState('friendly');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState(null);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [itemsData, userData] = await Promise.all([
            base44.entities.Item.list(),
            base44.auth.me()
        ]);
        setItems(itemsData.filter(i => i.status === 'in_vendita'));
        setUser(userData);
    };

    const generatePost = async () => {
        if (selectedItems.length === 0) return;
        
        if (!hasFeatureAccess(user, 'social_posts')) {
            return;
        }
        
        setIsGenerating(true);
        try {
            const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
            const response = await base44.functions.invoke('generateSocialPost', {
                items: selectedItemsData,
                platform,
                tone
            });
            setGeneratedPost(response.data);
            
            // Log AI usage
            await base44.entities.AIActivityLog.create({
                user_id: user.id,
                action_type: 'social_post',
                output_data: response.data.content,
                credits_used: 2
            });
            
            // Update credits
            await base44.auth.updateMe({
                ai_credits_used: (user.ai_credits_used || 0) + 2
            });
        } catch (error) {
            console.error('Error generating post:', error);
        }
        setIsGenerating(false);
    };

    if (!user) return null;

    if (!hasFeatureAccess(user, 'social_posts')) {
        return <UpgradePrompt feature="Generazione post social AI" requiredPlan="pro" />;
    }

    const copyToClipboard = () => {
        if (generatedPost) {
            navigator.clipboard.writeText(generatedPost.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const toggleItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const PlatformIcon = platformIcons[platform];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                    <Wand2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Genera Post Social</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Crea contenuti ottimizzati per i social media</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Piattaforma</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instagram">
                                <div className="flex items-center gap-2">
                                    <Instagram className="w-4 h-4" />
                                    Instagram
                                </div>
                            </SelectItem>
                            <SelectItem value="facebook">
                                <div className="flex items-center gap-2">
                                    <Facebook className="w-4 h-4" />
                                    Facebook
                                </div>
                            </SelectItem>
                            <SelectItem value="tiktok">
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    TikTok/Shorts
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Tono</Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="friendly">Amichevole</SelectItem>
                            <SelectItem value="professional">Professionale</SelectItem>
                            <SelectItem value="enthusiastic">Entusiasta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="mb-2 block">Seleziona Articoli ({selectedItems.length})</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    {items.slice(0, 10).map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                            <Checkbox 
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => toggleItem(item.id)}
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                {item.name} - €{item.selling_price}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Button 
                onClick={generatePost} 
                disabled={isGenerating || selectedItems.length === 0}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generazione in corso...
                    </>
                ) : (
                    <>
                        <PlatformIcon className="w-4 h-4 mr-2" />
                        Genera Post
                    </>
                )}
            </Button>

            <AnimatePresence>
                {generatedPost && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <PlatformIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                <span className="font-semibold text-slate-900 dark:text-white">Post Generato</span>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={copyToClipboard}
                                className={copied ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-1 text-emerald-600" />
                                        Copiato
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copia
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 mb-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {generatedPost.content}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{generatedPost.wordCount} parole</span>
                            <span>{generatedPost.characterCount} caratteri</span>
                            <span>{generatedPost.hashtags?.length || 0} hashtag</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}