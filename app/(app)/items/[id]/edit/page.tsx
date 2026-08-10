'use client';

import { useParams } from 'next/navigation';
import { ItemForm } from '@/components/items/ItemForm';
import { SubstitutesSection } from '@/components/items/SubstitutesSection';

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-4xl space-y-6">
      <ItemForm itemId={id} />
      <SubstitutesSection itemId={id} />
    </div>
  );
}
