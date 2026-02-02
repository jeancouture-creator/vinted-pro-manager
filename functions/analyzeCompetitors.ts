import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { item_id } = await req.json();
        
        if (!item_id) {
            return Response.json({ error: 'item_id required' }, { status: 400 });
        }

        const items = await base44.entities.Item.filter({ id: item_id });
        if (items.length === 0) {
            return Response.json({ error: 'Item not found' }, { status: 404 });
        }
        
        const item = items[0];

        // Simulate market data analysis (in real app, would query external APIs or scrape Vinted)
        const prompt = `Analizza il mercato per questo articolo Vinted:

Brand: ${item.brand}
Categoria: ${item.category}
Condizione: ${item.condition}
Prezzo attuale: €${item.selling_price}
Prezzo acquisto: €${item.purchase_price}

Fornisci un'analisi competitiva realistica:
1. Prezzo medio mercato per articoli simili
2. Range prezzo minimo e massimo
3. Giorni medi per vendita (stima realistica)
4. Numero totale articoli simili stimato
5. Posizionamento competitivo (above_market, in_market, below_market, underpriced)
6. Livello domanda (high, medium, low)
7. 3-5 strategie vincenti osservate su articoli simili
8. 3-5 opportunità di differenziazione

Sii realistico e basato su dati di mercato plausibili.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    market_avg_price: { type: "number" },
                    price_range_min: { type: "number" },
                    price_range_max: { type: "number" },
                    avg_days_to_sell: { type: "number" },
                    total_similar_items: { type: "number" },
                    competitive_position: { type: "string" },
                    demand_level: { type: "string" },
                    winning_strategies: { type: "array", items: { type: "string" } },
                    differentiation_opportunities: { type: "array", items: { type: "string" } }
                }
            }
        });

        // Save insight
        const insight = await base44.entities.CompetitorInsight.create({
            item_id: item_id,
            market_avg_price: response.market_avg_price,
            price_range_min: response.price_range_min,
            price_range_max: response.price_range_max,
            avg_days_to_sell: response.avg_days_to_sell,
            total_similar_items: response.total_similar_items,
            competitive_position: response.competitive_position,
            demand_level: response.demand_level,
            winning_strategies: response.winning_strategies,
            differentiation_opportunities: response.differentiation_opportunities
        });

        // Log AI activity
        await base44.entities.AIActivityLog.create({
            user_id: user.id,
            action_type: 'price_suggestion',
            item_id: item_id,
            input_data: JSON.stringify(item),
            output_data: JSON.stringify(response),
            credits_used: 1,
            status: 'auto_approved'
        });

        return Response.json({ success: true, insight });

    } catch (error) {
        console.error('Competitor analysis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});