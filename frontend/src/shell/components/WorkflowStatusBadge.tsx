import React from 'react';

interface WorkflowStatusBadgeProps {
  status: string;
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ status }) => {
  const normalized = status?.toUpperCase() || 'DRAFT';

  let bg = 'bg-slate-100 text-slate-800 border-slate-200';
  let dot = 'bg-slate-400';
  let label = 'Brouillon';

  switch (normalized) {
    case 'IN_REVIEW':
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500 animate-pulse';
      label = 'En cours de relecture';
      break;
    case 'NEEDS_CHANGES':
      bg = 'bg-red-50 text-red-800 border-red-200';
      dot = 'bg-red-500';
      label = 'Modifications requises';
      break;
    case 'APPROVED':
      bg = 'bg-blue-50 text-blue-800 border-blue-200';
      dot = 'bg-blue-500';
      label = 'Approuvé';
      break;
    case 'PUBLISHED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500';
      label = 'Publié';
      break;
    case 'ARCHIVED':
      bg = 'bg-slate-200 text-slate-700 border-slate-300';
      dot = 'bg-slate-500';
      label = 'Archivé';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
