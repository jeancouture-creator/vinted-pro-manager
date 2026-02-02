import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AccountSelector({ value, onChange, className }) {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const [accountsData, userData] = await Promise.all([
            base44.entities.VintedAccount.filter({ is_active: true }),
            base44.auth.me()
        ]);
        setAccounts(accountsData);
        setUser(userData);
        
        // Auto-select primary account if no value
        if (!value && accountsData.length > 0) {
            const primary = accountsData.find(a => a.is_primary);
            if (primary && onChange) {
                onChange(primary.id);
            }
        }
    };

    if (user?.subscription_plan !== 'enterprise' && accounts.length <= 1) {
        return null;
    }

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={className}>
                <SelectValue placeholder="Seleziona account Vinted" />
            </SelectTrigger>
            <SelectContent>
                {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                            <span>{account.username}</span>
                            {account.is_primary && (
                                <Badge variant="outline" className="text-xs">Primario</Badge>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}