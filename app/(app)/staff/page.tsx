'use client';

import { Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Users className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground">Staff Directory</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon — manage staff accounts, roles, and permissions</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
