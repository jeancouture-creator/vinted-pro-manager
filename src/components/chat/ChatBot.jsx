import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && !conversationId) {
            initConversation();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversationId) return;
        
        const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
            setMessages(data.messages || []);
        });

        return () => unsubscribe();
    }, [conversationId]);

    const initConversation = async () => {
        const conversation = await base44.agents.createConversation({
            agent_name: 'vinted_assistant',
            metadata: { name: 'Chat Assistente' }
        });
        setConversationId(conversation.id);
        setMessages([{
            role: 'assistant',
            content: 'Ciao! 👋 Sono il tuo assistente per il gestionale Vinted. Posso aiutarti con:\n\n• Inserimento e gestione articoli\n• Suggerimenti sui prezzi\n• Analisi vendite e profitti\n• Domande sul gestionale\n\nCome posso aiutarti oggi?'
        }]);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        const conversation = await base44.agents.getConversation(conversationId);
        await base44.agents.addMessage(conversation, {
            role: 'user',
            content: userMessage
        });

        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
                <MessageCircle className="w-6 h-6" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Assistente Vinted</h3>
                                    <p className="text-xs text-emerald-100">Sempre disponibile</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                                        msg.role === 'user' 
                                            ? 'bg-emerald-600 text-white rounded-br-md' 
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md'
                                    }`}>
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="text-sm">{msg.content}</p>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-bl-md">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Scrivi un messaggio..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button 
                                    onClick={handleSend} 
                                    disabled={!input.trim() || isLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}