"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 bg-pharos-slate-300/40 rounded-full flex items-center justify-center mx-auto mb-6">
        <BuildingOffice2Icon className="w-12 h-12 text-pharos-slate-600" />
      </div>
      <h3 className="text-2xl font-bold text-pharos-navy-900 mb-3">
        {title}
      </h3>
      <p className="text-pharos-slate-700 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};
