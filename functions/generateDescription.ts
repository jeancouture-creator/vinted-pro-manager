import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { item } = await req.json();
        
        if (!item || !item.name) {
            return Response.json({ error: 'Item name required' }, { status: 400 });
        }

        // Build prompt for LLM
        const conditionLabels = {
            'nuovo_con_cartellino': 'nuovo con cartellino',
            'nuovo_senza_cartellino': 'nuovo senza cartellino',
            'come_nuovo': 'come nuovo',
            'buono': 'in buone condizioni',
            'usato': 'usato',
            'molto_usato': 'molto usato'
        };

        const prompt = `Crea una descrizione accattivante e professionale per un marketplace di abbigliamento usato (Vinted) per il seguente articolo:

Articolo: ${item.name}
Brand: ${item.brand || 'Non specificato'}
Categoria: ${item.category || 'Non specificata'}
Condizioni: ${conditionLabels[item.condition] || item.condition || 'Non specificate'}
Taglia: ${item.size || 'Non specificata'}
Colore: ${item.color || 'Non specificato'}
Materiale: ${item.material || 'Non specificato'}
Note: ${item.notes || 'Nessuna'}

La descrizione deve:
- Essere coinvolgente e convincente
- Evidenziare i punti di forza
- Essere onesta sulle condizioni
- Includere dettagli sul fit/vestibilità se rilevante
- Essere ottimizzata per la vendita online
- Lunghezza: 2-3 paragrafi brevi
- Tono: friendly ma professionale
- NO emoji, NO formattazione markdown

Scrivi SOLO la descrizione, senza introduzioni o titoli.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
        });

        return Response.json({
            description: result.trim(),
            wordCount: result.split(' ').length
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});