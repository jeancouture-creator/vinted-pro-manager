import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, CheckCircle, AlertTriangle, Clock, MapPin, Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const carriers = [
    { value: 'poste_italiane', label: 'Poste Italiane' },
    { value: 'brt', label: 'BRT' },
    { value: 'gls', label: 'GLS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'inpost', label: 'InPost' }
];

const statusConfig = {
    in_transito: { label: 'In Transito', color: 'bg-blue-100 text-blue-700', icon: Truck },
    in_consegna: { label: 'In Consegna', color: 'bg-violet-100 text-violet-700', icon: Package },
    consegnato: { label: 'Consegnato', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    in_ritardo: { label: 'In Ritardo', color: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
    problema: { label: 'Problema', color: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
    sconosciuto: { label: 'Sconosciuto', color: 'bg-slate-100 text-slate-700', icon: Clock }
};

export default function TrackingPanel({ orderId }) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [savedTrackings, setSavedTrackings] = useState([]);

    useEffect(() => {
        loadSavedTrackings();
    }, []);

    const loadSavedTrackings = async () => {
        const data = await base44.entities.ShippingTracking.list('-created_date');
        setSavedTrackings(data);
    };

    const trackShipment = async () => {
        if (!trackingNumber || !carrier) return;
        
        setIsTracking(true);
        try {
            const response = await base44.functions.invoke('trackShipment', {
                tracking_number: trackingNumber,
                carrier: carrier
            });
            
            setTrackingInfo(response.data);
            
            // Save to database
            await base44.entities.ShippingTracking.create({
                order_id: orderId,
                ...response.data
            });
            
            await loadSavedTrackings();
        } catch (error) {
            console.error('Error tracking shipment:', error);
        }
        setIsTracking(false);
    };

    const refreshTracking = async (tracking) => {
        setIsTracking(true);
        try {
            const response = await base44.functions.invoke('trackShipment', {
                tracking_number: tracking.tracking_number,
                carrier: tracking.carrier
            });
            
            await base44.entities.ShippingTracking.update(tracking.id, response.data);
            await loadSavedTrackings();
        } catch (error) {
            console.error('Error refreshing tracking:', error);
        }
        setIsTracking(false);
    };

    return (
        <div className="space-y-6">
            {/* Tracking Form */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Traccia Spedizione</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="tracking_number">Numero Tracking</Label>
                        <Input
                            id="tracking_number"
                            value={trackingNumber}
                            onChange={e => setTrackingNumber(e.target.value)}
                            placeholder="ES123456789IT"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Corriere</Label>
                        <Select value={carrier} onValueChange={setCarrier}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleziona corriere" />
                            </SelectTrigger>
                            <SelectContent>
                                {carriers.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={trackShipment} 
                            disabled={isTracking || !trackingNumber || !carrier}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isTracking ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Tracking...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Traccia
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Current Tracking Result */}
                <AnimatePresence>
                    {trackingInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={statusConfig[trackingInfo.status]?.color || statusConfig.sconosciuto.color}>
                                            {statusConfig[trackingInfo.status]?.label || 'Sconosciuto'}
                                        </Badge>
                                        {trackingInfo.is_delayed && (
                                            <Badge className="bg-rose-100 text-rose-700">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                In Ritardo
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Tracking: {trackingInfo.tracking_number}
                                    </p>
                                </div>
                            </div>

                            {trackingInfo.current_location && (
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Posizione attuale: {trackingInfo.current_location}
                                    </span>
                                </div>
                            )}

                            {trackingInfo.estimated_delivery && (
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Consegna stimata: {new Date(trackingInfo.estimated_delivery).toLocaleDateString('it-IT')}
                                    </span>
                                </div>
                            )}

                            {trackingInfo.tracking_events?.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Cronologia:</p>
                                    <div className="space-y-2">
                                        {trackingInfo.tracking_events.map((event, index) => (
                                            <div key={index} className="flex gap-3 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{event.description}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {event.location} - {event.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Saved Trackings */}
            {savedTrackings.length > 0 && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Spedizioni Salvate</h3>
                    <div className="space-y-3">
                        {savedTrackings.slice(0, 5).map(tracking => {
                            const status = statusConfig[tracking.status] || statusConfig.sconosciuto;
                            const StatusIcon = status.icon;
                            return (
                                <div key={tracking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                {tracking.tracking_number}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {carriers.find(c => c.value === tracking.carrier)?.label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={status.color}>{status.label}</Badge>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => refreshTracking(tracking)}
                                            disabled={isTracking}
                                        >
                                            <Search className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}