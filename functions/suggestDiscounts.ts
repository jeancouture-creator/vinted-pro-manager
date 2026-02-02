import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all items and orders
        const [items, orders] = await Promise.all([
            base44.entities.Item.list(),
            base44.entities.Order.list()
        ]);

        const now = new Date();
        const suggestions = [];

        // Analyze each item
        for (const item of items) {
            if (item.status !== 'in_vendita') continue;

            const publishedDate = new Date(item.published_date || item.created_date);
            const daysInStock = Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24));

            let discountSuggestion = null;
            let reason = '';
            let priority = 'low';

            // Items in stock > 60 days
            if (daysInStock > 60) {
                discountSuggestion = 25;
                reason = `In magazzino da ${daysInStock} giorni. Sconto aggressivo consigliato.`;
                priority = 'high';
            } else if (daysInStock > 30) {
                discountSuggestion = 15;
                reason = `In magazzino da ${daysInStock} giorni. Sconto per velocizzare vendita.`;
                priority = 'medium';
            } else if (daysInStock > 14) {
                discountSuggestion = 10;
                reason = `In magazzino da ${daysInStock} giorni. Piccolo sconto per incentivare.`;
                priority = 'low';
            }

            // Check if similar items sold recently
            const similarSold = items.filter(i => 
                i.category === item.category && 
                i.brand === item.brand &&
                i.status === 'venduto' &&
                i.selling_price < item.selling_price
            );

            if (similarSold.length > 3 && !discountSuggestion) {
                const avgSoldPrice = similarSold.reduce((sum, i) => sum + i.selling_price, 0) / similarSold.length;
                if (item.selling_price > avgSoldPrice * 1.2) {
                    discountSuggestion = 20;
                    reason = `Prezzo sopra mercato. Articoli simili venduti a €${avgSoldPrice.toFixed(2)}.`;
                    priority = 'high';
                }
            }

            if (discountSuggestion) {
                const newPrice = item.selling_price * (1 - discountSuggestion / 100);
                const stillProfit = newPrice > item.purchase_price * 1.3;

                suggestions.push({
                    item_id: item.id,
                    item_name: item.name,
                    current_price: item.selling_price,
                    suggested_discount: discountSuggestion,
                    new_price: Math.round(newPrice),
                    reason,
                    priority,
                    days_in_stock: daysInStock,
                    maintains_profit: stillProfit,
                    expected_margin: ((newPrice - item.purchase_price) / item.purchase_price * 100).toFixed(1)
                });
            }
        }

        // Sort by priority and days in stock
        suggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.days_in_stock - a.days_in_stock;
        });

        return Response.json({
            total_suggestions: suggestions.length,
            high_priority: suggestions.filter(s => s.priority === 'high').length,
            suggestions: suggestions.slice(0, 20),
            summary: {
                items_over_60_days: items.filter(i => {
                    const days = Math.floor((now - new Date(i.published_date || i.created_date)) / (1000 * 60 * 60 * 24));
                    return i.status === 'in_vendita' && days > 60;
                }).length,
                total_in_stock: items.filter(i => i.status === 'in_vendita').length
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});