import React from 'react';
import { PackageSearch, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: any;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = PackageSearch,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center bg-[#f8fafc] dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs w-full max-w-full">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 shadow-inner">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white font-heading">
        {title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-1 sm:mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="mt-4 sm:mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionButton.text}</span>
        </button>
      )}
    </div>
  );
};
