'use client';

import { useState } from 'react';
import { useGetSubstitutesQuery } from '@/store/api/items-api-slice';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SubstitutesSectionProps {
  itemId: string;
}

export function SubstitutesSection({ itemId }: SubstitutesSectionProps) {
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const { data: substitutes, isLoading } = useGetSubstitutesQuery(itemId, {
    skip: !showSubstitutes,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Substitutes</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSubstitutes(!showSubstitutes)}
          >
            {showSubstitutes ? 'Hide' : 'View Substitutes'}
          </Button>
        </div>
      </CardHeader>
      {showSubstitutes && (
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : substitutes && substitutes.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Items sharing the same generic name:
              </p>
              <div className="grid gap-2">
                {substitutes.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">{sub.unit}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{sub.category}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No substitutes found for this item.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
