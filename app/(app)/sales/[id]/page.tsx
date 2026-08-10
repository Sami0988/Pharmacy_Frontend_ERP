'use client';

import { useParams } from 'next/navigation';
import { useGetSaleQuery } from '@/store/api/sales-api-slice';
import { SaleDetail } from '@/components/sales/SaleDetail';
import { Card, CardContent } from '@/components/ui/Card';

export default function SaleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: sale, isLoading, error } = useGetSaleQuery(id);

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
          <p className="text-center text-red-600">Failed to load sale.</p>
        </CardContent>
      </Card>
    );
  }

  if (!sale) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Sale not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <SaleDetail sale={sale} />;
}
