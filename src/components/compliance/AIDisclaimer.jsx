import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function AIDisclaimer() {
    return (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        Funzionalità AI
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        I suggerimenti forniti dall'AI sono puramente indicativi e basati su analisi automatiche. 
                        Verifica sempre la correttezza dei contenuti generati prima di pubblicarli. 
                        Non siamo responsabili per l'uso improprio delle automazioni AI.
                    </p>
                </div>
            </div>
        </div>
    );
}