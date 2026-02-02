import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StripeCheckout({ plan, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            // In a real implementation, this would create a Stripe checkout session
            // For now, we'll simulate the upgrade
            const user = await base44.auth.me();
            
            const updateData = {
                subscription_plan: plan.id,
                subscription_status: 'active',
                subscription_started_at: new Date().toISOString().split('T')[0],
                ai_credits_limit: plan.id === 'free' ? 10 : plan.id === 'pro' ? 500 : 2000
            };

            await base44.auth.updateMe(updateData);

            // Log subscription change
            await base44.entities.SubscriptionHistory.create({
                user_id: user.id,
                action: plan.id === 'free' ? 'downgrade' : 'upgrade',
                from_plan: user?.subscription_plan || 'free',
                to_plan: plan.id,
                amount: plan.price
            });

            // Create invoice record
            if (plan.price > 0) {
                const today = new Date();
                const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                
                await base44.entities.Invoice.create({
                    user_id: user.id,
                    amount: plan.price,
                    status: 'paid',
                    plan: plan.id,
                    period_start: today.toISOString().split('T')[0],
                    period_end: nextMonth.toISOString().split('T')[0],
                    paid_date: new Date().toISOString()
                });
            }

            toast.success(`Piano ${plan.name} attivato con successo!`);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error('Errore durante il checkout');
            console.error(error);
        }
        setIsLoading(false);
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
                    Elaborazione...
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