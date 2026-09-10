import React, { useState, useEffect } from 'react';
import { AppStep, UserInfo, EvaluationAnswers, PrizeItem, SubmissionRecord } from './types';
import { CuboHeader } from './components/CuboHeader';
import { InfoStep } from './components/InfoStep';
import { QuestionsStep } from './components/QuestionsStep';
import { SubmissionSuccessStep } from './components/SubmissionSuccessStep';
import { PrizeWheelStep } from './components/PrizeWheelStep';
import { PrizeResultStep } from './components/PrizeResultStep';
import { AdminPanel } from './components/AdminPanel';

// Default list of prizes as requested
const DEFAULT_PRIZES: PrizeItem[] = [
  {
    id: '1',
    label: '1h de Consultoria com o CTO',
    description: 'Uma sessão exclusiva de 1 hora para discutir IA, automação, estratégia ou um desafio real da empresa.',
    color: '#00B4D8',
    iconName: 'UserCheck',
    isWinning: true,
  },
  {
    id: '2',
    label: '1h de Consultoria em IA',
    description: 'Sessão personalizada com especialista para ajudar o ganhador a aplicar IA em um desafio real.',
    color: '#0B1F3A',
    iconName: 'Brain',
    isWinning: true,
  },
  {
    id: '3',
    label: 'IA na Prática — Sessão Exclusiva',
    description: 'Uma experiência hands-on para criar uma solução utilizando IA.',
    color: '#00D2FE',
    iconName: 'Cpu',
    isWinning: true,
  },
  {
    id: '4',
    label: 'Desafio de Automação RPA',
    description: 'O ganhador apresenta um processo e recebe uma sessão para identificar como automatizá-lo.',
    color: '#1E293B',
    iconName: 'Zap',
    isWinning: true,
  },
  {
    id: '5',
    label: '1h de Mentoria em IA',
    description: 'Uma conversa individual para explorar ferramentas, produtividade e aplicações de IA.',
    color: '#0284C7',
    iconName: 'Compass',
    isWinning: true,
  },
  {
    id: '6',
    label: 'AI Prompt Masterclass',
    description: 'Sessão exclusiva para aprender a criar prompts mais eficientes e obter melhores resultados com IA.',
    color: '#0F172A',
    iconName: 'Sparkles',
    isWinning: true,
  },
  {
    id: '7',
    label: 'AI Tools Experience',
    description: 'Uma experiência guiada explorando Copilot + Gemini + Manus + Google AI, com exemplos práticos.',
    color: '#0284C7',
    iconName: 'Wrench',
    isWinning: true,
  },
  {
    id: '8',
    label: 'Seu Copilot Personalizado',
    description: 'Uma sessão para entender como configurar e utilizar melhor o Copilot no dia a dia.',
    color: '#0369A1',
    iconName: 'Bot',
    isWinning: true,
  },
  {
    id: '9',
    label: '🏆 AI POWER HOUR',
    description: '1 hora. 1 especialista. 1 desafio. Uma sessão exclusiva para transformar uma ideia em uma possibilidade real com IA.',
    color: '#0284C7',
    iconName: 'Trophy',
    isWinning: true,
  },
  {
    id: '10',
    label: '🏆 AI MASTER SESSION',
    description: 'Uma hora exclusiva com um especialista para levar seu uso de IA para outro nível.',
    color: '#0B1F3A',
    iconName: 'Award',
    isWinning: true,
  },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('INFO');
  const [showAdmin, setShowAdmin] = useState(false);

  // Form State
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
  });

  const [answers, setAnswers] = useState<EvaluationAnswers>({
    q1_nota: 0,
    q2_solucao: '',
    q3_resolveudor: '',
    q3_detalhes: '',
  });

  const [wonPrize, setWonPrize] = useState<PrizeItem | null>(null);
  // id do registro já gravado no servidor para este participante (usado para
  // atualizar o status real de envio de e-mail depois)
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ email: string; tecnologia: string } | null>(null);
  const [, setCheckingDuplicate] = useState(false);

  // Prêmios continuam configuráveis localmente (não fazem parte do
  // diagnóstico de "banco de dados" — só as avaliações precisavam ser
  // compartilhadas entre participantes/organizadores).
  const [prizes, setPrizes] = useState<PrizeItem[]>(() => {
    const saved = localStorage.getItem('cubo_biti9_prizes_v2');
    return saved ? JSON.parse(saved) : DEFAULT_PRIZES;
  });

  useEffect(() => {
    localStorage.setItem('cubo_biti9_prizes_v2', JSON.stringify(prizes));
  }, [prizes]);

  // ==========================================================================
  // Avaliações (submissions) agora vivem no SERVIDOR (ver server.ts), não mais
  // no localStorage do navegador — é o que corrige o "banco de dados" que
  // parecia não funcionar (cada dispositivo só via os próprios dados antes).
  // ==========================================================================
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  const refreshSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSubmissions(data);
      setSubmissionsError(null);
    } catch (err) {
      console.error('Falha ao buscar avaliações do servidor:', err);
      setSubmissionsError(
        'Não foi possível carregar as avaliações do servidor. Verifique se o backend (server.ts) está rodando.'
      );
    }
  };

  // Busca as avaliações sempre que o Painel do Evento é aberto
  useEffect(() => {
    if (showAdmin) refreshSubmissions();
  }, [showAdmin]);

  // Handle Info Step Next
  const handleInfoNext = (data: UserInfo) => {
    setUserInfo(data);
    setCurrentStep('QUESTIONS');
  };

  // Handle Questions Finish — salva a avaliação no servidor IMEDIATAMENTE (mesmo antes do giro da roleta)
  const handleQuestionsFinish = async (completedAnswers: EvaluationAnswers) => {
    setAnswers(completedAnswers);
    setCheckingDuplicate(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          answers: completedAnswers,
          prizeWon: null,
          emailSent: false,
        }),
      });

      if (res.ok) {
        const record: SubmissionRecord = await res.json();
        setCurrentSubmissionId(record.id);
        setSubmissions((prev) => [record, ...prev]);
      }
    } catch (err) {
      console.warn('Falha ao gravar avaliação no servidor:', err);
    } finally {
      setCheckingDuplicate(false);
    }
    setCurrentStep('SUBMITTING');
  };

  // Handle Go to Wheel from Submission Step
  const handleGoToWheel = () => {
    setCurrentStep('WHEEL');
  };

  // Handle Spin Complete from Wheel — atualiza o prêmio sorteado no registro já criado
  const handleSpinComplete = async (prize: PrizeItem) => {
    setWonPrize(prize);

    if (currentSubmissionId) {
      try {
        await fetch(`/api/submissions/${currentSubmissionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prizeWon: prize }),
        });
        setSubmissions((prev) =>
          prev.map((s) => (s.id === currentSubmissionId ? { ...s, prizeWon: prize } : s))
        );
      } catch (err) {
        console.error('Falha ao atualizar prêmio no servidor:', err);
      }
    } else {
      // Fallback caso não tenha gravado no passo anterior por algum motivo
      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInfo,
            answers,
            prizeWon: prize,
            emailSent: false,
          }),
        });

        if (res.ok) {
          const record: SubmissionRecord = await res.json();
          setCurrentSubmissionId(record.id);
          setSubmissions((prev) => [record, ...prev]);
        }
      } catch (err) {
        console.error('Falha ao gravar avaliação no servidor:', err);
      }
    }

    setCurrentStep('PRIZE_RESULT');
  };

  // Reset Form for new participant
  const handleResetForm = () => {
    setUserInfo({
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
    });
    setAnswers({
      q1_nota: 0,
      q2_solucao: '',
      q3_resolveudor: '',
      q3_detalhes: '',
    });
    setWonPrize(null);
    setCurrentSubmissionId(null);
    setDuplicateInfo(null);
    setCurrentStep('INFO');
  };

  const handleClearSubmissions = async () => {
    try {
      await fetch('/api/submissions', { method: 'DELETE' });
    } catch (err) {
      console.error('Falha ao limpar avaliações no servidor:', err);
    } finally {
      await refreshSubmissions();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Immersive UI Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left cyan glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        {/* Bottom-right blue/purple glow */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
        {/* Center subtle radial light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[180px]" />
        {/* Subtle tech grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`, 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <CuboHeader
          currentStep={currentStep}
          onOpenAdmin={() => setShowAdmin(true)}
          onResetForm={handleResetForm}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 pb-12">
        {currentStep === 'INFO' && (
          <InfoStep initialData={userInfo} onNext={handleInfoNext} />
        )}

        {currentStep === 'QUESTIONS' && (
          <QuestionsStep
            initialAnswers={answers}
            onFinishQuestions={handleQuestionsFinish}
          />
        )}

        {currentStep === 'ALREADY_VOTED' && duplicateInfo && (
          <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2BADFF]/10 border border-[#2BADFF]/20 text-[#2BADFF] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(43,173,255,0.2)]">
                <span className="text-2xl">🎁</span>
              </div>
              <h1 className="text-xl font-bold text-white">Acesso à Roleta de Prêmios Indisponível</h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                O e-mail <strong className="text-[#2BADFF]">{duplicateInfo.email}</strong> já participou da dinâmica e já teve acesso à roleta de prêmios do evento Cubo.
              </p>
              <p className="text-xs text-slate-400">
                Cada participante tem direito a acessar a roleta de prêmios apenas 1 vez por e-mail.
              </p>
              <button
                onClick={handleResetForm}
                className="mt-2 py-3 px-6 rounded-xl bg-[#2BADFF] hover:bg-[#1a94e0] text-[#020617] font-bold text-sm shadow-[0_0_20px_rgba(43,173,255,0.3)] transition-all cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

        {currentStep === 'SUBMITTING' && (
          <SubmissionSuccessStep onGoToWheel={handleGoToWheel} />
        )}

        {currentStep === 'WHEEL' && (
          <PrizeWheelStep
            prizes={prizes}
            onSpinComplete={handleSpinComplete}
          />
        )}

        {currentStep === 'PRIZE_RESULT' && wonPrize && (
          <PrizeResultStep
            userInfo={userInfo}
            prizeWon={wonPrize}
            submissionId={currentSubmissionId}
            onRestart={handleResetForm}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-4 border-t border-slate-800/60 text-center text-xs text-slate-400 bg-[#020617]/80 backdrop-blur-md">
        <p>© 2026 Biti9 Automations & AI • Agente de Avaliação Cubo</p>
      </footer>

      {/* Event Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          submissions={submissions}
          submissionsError={submissionsError}
          prizes={prizes}
          onUpdatePrizes={setPrizes}
          onClearSubmissions={handleClearSubmissions}
          onRefreshSubmissions={refreshSubmissions}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
