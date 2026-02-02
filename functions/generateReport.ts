import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportType, period, startDate, endDate } = await req.json();

        // Fetch data
        const [orders, expenses, items] = await Promise.all([
            base44.entities.Order.list('-created_date'),
            base44.entities.Expense.list('-created_date'),
            base44.entities.Item.list('-created_date')
        ]);

        // Filter by date if provided
        let filteredOrders = orders;
        let filteredExpenses = expenses;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filteredOrders = orders.filter(o => {
                const date = new Date(o.order_date || o.created_date);
                return date >= start && date <= end;
            });
            filteredExpenses = expenses.filter(e => {
                const date = new Date(e.expense_date || e.created_date);
                return date >= start && date <= end;
            });
        }

        // Calculate stats
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
        const totalCosts = filteredOrders.reduce((sum, o) => sum + (o.purchase_price || 0), 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
        const netProfit = totalRevenue - totalCosts - totalExpenses;

        // Create PDF
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Report Finanziario', 20, 20);
        
        doc.setFontSize(10);
        doc.text(`Periodo: ${startDate || 'Inizio'} - ${endDate || 'Oggi'}`, 20, 30);
        doc.text(`Generato: ${new Date().toLocaleDateString('it-IT')}`, 20, 35);

        // Summary
        doc.setFontSize(14);
        doc.text('Riepilogo', 20, 50);
        
        doc.setFontSize(10);
        doc.text(`Fatturato Totale: €${totalRevenue.toFixed(2)}`, 20, 60);
        doc.text(`Costi Merce: €${totalCosts.toFixed(2)}`, 20, 67);
        doc.text(`Spese Operative: €${totalExpenses.toFixed(2)}`, 20, 74);
        doc.text(`Profitto Lordo: €${totalProfit.toFixed(2)}`, 20, 81);
        doc.text(`Profitto Netto: €${netProfit.toFixed(2)}`, 20, 88);
        doc.text(`Numero Ordini: ${filteredOrders.length}`, 20, 95);

        // Orders table
        doc.setFontSize(14);
        doc.text('Ordini', 20, 110);
        
        doc.setFontSize(9);
        let y = 120;
        doc.text('Data', 20, y);
        doc.text('Articolo', 50, y);
        doc.text('Prezzo', 120, y);
        doc.text('Profitto', 150, y);
        
        y += 7;
        filteredOrders.slice(0, 20).forEach(order => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(order.order_date || '-', 20, y);
            doc.text((order.item_name || '').substring(0, 30), 50, y);
            doc.text(`€${(order.sale_price || 0).toFixed(2)}`, 120, y);
            doc.text(`€${(order.net_profit || 0).toFixed(2)}`, 150, y);
            y += 7;
        });

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=report_${new Date().toISOString().split('T')[0]}.pdf`
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});