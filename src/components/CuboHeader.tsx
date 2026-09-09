import React from 'react';
import { Biti9Logo } from './Biti9Logo';
import { ShieldCheck } from 'lucide-react';
import { AppStep } from '../types';

interface CuboHeaderProps {
  currentStep: AppStep;
  onOpenAdmin: () => void;
  onResetForm: () => void;
}

export const CuboHeader: React.FC<CuboHeaderProps> = ({
  onResetForm,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-3">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand Logo - Aligned to far left corner */}
        <div className="flex items-center">
          <button 
            onClick={onResetForm} 
            className="hover:opacity-90 transition-opacity flex items-center text-left focus:outline-none cursor-pointer"
            title="Reiniciar Formulário"
          >
            <Biti9Logo className="h-18 sm:h-22 md:h-28" variant="white" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pr-1 sm:pr-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Biti9</span>
          </div>
        </div>
      </div>
    </header>
  );
};
