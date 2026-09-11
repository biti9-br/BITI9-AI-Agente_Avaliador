import React, { useState } from 'react';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import { EvaluationAnswers } from '../types';
import { TECNOLOGIAS } from '../constants';
import { Robbi9Mascot } from './Robbi9Mascot';
import { CuboLogo } from './CuboLogo';

interface QuestionsStepProps {
  initialAnswers: EvaluationAnswers;
  onFinishQuestions: (answers: EvaluationAnswers) => void;
  submitErrorMsg?: string | null;
  onClearSubmitError?: () => void;
}

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  initialAnswers,
  onFinishQuestions,
  submitErrorMsg,
  onClearSubmitError,
}) => {
  // Current active question index (0, 1, 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(
    submitErrorMsg ? 1 : 0
  );

  const [answers, setAnswers] = useState<EvaluationAnswers>(initialAnswers);
  const [rating, setRating] = useState<number>(initialAnswers.q1_nota || 0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Robbi9 mascot messages depending on question index
  const mascotMessages = [
    'Pergunta 1: Como você avalia a qualidade e o conteúdo da sua rodada de conhecimento?',
    'Pergunta 2: Qual foi a solução tecnológica apresentada durante a sua sessão?',
    'Pergunta 3: A solução apresentada atende a um desafio estratégico da sua empresa?',
  ];

  const handleNextQuestion = () => {
    setErrorMsg('');

    if (currentQuestionIndex === 0) {
      if (!rating) {
        setErrorMsg('Por favor, atribua uma nota de 1 a 5.');
        return;
      }
      // Move to Question 2
      setCurrentQuestionIndex(1);
    } else if (currentQuestionIndex === 1) {
      if (!answers.q2_solucao.trim()) {
        setErrorMsg('Por favor, selecione a solução apresentada.');
        return;
      }
      // Move to Question 3
      setCurrentQuestionIndex(2);
    } else if (currentQuestionIndex === 2) {
      if (!answers.q3_resolveudor.trim()) {
        setErrorMsg('Por favor, descreva como a solução atende às necessidades da sua empresa.');
        return;
      }
      // Finish all 3 questions and move to submitting screen
      onFinishQuestions({
        ...answers,
        q1_nota: rating,
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Robbi9 Mascot Header */}
      <div className="mb-6 flex justify-center">
        <Robbi9Mascot
          size="md"
          expression={currentQuestionIndex === 2 ? 'excited' : 'happy'}
          message={mascotMessages[currentQuestionIndex]}
        />
      </div>

      {/* Questions Form Frame */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Step Indicator Pills */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2BADFF] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2BADFF]" />
            Pergunta {currentQuestionIndex + 1} de 3
          </span>

          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestionIndex
                    ? 'w-8 bg-[#2BADFF] shadow-[0_0_12px_#2BADFF]'
                    : idx < currentQuestionIndex
                    ? 'w-3 bg-emerald-400'
                    : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Question Container - Rises ("Sobe") on step transition */}
        <div key={currentQuestionIndex} className="animate-fade-in transition-all">
          {/* ==================== QUESTION 1 ==================== */}
          {currentQuestionIndex === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  1. Como você avalia a sua experiência na rodada de conhecimento?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Atribua uma nota de 1 a 5 referente à qualidade do conteúdo e da apresentação.
                </p>
              </div>

              {/* Escala fixa 1 a 5 */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setRating(n);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className={`py-3.5 rounded-xl font-extrabold text-lg border transition-all cursor-pointer ${
                      rating === n
                        ? 'bg-[#2BADFF] border-[#2BADFF] text-[#0a192f] shadow-[0_0_15px_rgba(43,173,255,0.4)]'
                        : 'bg-white/5 border-white/10 text-white hover:border-[#2BADFF]/60'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================== QUESTION 2 ==================== */}
          {currentQuestionIndex === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  2. Qual solução tecnológica foi apresentada durante a sua sessão?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione a tecnologia demonstrada na sua rodada de conhecimento.
                </p>
              </div>

              {/* Múltipla escolha das 4 Rodadas de Conhecimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TECNOLOGIAS.map((tec) => (
                  <button
                    key={tec}
                    type="button"
                    onClick={() => {
                      setAnswers({ ...answers, q2_solucao: tec });
                      if (errorMsg) setErrorMsg('');
                    }}
                    className={`p-4 rounded-2xl font-bold text-sm border text-left flex items-center justify-between transition-all cursor-pointer ${
                      answers.q2_solucao === tec
                        ? 'bg-[#2BADFF] border-[#2BADFF] text-[#0a192f] shadow-[0_0_20px_rgba(43,173,255,0.4)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#2BADFF]/60'
                    }`}
                  >
                    <span>{tec}</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers.q2_solucao === tec ? 'border-[#0a192f] bg-[#0a192f]' : 'border-slate-500'
                    }`}>
                      {answers.q2_solucao === tec && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2BADFF]" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================== QUESTION 3 ==================== */}
          {currentQuestionIndex === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  3. A solução atende a um desafio ou necessidade real da sua empresa?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Descreva de que forma a tecnologia apresentada pode otimizar e agregar valor aos processos da sua empresa.
                </p>
              </div>

              {/* Text Input Response */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Sua Resposta: <span className="text-[#2BADFF]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={answers.q3_resolveudor}
                  onChange={(e) => {
                    setAnswers({ ...answers, q3_resolveudor: e.target.value });
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Descreva sintetizadamente como a solução pode atender aos desafios estratégicos da sua empresa..."
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#2BADFF] text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADFF] transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {(errorMsg || submitErrorMsg) && (
            <div className="mt-3 bg-rose-950/50 border border-rose-500/50 p-3 rounded-xl flex flex-col gap-1">
              <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                <span>⚠️</span> {errorMsg || submitErrorMsg}
              </p>
              {submitErrorMsg && (
                <p className="text-[11px] text-slate-400">
                  Por favor, escolha uma tecnologia diferente da lista na Pergunta 2 ou contate o suporte.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-white/10">
            {currentQuestionIndex > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                }}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Voltar
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNextQuestion}
              className="py-3.5 px-6 rounded-xl bg-[#2BADFF] hover:bg-[#1a94e0] text-[#0a192f] font-bold text-sm shadow-[0_0_20px_rgba(43,173,255,0.4)] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>
                {currentQuestionIndex === 2 ? 'Concluir Avaliação' : 'Responder e Avançar'}
              </span>
              {currentQuestionIndex === 2 ? (
                <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
