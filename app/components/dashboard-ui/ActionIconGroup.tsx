'use client';

import { cn } from '@/lib/utils';
import { Eye, Printer, RotateCcw, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

interface Action {
  icon: 'view' | 'print' | 'return' | 'external';
  href?: string;
  onClick?: () => void;
  label: string;
}

interface ActionIconGroupProps {
  actions: Action[];
  className?: string;
}

const iconMap = {
  view: Eye,
  print: Printer,
  return: RotateCcw,
  external: ArrowUpRight,
};

export function ActionIconGroup({ actions, className }: ActionIconGroupProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {actions.map((action) => {
        const Icon = iconMap[action.icon];
        const isLink = !!action.href;

        const buttonClasses = 'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150';

        if (isLink) {
          return (
            <motion.div key={action.icon} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href={action.href!} className={buttonClasses} title={action.label}>
                <Icon className="h-4 w-4" />
              </Link>
            </motion.div>
          );
        }

        return (
          <motion.button key={action.icon} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={action.onClick} className={buttonClasses} title={action.label}>
            <Icon className="h-4 w-4" />
          </motion.button>
        );
      })}
    </div>
  );
}
