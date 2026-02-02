import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Instagram, Facebook, Video, Sparkles, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import AccountSelector from '@/components/accounts/AccountSelector';

const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    tiktok: Video
};

const toneLabels = {
    casual: 'Casual & Amichevole',
    professional: 'Professionale',
    aggressive: 'Aggressivo & Urgente',
    minimal: 'Minimal & Diretto',
    luxury: 'Lusso & Esclusivo'
};

export default function SocialScheduler() {
    const [posts, setPosts] = useState([]);
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [vintedAccountId, setVintedAccountId] = useState('');
    
    const [formData, setFormData] = useState({
        platform: 'instagram',
        tone: 'casual',
        content: '',
        selectedItems: [],
        scheduledDate: ''
    });
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [postsData, itemsData, userData] = await Promise.all([
            base44.entities.SocialPost.list('-created_date'),
            base44.entities.Item.filter({ status: 'in_vendita' }),
            base44.auth.me()
        ]);
        setPosts(postsData);
        setItems(itemsData);
        setUser(userData);
    };

    const generatePost = async () => {
        if (formData.selectedItems.length === 0) {
            toast.error('Seleziona almeno un articolo');
            return;
        }

        setIsGenerating(true);
        try {
            const selectedItemsData = items.filter(i => formData.selectedItems.includes(i.id));
            const response = await base44.functions.invoke('generateSocialPost', {
                items: selectedItemsData,
                platform: formData.platform,
                tone: formData.tone
            });
            
            setFormData(prev => ({
                ...prev,
                content: response.data.content
            }));
            
            toast.success('Post generato con successo');
        } catch (error) {
            toast.error('Errore generazione post');
        }
        setIsGenerating(false);
    };

    const savePost = async (status = 'draft') => {
        if (!formData.content.trim()) {
            toast.error('Il contenuto del post è obbligatorio');
            return;
        }

        try {
            const postData = {
                user_id: user.id,
                vinted_account_id: vintedAccountId,
                platform: formData.platform,
                tone: formData.tone,
                content: formData.content,
                target_items: formData.selectedItems,
                status: status,
                scheduled_date: formData.scheduledDate || null
            };

            if (editingPost) {
                await base44.entities.SocialPost.update(editingPost.id, postData);
                toast.success('Post aggiornato');
            } else {
                await base44.entities.SocialPost.create(postData);
                toast.success(status === 'scheduled' ? 'Post programmato' : 'Bozza salvata');
            }

            setFormData({
                platform: 'instagram',
                tone: 'casual',
                content: '',
                selectedItems: [],
                scheduledDate: ''
            });
            setEditingPost(null);
            await loadData();
        } catch (error) {
            toast.error('Errore salvataggio post');
        }
    };

    const deletePost = async (postId) => {
        await base44.entities.SocialPost.delete(postId);
        toast.success('Post eliminato');
        await loadData();
    };

    const editPost = (post) => {
        setEditingPost(post);
        setFormData({
            platform: post.platform,
            tone: post.tone,
            content: post.content,
            selectedItems: post.target_items || [],
            scheduledDate: post.scheduled_date?.split('T')[0] || ''
        });
        setVintedAccountId(post.vinted_account_id);
    };

    if (user?.subscription_plan !== 'enterprise') {
        return <UpgradePrompt feature="Programmazione Post Social AI" requiredPlan="enterprise" />;
    }

    const PlatformIcon = platformIcons[formData.platform];

    return (
        <div className="space-y-6">
            {/* Create/Edit Post */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {editingPost ? 'Modifica Post' : 'Nuovo Post Programmato'}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Piattaforma</Label>
                            <Select value={formData.platform} onValueChange={(v) => setFormData({...formData, platform: v})}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tono</Label>
                            <Select value={formData.tone} onValueChange={(v) => setFormData({...formData, tone: v})}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(toneLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Account Vinted</Label>
                        <AccountSelector 
                            value={vintedAccountId}
                            onChange={setVintedAccountId}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Articoli da Promuovere</Label>
                        <div className="mt-2 max-h-32 overflow-y-auto space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            {items.slice(0, 10).map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.selectedItems.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                            setFormData({
                                                ...formData,
                                                selectedItems: checked
                                                    ? [...formData.selectedItems, item.id]
                                                    : formData.selectedItems.filter(id => id !== item.id)
                                            });
                                        }}
                                    />
                                    <span className="text-sm">{item.name} - €{item.selling_price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            onClick={generatePost}
                            disabled={isGenerating || formData.selectedItems.length === 0}
                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isGenerating ? 'Generazione...' : 'Genera con AI'}
                        </Button>
                    </div>

                    <div>
                        <Label>Contenuto Post</Label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            placeholder="Il contenuto del post verrà generato automaticamente dall'AI..."
                            className="mt-1 min-h-[150px]"
                        />
                    </div>

                    <div>
                        <Label>Data e Ora Programmazione (opzionale)</Label>
                        <Input
                            type="datetime-local"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={() => savePost('draft')} variant="outline">
                            Salva Bozza
                        </Button>
                        <Button onClick={() => savePost('scheduled')} className="bg-emerald-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Programma Post
                        </Button>
                        {editingPost && (
                            <Button variant="outline" onClick={() => {
                                setEditingPost(null);
                                setFormData({
                                    platform: 'instagram',
                                    tone: 'casual',
                                    content: '',
                                    selectedItems: [],
                                    scheduledDate: ''
                                });
                            }}>
                                Annulla
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Post Programmati e Bozze
                </h3>
                <div className="space-y-3">
                    {posts.map(post => {
                        const Icon = platformIcons[post.platform];
                        return (
                            <div key={post.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-5 h-5" />
                                            <Badge className={
                                                post.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                                                post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }>
                                                {post.status}
                                            </Badge>
                                            <Badge variant="outline">{toneLabels[post.tone]}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                            {post.content}
                                        </p>
                                        {post.scheduled_date && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(post.scheduled_date).toLocaleString('it-IT')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => editPost(post)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => deletePost(post.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {posts.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            Nessun post programmato
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}