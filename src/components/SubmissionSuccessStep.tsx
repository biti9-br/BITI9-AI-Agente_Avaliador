import React from 'react';
import { Robbi9Mascot } from './Robbi9Mascot';
import { CuboLogo } from './CuboLogo';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SubmissionSuccessStepProps {
  onGoToWheel: () => void;
}

export const SubmissionSuccessStep: React.FC<SubmissionSuccessStepProps> = ({ onGoToWheel }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Robbi9 Mascot celebrating */}
      <div className="mb-6">
        <Robbi9Mascot
          size="lg"
          expression="excited"
          message="Avaliação registrada com sucesso! Chegou a hora mais esperada: girar a roleta da sorte!"
        />
      </div>

      {/* Main Success Card */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
        <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-16 h-16 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Feedback Registrado
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Muito obrigado!</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Sua opinião é fundamental para aprimorarmos continuamente nossas dinâmicas e soluções.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onGoToWheel}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-300 via-cyan-300 to-sky-300 hover:from-sky-200 hover:to-cyan-200 text-slate-950 font-extrabold text-base sm:text-lg shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Ir para a Roleta de Prêmios</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Cubo Itaú Logo Below */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <CuboLogo size="lg" />
      </div>
    </div>
  );
};
