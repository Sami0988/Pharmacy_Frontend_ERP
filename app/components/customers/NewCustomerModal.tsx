'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useCreateCustomerMutation } from '@/store/api/customers-api-slice';
import type { Customer } from '@/types/api';

interface NewCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

export function NewCustomerModal({ open, onClose, onCreated }: NewCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const customer = await createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
      }).unwrap();
      onCreated(customer);
      setName('');
      setPhone('');
      onClose();
    } catch {
      // error handled by RTK
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <DialogDescription>Add a customer for credit sale.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251-9XX-XXX-XXXX"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Create & Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
