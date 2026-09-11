import React, { useState } from 'react';
import { SubmissionRecord, PrizeItem } from '../types';
import { Biti9Logo } from './Biti9Logo';
import { Download, Search, Trash2, Plus, Sparkles, Trophy, Users, BarChart3, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  submissions: SubmissionRecord[];
  submissionsError?: string | null;
  prizes: PrizeItem[];
  onUpdatePrizes: (newPrizes: PrizeItem[]) => void;
  onClearSubmissions: () => void;
  onRefreshSubmissions?: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  submissions,
  submissionsError,
  prizes,
  onUpdatePrizes,
  onClearSubmissions,
  onRefreshSubmissions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'prizes'>('submissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPrizeLabel, setNewPrizeLabel] = useState('');
  const [newPrizeIsWinning, setNewPrizeIsWinning] = useState(true);

  // Filter submissions by name, email or company
  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    return (
      sub.userInfo.nome.toLowerCase().includes(term) ||
      sub.userInfo.empresa.toLowerCase().includes(term) ||
      sub.userInfo.email.toLowerCase().includes(term)
    );
  });

  // Calculate average rating (escala fixa de 1 a 5)
  const ratings = submissions.map((s) => s.answers.q1_nota || 0).filter((n) => n > 0);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';

  // Export CSV function
  const exportCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      'Data/Hora',
      'Nome',
      'Empresa',
      'E-mail',
      'Telefone',
      'Nota (1-5)',
      'Tecnologia Apresentada',
      'Resolveu Dor?',
      'Detalhes Dor',
      'Prêmio Sorteado',
      'E-mail Enviado?',
    ];

    const rows = submissions.map((s) => [
      s.timestamp,
      `"${s.userInfo.nome}"`,
      `"${s.userInfo.empresa}"`,
      `"${s.userInfo.email}"`,
      `"${s.userInfo.telefone}"`,
      s.answers.q1_nota || '',
      `"${s.answers.q2_solucao}"`,
      `"${s.answers.q3_resolveudor.replace(/"/g, '""')}"`,
      `"${(s.answers.q3_detalhes || '').replace(/"/g, '""')}"`,
      `"${s.prizeWon?.label || 'Aguardando Roleta'}"`,
      s.emailSent ? 'Sim' : 'Não',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `avaliacoes_cubo_biti9_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPrize = () => {
    if (!newPrizeLabel.trim()) return;
    const newPrize: PrizeItem = {
      id: `p-${Date.now()}`,
      label: newPrizeLabel.trim(),
      description: newPrizeIsWinning
        ? 'Prêmio configurado pelo organizador Biti9'
        : 'Agradecemos por participar do nosso evento no Cubo!',
      color: newPrizeIsWinning ? '#2BADFF' : '#1E293B',
      iconName: newPrizeIsWinning ? 'Gift' : 'Smile',
      isWinning: newPrizeIsWinning,
    };
    onUpdatePrizes([...prizes, newPrize]);
    setNewPrizeLabel('');
  };

  const handleRemovePrize = (id: string) => {
    if (prizes.length <= 2) {
      alert('A roleta precisa ter pelo menos 2 prêmios!');
      return;
    }
    onUpdatePrizes(prizes.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-2xl flex flex-col p-3 sm:p-6 overflow-hidden animate-fade-in">
      <div className="max-w-6xl w-full mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Admin Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <Biti9Logo className="h-8" variant="white" />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Painel do Evento Cubo
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2BADFF]/10 text-[#2BADFF] border border-[#2BADFF]/30">
                  Organização
                </span>
              </h2>
              <p className="text-xs text-slate-400">Gerencie avaliações e prêmios da roleta</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onRefreshSubmissions && (
              <button
                onClick={onRefreshSubmissions}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
                title="Buscar avaliações mais recentes do servidor"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            )}

            <button
              onClick={exportCSV}
              disabled={submissions.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                submissions.length > 0
                  ? 'bg-[#2BADFF] text-[#0a192f] hover:bg-[#1a94e0] shadow-md cursor-pointer'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar TODAS as avaliações do evento? Essa ação não pode ser desfeita.')) {
                  onClearSubmissions();
                }
              }}
              disabled={submissions.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                submissions.length > 0
                  ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300 hover:bg-rose-900/60 cursor-pointer'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {submissionsError && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300">{submissionsError}</p>
          </div>
        )}

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/5 border-b border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#2BADFF]" /> Total Respostas
            </span>
            <span className="text-lg font-extrabold text-white mt-1 block">{submissions.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-[#2BADFF]" /> Média de Avaliação
            </span>
            <span className="text-lg font-extrabold text-[#2BADFF] mt-1 block">{avgRating} / 5</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Prêmios na Roleta
            </span>
            <span className="text-lg font-extrabold text-white mt-1 block">{prizes.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> E-mails Enviados
            </span>
            <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
              {submissions.filter((s) => s.emailSent).length} / {submissions.length}
            </span>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-white/10 px-4 pt-2 bg-white/5">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'border-[#2BADFF] text-[#2BADFF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Avaliações Recebidas ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'prizes'
                ? 'border-[#2BADFF] text-[#2BADFF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configurar Roleta ({prizes.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, empresa ou e-mail..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2BADFF]"
                />
              </div>

              {/* Submissions Table / Cards */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-400 text-sm">Nenhuma avaliação encontrada ainda.</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Preencha o formulário para visualizar os registros em tempo real!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">Participante / Empresa</th>
                        <th className="p-3">E-mail / Telefone</th>
                        <th className="p-3">Nota</th>
                        <th className="p-3">Tecnologia</th>
                        <th className="p-3">Resolveu Dor?</th>
                        <th className="p-3">Prêmio Sorteado</th>
                        <th className="p-3">E-mail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-white/5">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/10 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-white">{sub.userInfo.nome}</p>
                            <p className="text-[11px] text-slate-400">{sub.userInfo.empresa}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-[#2BADFF] font-mono">{sub.userInfo.email}</p>
                            <p className="text-[11px] text-slate-400">{sub.userInfo.telefone}</p>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded bg-[#2BADFF]/10 text-[#2BADFF] font-bold">
                              {sub.answers.q1_nota || '-'}/5
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 font-semibold">
                              {sub.answers.q2_solucao}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-emerald-400">
                            {sub.answers.q3_resolveudor}
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#2BADFF]/10 text-[#2BADFF] border border-[#2BADFF]/30 font-bold">
                              {sub.prizeWon?.label || 'Aguardando Roleta'}
                            </span>
                          </td>
                          <td className="p-3">
                            {sub.emailSent ? (
                              <span className="text-emerald-400 font-bold">Enviado</span>
                            ) : (
                              <span className="text-rose-400 font-bold">Não enviado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="space-y-6 max-w-2xl">
              {/* Add Prize Form */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2BADFF]">
                  Adicionar Nova Fatia/Prêmio à Roleta
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newPrizeLabel}
                    onChange={(e) => setNewPrizeLabel(e.target.value)}
                    placeholder="Ex: Mentoria Biti9, ou Mais sorte na próxima!"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2BADFF]"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        checked={newPrizeIsWinning}
                        onChange={(e) => setNewPrizeIsWinning(e.target.checked)}
                        className="rounded accent-[#2BADFF]"
                      />
                      <span>{newPrizeIsWinning ? 'Prêmio 🏆' : 'Lacuna 🍀'}</span>
                    </label>
                    <button
                      onClick={handleAddPrize}
                      className="px-4 py-2 rounded-xl bg-[#2BADFF] hover:bg-[#1a94e0] text-[#0a192f] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Prize List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fatias Ativas na Roleta ({prizes.length})
                </h3>
                <div className="space-y-2">
                  {prizes.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#2BADFF]/10 text-[#2BADFF] flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{p.label}</span>
                        {p.isWinning !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                            Prêmio 🏆
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                            Lacuna 🍀
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemovePrize(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remover Fatia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
