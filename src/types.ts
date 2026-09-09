export interface UserInfo {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
}

export interface EvaluationAnswers {
  q1_nota: number;        // 1 a 5 (escala fixa)
  q2_solucao: string;     // Google | AWS | Microsoft | Anthropic | OpenAI (fixo)
  q3_resolveudor: string; // Conseguimos resolver uma dor real do dia a dia
  q3_detalhes?: string;
}

export interface PrizeItem {
  id: string;
  label: string;
  description: string;
  color: string;
  iconName: string;
  isWinning: boolean;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  userInfo: UserInfo;
  answers: EvaluationAnswers;
  prizeWon: PrizeItem | null;
  emailSent: boolean;
}

export type AppStep = 'INFO' | 'QUESTIONS' | 'SUBMITTING' | 'SUBMITTED' | 'WHEEL' | 'PRIZE_RESULT' | 'ALREADY_VOTED';
