import React from 'react';
import { AlertStatus } from '../types';
import { CheckCircle, AlertCircle, Clock } from './Icons';

interface Props {
  status: AlertStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case AlertStatus.GREEN:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Al día
        </span>
      );
    case AlertStatus.YELLOW:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Clock className="w-3 h-3" />
          Próximo
        </span>
      );
    case AlertStatus.RED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Atrasado
        </span>
      );
    default:
      return null;
  }
};

export default StatusBadge;