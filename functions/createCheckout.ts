import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-12-18.acacia'
});

const PRICE_IDS = {
    pro: 'price_1SwK3i53UyfNaFCfa7Ybg2iF',
    enterprise: 'price_1SwK3i53UyfNaFCfYqHUajba'
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await req.json();
        
        if (!['pro', 'enterprise'].includes(plan)) {
            return Response.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const priceId = PRICE_IDS[plan];
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            mode: 'subscription',
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: `${req.headers.get('origin')}/Settings?checkout=success`,
            cancel_url: `${req.headers.get('origin')}/Pricing?checkout=cancelled`,
            metadata: {
                base44_app_id: Deno.env.get('BASE44_APP_ID'),
                user_id: user.id,
                plan: plan
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan: plan
                },
                trial_period_days: 14
            }
        });

        return Response.json({ 
            url: session.url,
            sessionId: session.id 
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});