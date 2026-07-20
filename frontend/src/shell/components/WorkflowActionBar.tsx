import React from 'react';
import { AdminButton } from '@/components/ui/AdminUI';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

interface WorkflowActionBarProps {
  entity: string;
  id: string;
  currentStatus: string;
  allowedTransitions: string[];
  refetch: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  entity,
  id,
  currentStatus,
  allowedTransitions,
  refetch,
  showToast,
}) => {
  const queryClient = useQueryClient();

  const transitionMutation = useMutation({
    mutationFn: async (toStatus: string) => {
      const response = await axios.post(`/api/v1/workflow/${entity}/${id}/transition`, { to: toStatus });
      return response.data;
    },
    onSuccess: () => {
      showToast('Statut de workflow mis à jour.');
      refetch();
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors du changement de statut.';
      showToast(msg, 'error');
    },
  });

  const getLabel = (status: string) => {
    switch (status) {
      case 'IN_REVIEW': return 'Soumettre pour relecture';
      case 'NEEDS_CHANGES': return 'Demander des corrections';
      case 'APPROVED': return 'Approuver';
      case 'PUBLISHED': return 'Publier';
      case 'ARCHIVED': return 'Archiver';
      case 'DRAFT': return 'Remettre en brouillon';
      default: return status;
    }
  };

  if (!allowedTransitions || allowedTransitions.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
        <span className="text-sm text-stone-500 font-medium">Statut actuel:</span>
        <WorkflowStatusBadge status={currentStatus} />
        <span className="text-xs text-stone-400 font-normal italic">(Aucune transition disponible)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
      <span className="text-sm text-stone-500 font-medium">Statut actuel:</span>
      <WorkflowStatusBadge status={currentStatus} />
      <span className="h-4 w-px bg-stone-200 mx-1" />
      <div className="flex items-center gap-2">
        {allowedTransitions.map((toStatus) => (
          <AdminButton
            key={toStatus}
            onClick={() => transitionMutation.mutate(toStatus)}
            loading={transitionMutation.isPending && transitionMutation.variables === toStatus}
            variant="secondary"
          >
            {getLabel(toStatus)}
          </AdminButton>
        ))}
      </div>
    </div>
  );
};
