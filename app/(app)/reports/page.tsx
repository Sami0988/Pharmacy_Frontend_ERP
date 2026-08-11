'use client';

import { useState } from 'react';
import { BarChart3, DollarSign, Clock, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'motion/react';
import { SalesReport } from '@/components/reports/SalesReport';
import { ExpiryReport } from '@/components/reports/ExpiryReport';
import { DeadStockReport } from '@/components/reports/DeadStockReport';

export default function ReportsPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { key: 'sales', label: t('reports.sales'), icon: DollarSign },
    { key: 'expiry', label: t('reports.expiry'), icon: Clock },
    { key: 'dead-stock', label: t('reports.deadStock'), icon: PackageX },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <BarChart3 className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'expiry' && <ExpiryReport />}
        {activeTab === 'dead-stock' && <DeadStockReport />}
      </motion.div>
    </div>
  );
}
