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

        // Get item details
        const items = await base44.entities.Item.filter({ id: item_id });
        if (items.length === 0) {
            return Response.json({ error: 'Item not found' }, { status: 404 });
        }
        
        const item = items[0];

        // Call AI for SEO analysis
        const prompt = `Analizza questo annuncio Vinted e ottimizzalo per la SEO:

Titolo: ${item.name}
Descrizione: ${item.description || 'Nessuna descrizione'}
Categoria: ${item.category}
Brand: ${item.brand}
Condizione: ${item.condition}
Prezzo: €${item.selling_price}

Fornisci:
1. Punteggio SEO attuale (0-100)
2. Titolo ottimizzato (max 50 caratteri, chiaro e ricercabile)
3. Descrizione ottimizzata (evidenzia brand, condizione, dettagli unici)
4. 5 keyword principali
5. 5 keyword secondarie
6. 8 hashtag pertinenti (#fashion #secondhand etc)
7. 3-5 suggerimenti concreti di miglioramento

Focus su: ricercabilità, chiarezza, attrattività per acquirenti.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    seo_score: { type: "number" },
                    optimized_title: { type: "string" },
                    optimized_description: { type: "string" },
                    primary_keywords: { type: "array", items: { type: "string" } },
                    secondary_keywords: { type: "array", items: { type: "string" } },
                    suggested_hashtags: { type: "array", items: { type: "string" } },
                    improvements: { type: "array", items: { type: "string" } }
                }
            }
        });

        // Save analysis
        const analysis = await base44.entities.SEOAnalysis.create({
            item_id: item_id,
            seo_score: response.seo_score,
            original_title: item.name,
            optimized_title: response.optimized_title,
            original_description: item.description || '',
            optimized_description: response.optimized_description,
            primary_keywords: response.primary_keywords,
            secondary_keywords: response.secondary_keywords,
            suggested_hashtags: response.suggested_hashtags,
            improvements: response.improvements,
            status: 'pending'
        });

        // Log AI activity
        await base44.entities.AIActivityLog.create({
            user_id: user.id,
            action_type: 'description_generation',
            item_id: item_id,
            input_data: JSON.stringify({ title: item.name, description: item.description }),
            output_data: JSON.stringify(response),
            credits_used: 1,
            status: 'pending'
        });

        return Response.json({ success: true, analysis });

    } catch (error) {
        console.error('SEO analysis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});