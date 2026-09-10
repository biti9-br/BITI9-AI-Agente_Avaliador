import React, { useState } from 'react';
import { User, Building2, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserInfo } from '../types';
import { isCorporateEmail } from '../constants';
import { Robbi9Mascot } from './Robbi9Mascot';
import { CuboLogo } from './CuboLogo';

interface InfoStepProps {
  initialData: UserInfo;
  onNext: (data: UserInfo) => void;
}

export const InfoStep: React.FC<InfoStepProps> = ({ initialData, onNext }) => {
  const [formData, setFormData] = useState<UserInfo>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserInfo, string>> = {};

    if (!formData.nome.trim() || formData.nome.trim().length < 2) {
      newErrors.nome = 'Por favor, informe seu nome completo.';
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'Informe o nome da sua empresa.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailTrim = formData.email.trim();
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      newErrors.email = 'Esse e-mail não parece completo — confirme o seu e-mail.';
    }

    const phoneDigits = formData.telefone.replace(/\D/g, '');
    if (!formData.telefone.trim() || phoneDigits.length < 8) {
      newErrors.telefone = 'Por favor, digite um número de telefone com pelo menos 8 dígitos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowSummaryModal(true);
    }
  };

  const handleConfirmSummary = () => {
    onNext(formData);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Robbi9 Mascot greeting */}
      <div className="mb-6 flex justify-center">
        <Robbi9Mascot
          size="md"
          expression="happy"
          message="Olá! Preencha suas informações abaixo para começar."
        />
      </div>

      {/* Main Form Container */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 border-b border-slate-800/80 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2BADFF] inline-block shadow-[0_0_12px_#2BADFF]" />
            Preencha as suas informações
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2BADFF] mb-1.5">
              Nome Completo <span className="text-[#2BADFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5 text-[#2BADFF]" />
              </div>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  if (errors.nome) setErrors({ ...errors, nome: undefined });
                }}
                placeholder="Ex: Maria Silva"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border ${
                  errors.nome ? 'border-rose-500/80 focus:ring-rose-500' : 'border-white/10 focus:border-[#2BADFF]'
                } text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADFF] transition-all`}
              />
            </div>
            {errors.nome && (
              <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1 font-medium">
                ⚠️ {errors.nome}
              </p>
            )}
          </div>

          {/* Nome da Empresa */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2BADFF] mb-1.5">
              Nome da Empresa <span className="text-[#2BADFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-5 h-5 text-[#2BADFF]" />
              </div>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => {
                  setFormData({ ...formData, empresa: e.target.value });
                  if (errors.empresa) setErrors({ ...errors, empresa: undefined });
                }}
                placeholder="Ex: Biti9 Soluções Tecnológicas"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border ${
                  errors.empresa ? 'border-rose-500/80 focus:ring-rose-500' : 'border-white/10 focus:border-[#2BADFF]'
                } text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADFF] transition-all`}
              />
            </div>
            {errors.empresa && (
              <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1 font-medium">
                ⚠️ {errors.empresa}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2BADFF] mb-1.5">
              E-mail <span className="text-[#2BADFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5 text-[#2BADFF]" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="seu.email@exemplo.com"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border ${
                  errors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-white/10 focus:border-[#2BADFF]'
                } text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADFF] transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1 font-medium">
                ⚠️ {errors.email}
              </p>
            )}
          </div>

          {/* N° de Telefone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2BADFF] mb-1.5">
              N° de Telefone <span className="text-[#2BADFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5 text-[#2BADFF]" />
              </div>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => {
                  setFormData({ ...formData, telefone: e.target.value });
                  if (errors.telefone) setErrors({ ...errors, telefone: undefined });
                }}
                placeholder="(11) 98765-4321"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border ${
                  errors.telefone ? 'border-rose-500/80 focus:ring-rose-500' : 'border-white/10 focus:border-[#2BADFF]'
                } text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADFF] transition-all`}
              />
            </div>
            {errors.telefone && (
              <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1 font-medium">
                ⚠️ {errors.telefone}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#2BADFF] hover:bg-[#1a94e0] text-[#0a192f] font-bold text-base shadow-[0_0_20px_rgba(43,173,255,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Avançar para Avaliação</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>

      {/* Cubo Itaú Logo Below Container */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <CuboLogo size="lg" />
      </div>

      {/* Confirmation Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0a192f] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#2BADFF]/20 text-[#2BADFF]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirmar Informações</h3>
                <p className="text-xs text-slate-400">Está tudo certo com os seus dados?</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-sm mb-6">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Nome:</span>
                <span className="text-white font-semibold">{formData.nome}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Empresa:</span>
                <span className="text-white font-semibold">{formData.empresa}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">E-mail:</span>
                <span className="text-[#2BADFF] font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Telefone:</span>
                <span className="text-white font-semibold">{formData.telefone}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Editar
              </button>
              <button
                onClick={handleConfirmSummary}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2BADFF] text-[#0a192f] font-bold text-sm shadow-[0_0_15px_rgba(43,173,255,0.4)] hover:bg-[#1a94e0] transition-colors cursor-pointer"
              >
                Confirmar e Iniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
