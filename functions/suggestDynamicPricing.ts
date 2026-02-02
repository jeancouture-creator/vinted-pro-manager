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

        // Calculate days on market
        const publishedDate = item.published_date ? new Date(item.published_date) : new Date(item.created_date);
        const daysOnMarket = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

        const prompt = `Suggerisci un prezzo dinamico ottimale per questo articolo Vinted:

Articolo: ${item.name}
Brand: ${item.brand}
Categoria: ${item.category}
Condizione: ${item.condition}
Prezzo attuale: €${item.selling_price}
Prezzo acquisto: €${item.purchase_price}
Giorni in vendita: ${daysOnMarket}
Stagione attuale: ${new Date().toLocaleDateString('it-IT', { month: 'long' })}

Analizza e suggerisci:
1. Prezzo ottimale consigliato
2. Motivo del suggerimento (chiaro e concreto)
3. Fattori considerati:
   - Domanda mercato (high/medium/low)
   - Stagionalità (rilevante per questa categoria?)
   - Competizione (alta/media/bassa)
   - Tempo sul mercato (quanto impatta?)
4. Margine stimato in percentuale
5. Tipo azione (increase/decrease/maintain)

Considera:
- Dopo 30+ giorni, suggerisci riduzioni graduali
- In alta stagione per la categoria, prezzi più alti
- Se sottocosto rispetto al mercato, suggerisci aumento
- Mantieni margine minimo 20% quando possibile`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    suggested_price: { type: "number" },
                    reason: { type: "string" },
                    factors: {
                        type: "object",
                        properties: {
                            market_demand: { type: "string" },
                            seasonality: { type: "string" },
                            competition: { type: "string" },
                            time_on_market: { type: "number" }
                        }
                    },
                    estimated_margin: { type: "number" },
                    action_type: { type: "string" }
                }
            }
        });

        // Save pricing suggestion
        const pricing = await base44.entities.PricingHistory.create({
            item_id: item_id,
            previous_price: item.selling_price,
            suggested_price: response.suggested_price,
            reason: response.reason,
            factors: response.factors,
            estimated_margin: response.estimated_margin,
            action_type: response.action_type,
            status: 'pending'
        });

        // Log AI activity
        await base44.entities.AIActivityLog.create({
            user_id: user.id,
            action_type: 'price_suggestion',
            item_id: item_id,
            input_data: JSON.stringify({ current_price: item.selling_price, days_on_market: daysOnMarket }),
            output_data: JSON.stringify(response),
            credits_used: 1,
            status: 'pending'
        });

        return Response.json({ success: true, pricing, days_on_market: daysOnMarket });

    } catch (error) {
        console.error('Dynamic pricing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});