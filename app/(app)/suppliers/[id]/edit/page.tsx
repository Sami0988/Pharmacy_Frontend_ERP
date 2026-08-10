'use client';

import { useParams } from 'next/navigation';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export default function EditSupplierPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-4xl">
      <SupplierForm supplierId={id} />
    </div>
  );
}
