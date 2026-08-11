'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Item } from '@/types/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { useDeleteItemMutation } from '@/store/api/items-api-slice';
import { useTranslations } from '@/lib/i18n';
import type { PaginationMeta } from '@/components/ui/PaginationControls';

interface ItemsTableProps {
  data: Item[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function ItemsTable({ data, isLoading, isFetching, pagination }: ItemsTableProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete.id).unwrap();
      toast.success(t('items.deletedSuccess'));
      setItemToDelete(null);
    } catch {
      // Error handled by RTK Query
    }
  };

  const columns: Column<Item>[] = [
    { key: 'name', header: t('inventory.itemName') },
    { key: 'genericName', header: t('inventory.genericName'), render: (item) => item.genericName || '-' },
    { key: 'category', header: t('inventory.category'), render: (item) => item.category || '-' },
    { key: 'unit', header: t('inventory.unit') },
    { key: 'reorderLevel', header: t('inventory.reorderLevel') },
    {
      key: 'isControlledSubstance',
      header: t('items.controlled'),
      render: (item) =>
        item.isControlledSubstance ? (
          <Badge variant="danger">{t('items.controlled')}</Badge>
        ) : (
          <Badge variant="secondary">{t('items.no')}</Badge>
        ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => setItemToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={pagination}
        emptyMessage={t('inventory.noItems')}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => router.push(`/items/${item.id}/edit`)}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('items.deleteItem')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('items.deleteConfirm')} <span className="font-medium text-foreground">{itemToDelete?.name}</span>? {t('items.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('items.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('items.deleting') : t('items.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
