import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StripeCheckout({ plan, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        // Check if running in iframe
        if (window.self !== window.top) {
            toast.error('Il checkout è disponibile solo dall\'app pubblicata', {
                description: 'Apri l\'app in una nuova finestra per procedere con il pagamento'
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('createCheckout', {
                plan: plan.id
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('Checkout URL non disponibile');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Errore durante il checkout');
            setIsLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reindirizzamento...
                </>
            ) : (
                <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procedi al Pagamento
                </>
            )}
        </Button>
    );
}