import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GDPRBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('gdpr_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr_consent', 'accepted');
        localStorage.setItem('gdpr_consent_date', new Date().toISOString());
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4"
                >
                    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                    Privacy e Utilizzo dei Dati
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Utilizziamo i tuoi dati solo per fornirti il servizio e migliorare la tua esperienza. 
                                    Non condividiamo mai i tuoi dati con terze parti. 
                                    Puoi esportare o eliminare i tuoi dati in qualsiasi momento dalle impostazioni.
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700">
                                        Accetta
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsVisible(false)}>
                                        Chiudi
                                    </Button>
                                </div>
                            </div>
                            <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}