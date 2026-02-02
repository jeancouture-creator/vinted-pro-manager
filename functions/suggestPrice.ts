import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { item } = await req.json();
        
        if (!item) {
            return Response.json({ error: 'Item data required' }, { status: 400 });
        }

        // Fetch similar items
        const allItems = await base44.entities.Item.list();
        const similarItems = allItems.filter(i => 
            i.category === item.category && 
            i.status === 'venduto' &&
            i.selling_price > 0
        );

        // Fetch all orders to calculate average selling prices
        const orders = await base44.entities.Order.list();
        
        let basePrice = item.purchase_price || 0;
        let suggestedPrice = basePrice * 2.5; // Default markup

        if (similarItems.length > 0) {
            const avgPrice = similarItems.reduce((sum, i) => sum + (i.selling_price || 0), 0) / similarItems.length;
            suggestedPrice = avgPrice;
        }

        // Adjust based on condition
        const conditionMultipliers = {
            'nuovo_con_cartellino': 1.3,
            'nuovo_senza_cartellino': 1.2,
            'come_nuovo': 1.1,
            'buono': 1.0,
            'usato': 0.85,
            'molto_usato': 0.7
        };
        
        if (item.condition && conditionMultipliers[item.condition]) {
            suggestedPrice *= conditionMultipliers[item.condition];
        }

        // Brand premium
        const premiumBrands = ['Nike', 'Adidas', 'Gucci', 'Prada', 'Louis Vuitton', 'Chanel', 'Supreme', 'Stone Island'];
        if (item.brand && premiumBrands.includes(item.brand)) {
            suggestedPrice *= 1.15;
        }

        // Ensure minimum margin
        const minMargin = basePrice * 1.5;
        suggestedPrice = Math.max(suggestedPrice, minMargin);

        // Calculate price range
        const priceRange = {
            min: Math.round(suggestedPrice * 0.85),
            suggested: Math.round(suggestedPrice),
            max: Math.round(suggestedPrice * 1.25)
        };

        // Calculate expected profit
        const expectedProfit = priceRange.suggested - basePrice;
        const profitMargin = basePrice > 0 ? ((expectedProfit / basePrice) * 100).toFixed(1) : 0;

        // Analysis
        const analysis = {
            similarItemsFound: similarItems.length,
            averageMarketPrice: similarItems.length > 0 
                ? Math.round(similarItems.reduce((sum, i) => sum + i.selling_price, 0) / similarItems.length)
                : null,
            competitionLevel: similarItems.length > 10 ? 'high' : similarItems.length > 5 ? 'medium' : 'low',
            recommendation: expectedProfit > basePrice ? 'excellent_margin' : expectedProfit > basePrice * 0.5 ? 'good_margin' : 'low_margin'
        };

        return Response.json({
            priceRange,
            expectedProfit,
            profitMargin,
            analysis,
            reasoning: `Basato su ${similarItems.length} articoli simili venduti. Condizione: ${item.condition || 'N/A'}. Margine stimato: ${profitMargin}%.`
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});