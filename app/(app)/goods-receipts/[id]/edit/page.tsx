'use client';

import { useParams } from 'next/navigation';
import { useGetGoodsReceiptQuery } from '@/store/api/goods-receipts-api-slice';
import { GoodsReceiptEditForm } from '@/components/goods-receipts/GoodsReceiptEditForm';
import { Card, CardContent } from '@/components/ui/Card';

export default function GoodsReceiptEditPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: receipt, isLoading, error } = useGetGoodsReceiptQuery(id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-red-600">Failed to load goods receipt.</p>
        </CardContent>
      </Card>
    );
  }

  if (!receipt) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Goods receipt not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <GoodsReceiptEditForm receipt={receipt} />;
}
