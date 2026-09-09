// Domínios de e-mail pessoal bloqueados — exigimos e-mail corporativo.
// Edite essa lista se precisar liberar/bloquear outros domínios.
export const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'msn.com',
  'bol.com.br',
  'terra.com.br',
  'uol.com.br',
];

export function isCorporateEmail(email: string): boolean {
  const formatoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (!formatoOk) return false;
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  return !FREE_EMAIL_DOMAINS.includes(domain);
}

// Tecnologias apresentadas na rodada — resposta fixa da Pergunta 2.
// Essa mesma lista é usada para a regra de "1 voto por tecnologia".
export const TECNOLOGIAS = ['Google', 'AWS', 'Microsoft', 'Anthropic', 'OpenAI'] as const;
export type Tecnologia = (typeof TECNOLOGIAS)[number];
