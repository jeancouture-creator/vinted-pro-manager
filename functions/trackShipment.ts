import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tracking_number, carrier } = await req.json();
        
        if (!tracking_number || !carrier) {
            return Response.json({ error: 'Tracking number and carrier required' }, { status: 400 });
        }

        // Note: Real API integration would require specific API keys and endpoints
        // This is a simulation showing the structure

        let trackingInfo = {
            tracking_number,
            carrier,
            status: 'sconosciuto',
            current_location: null,
            estimated_delivery: null,
            last_update: new Date().toISOString(),
            tracking_events: [],
            is_delayed: false
        };

        // Simulate tracking based on carrier
        // In production, you would call real APIs:
        // - Poste Italiane: https://www.poste.it/api/tracking
        // - BRT: https://api.brt.it/tracking
        // - GLS: https://gls-group.eu/API/tracking

        try {
            // Use LLM to parse tracking number and provide mock data
            const prompt = `Analizza questo numero di tracking ${tracking_number} per il corriere ${carrier}.
            
Fornisci una risposta in formato JSON con:
- status: uno tra "in_transito", "in_consegna", "consegnato", "in_ritardo", "problema"
- current_location: città attuale (italiana plausibile)
- estimated_delivery: data stimata (formato YYYY-MM-DD, tra 1-5 giorni da oggi)
- tracking_events: array di 2-4 eventi con date, location, description

Simula dati realistici per tracking package italiano.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        status: { type: "string" },
                        current_location: { type: "string" },
                        estimated_delivery: { type: "string" },
                        tracking_events: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    date: { type: "string" },
                                    location: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            trackingInfo = {
                ...trackingInfo,
                ...result,
                last_update: new Date().toISOString()
            };

            // Check if delayed (if estimated delivery passed)
            if (result.estimated_delivery) {
                const estimatedDate = new Date(result.estimated_delivery);
                const now = new Date();
                trackingInfo.is_delayed = now > estimatedDate && result.status !== 'consegnato';
            }

        } catch (error) {
            console.error('Tracking API error:', error);
            // Fallback to manual status
            trackingInfo.status = 'sconosciuto';
            trackingInfo.tracking_events = [{
                date: new Date().toISOString().split('T')[0],
                location: 'Non disponibile',
                description: 'Tracking non disponibile. Controlla manualmente sul sito del corriere.'
            }];
        }

        return Response.json(trackingInfo);

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});