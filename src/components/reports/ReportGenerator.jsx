import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReportGenerator() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const generateReport = async () => {
        setIsGenerating(true);
        try {
            const response = await base44.functions.invoke('generateReport', {
                reportType: 'financial',
                startDate,
                endDate
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${startDate}_${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error generating report:', error);
        }
        setIsGenerating(false);
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Genera Report PDF</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Label htmlFor="start_date">Data Inizio</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="end_date">Data Fine</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="mt-1"
                    />
                </div>
            </div>

            <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generazione in corso...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4 mr-2" />
                        Genera Report PDF
                    </>
                )}
            </Button>
        </div>
    );
}