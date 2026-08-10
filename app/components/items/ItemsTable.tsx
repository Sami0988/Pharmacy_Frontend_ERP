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
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete.id).unwrap();
      toast.success('Item deleted successfully');
      setItemToDelete(null);
    } catch {
      // Error handled by RTK Query
    }
  };

  const columns: Column<Item>[] = [
    { key: 'name', header: 'Name' },
    { key: 'genericName', header: 'Generic Name', render: (item) => item.genericName || '-' },
    { key: 'category', header: 'Category', render: (item) => item.category || '-' },
    { key: 'unit', header: 'Unit' },
    { key: 'reorderLevel', header: 'Reorder Level' },
    {
      key: 'isControlledSubstance',
      header: 'Controlled',
      render: (item) =>
        item.isControlledSubstance ? (
          <Badge variant="danger">Controlled</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
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
        emptyMessage="No items found"
        keyExtractor={(item) => item.id}
        onRowClick={(item) => router.push(`/items/${item.id}/edit`)}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{itemToDelete?.name}</span>? This action will soft-delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
