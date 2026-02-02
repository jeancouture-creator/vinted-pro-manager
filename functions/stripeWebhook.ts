import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                Deno.env.get('STRIPE_WEBHOOK_SECRET')
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        console.log('Stripe webhook event:', event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata.user_id;
                const plan = session.metadata.plan;
                
                // Update user subscription
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_plan: plan,
                    subscription_status: 'active',
                    subscription_started_at: new Date().toISOString().split('T')[0],
                    ai_credits_limit: plan === 'pro' ? 500 : 2000
                });
                
                // Log subscription history
                await base44.asServiceRole.entities.SubscriptionHistory.create({
                    user_id: userId,
                    action: 'upgrade',
                    to_plan: plan,
                    amount: session.amount_total / 100
                });
                
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const userId = subscription.metadata.user_id;
                const plan = subscription.metadata.plan;
                
                // Create invoice record
                await base44.asServiceRole.entities.Invoice.create({
                    user_id: userId,
                    stripe_invoice_id: invoice.id,
                    amount: invoice.amount_paid / 100,
                    currency: invoice.currency.toUpperCase(),
                    status: 'paid',
                    plan: plan,
                    period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
                    period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
                    invoice_pdf: invoice.invoice_pdf,
                    paid_date: new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                });
                
                // Reset AI credits monthly
                await base44.asServiceRole.entities.User.update(userId, {
                    ai_credits_used: 0
                });
                
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userId = subscription.metadata.user_id;
                
                // Downgrade to free
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_plan: 'free',
                    subscription_status: 'cancelled',
                    ai_credits_limit: 10
                });
                
                await base44.asServiceRole.entities.SubscriptionHistory.create({
                    user_id: userId,
                    action: 'cancel',
                    to_plan: 'free'
                });
                
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const userId = subscription.metadata.user_id;
                
                const status = subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trial' : 'expired';
                
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_status: status
                });
                
                break;
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});