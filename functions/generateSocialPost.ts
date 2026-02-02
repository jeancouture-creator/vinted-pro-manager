import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, platform, tone } = await req.json();
        
        if (!items || items.length === 0) {
            return Response.json({ error: 'Items required' }, { status: 400 });
        }

        const selectedPlatform = platform || 'instagram';
        const selectedTone = tone || 'friendly';

        // Build prompt based on platform
        let prompt = '';
        
        if (selectedPlatform === 'instagram') {
            prompt = `Crea un post Instagram accattivante per promuovere i seguenti articoli di abbigliamento usato:

${items.map((item, i) => `${i + 1}. ${item.name} - ${item.brand || 'Brand vario'} - €${item.selling_price}`).join('\n')}

Requisiti:
- Tono: ${selectedTone === 'friendly' ? 'amichevole e casual' : selectedTone === 'professional' ? 'professionale' : 'entusiasta e giovane'}
- Usa 3-5 emoji pertinenti
- Includi 8-12 hashtag rilevanti (#vintedItalia #secondhand #moda #sustainable, etc.)
- Call-to-action chiaro
- Lunghezza: 150-200 parole
- Evidenzia sostenibilità e risparmio

Scrivi SOLO il post, senza titoli o introduzioni.`;
        } else if (selectedPlatform === 'facebook') {
            prompt = `Crea un post Facebook per promuovere questi articoli:

${items.map((item, i) => `${i + 1}. ${item.name} - ${item.brand || 'Brand vario'} - €${item.selling_price}`).join('\n')}

Requisiti:
- Tono: più discorsivo e dettagliato
- 2-3 emoji
- 5-8 hashtag
- Paragrafi brevi e leggibili
- Call-to-action
- Enfasi su qualità e prezzi convenienti

Scrivi SOLO il post.`;
        } else {
            prompt = `Crea un breve annuncio TikTok/Shorts script per questi articoli:

${items.map((item, i) => `${i + 1}. ${item.name} - €${item.selling_price}`).join('\n')}

Requisiti:
- Hook iniziale forte (primi 3 secondi)
- Linguaggio giovane ed energico
- 3-5 emoji
- Call-to-action alla fine
- Max 100 parole
- Enfasi su trend e occasioni

Scrivi SOLO lo script.`;
        }

        const result = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true
        });

        // Extract hashtags
        const hashtags = result.match(/#\w+/g) || [];

        return Response.json({
            content: result.trim(),
            platform: selectedPlatform,
            hashtags: hashtags,
            wordCount: result.split(' ').length,
            characterCount: result.length
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});