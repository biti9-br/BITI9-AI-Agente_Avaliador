import React, { useState } from 'react';
import { PrizeItem, UserInfo } from '../types';
import { Robbi9Mascot } from './Robbi9Mascot';
import { CuboLogo } from './CuboLogo';
import { Check, Loader2, AlertTriangle } from 'lucide-react';

interface PrizeResultStepProps {
  userInfo: UserInfo;
  prizeWon: PrizeItem;
  submissionId: string | null;
  onRestart: () => void;
}

export const PrizeResultStep: React.FC<PrizeResultStepProps> = ({
  userInfo,
  prizeWon,
  submissionId,
  onRestart,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [wasSimulated, setWasSimulated] = useState(false);

  const patchEmailStatus = async (emailSent: boolean) => {
    if (!submissionId) return; // registro pode não ter sido salvo (ver diagnóstico do backend)
    try {
      await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailSent }),
      });
    } catch (err) {
      console.warn('Não foi possível atualizar o status de envio de e-mail:', err);
    }
  };

  const handleOkClick = async () => {
    setIsSending(true);
    setIsError(false);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userInfo.email,
          nome: userInfo.nome,
          empresa: userInfo.empresa,
          premio: prizeWon.label,
          descricao: prizeWon.description,
          mensagem: `Olá ${userInfo.nome}, você ganhou o prêmio "${prizeWon.label}".`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // FALHA REAL — antes este caso caía no "finally" e mostrava sucesso
        // mesmo assim. Agora mostramos o erro de verdade e permitimos tentar de novo.
        console.error('Erro ao enviar e-mail via Azure:', data.error || data.details);
        await patchEmailStatus(false);
        setIsError(true);
        setIsSending(false);
        return;
      }

      if (data.status === 'simulated') {
        // Servidor respondeu OK, mas as variáveis do Azure não estão configuradas
        // — nenhum e-mail real foi disparado. Deixamos o participante seguir
        // (não é um erro dele), mas registramos isso no banco para o organizador ver.
        console.warn('Azure Email simulado: configure COMMUNICATION_SERVICES_CONNECTION_STRING e AZURE_EMAIL_SENDER_ADDRESS para envio real.');
        await patchEmailStatus(false);
        setWasSimulated(true);
      } else {
        await patchEmailStatus(true);
      }

      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        onRestart();
      }, 1500);
    } catch (err) {
      // Falha de rede (ex: backend fora do ar / endpoint 404 em produção)
      console.error('Falha na requisição /api/send-email:', err);
      await patchEmailStatus(false);
      setIsSending(false);
      setIsError(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Robbi9 Mascot Speaking Congratulations */}
      <div className="mb-4">
        <Robbi9Mascot
          size="lg"
          expression={isError ? 'thinking' : isSuccess ? 'excited' : isSending ? 'thinking' : 'excited'}
          message={
            isError
              ? `Não consegui confirmar o envio do e-mail agora 😕`
              : isSending || isSuccess
              ? `Estamos enviando o seu e-mail ✉️`
              : `Parabéns, ${userInfo.nome.split(' ')[0]}! Você ganhou "${prizeWon.label}"! 🎉`
          }
        />
      </div>

      {/* Main Prize Winner Card */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fade-in">
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {prizeWon.label}
            </h1>
            <p className="text-sm text-sky-200 mt-3 max-w-md mx-auto leading-relaxed">
              {prizeWon.description || 'Aproveite seu prêmio especial oferecido pela Biti9'}
            </p>
          </div>

          {isError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300">
                Não foi possível confirmar o envio do e-mail. Sua avaliação e o prêmio já foram
                registrados — tente enviar o e-mail de novo, ou peça para a equipe verificar
                depois no Painel do Evento.
              </p>
            </div>
          )}

          {wasSimulated && isSuccess && (
            <p className="text-[11px] text-amber-300/80">
              (E-mail simulado: as credenciais do Azure ainda não estão configuradas no servidor.)
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={handleOkClick}
              disabled={isSending || isSuccess}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-300 via-cyan-300 to-sky-300 hover:from-sky-200 hover:to-cyan-200 text-slate-950 font-extrabold text-2xl shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                  <span className="text-base">Estamos enviando o seu e-mail</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-7 h-7 text-slate-950 stroke-[3]" />
                  <span>OK</span>
                </>
              ) : isError ? (
                <span>Tentar enviar novamente</span>
              ) : (
                <>
                  <Check className="w-7 h-7 text-slate-950 stroke-[3]" />
                  <span>OK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cubo Itaú Logo Below Container */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <CuboLogo size="lg" />
      </div>
    </div>
  );
};
