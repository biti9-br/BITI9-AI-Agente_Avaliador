import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { EmailClient } from '@azure/communication-email';
import {
  getSubmissionsFromFirestore,
  saveSubmissionToFirestore,
  updateSubmissionInFirestore,
  clearAllSubmissionsFromFirestore,
} from './src/lib/firestoreService';

dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

async function readSubmissions(): Promise<any[]> {
  try {
    const firestoreData = await getSubmissionsFromFirestore();
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(firestoreData, null, 2), 'utf-8');
    return firestoreData;
  } catch (err) {
    console.warn('[Submissions] Não foi possível ler do Firestore, carregando backup local:', err);
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

// Fila simples para serializar leituras+escritas e evitar corromper o
// arquivo (ou deixar passar 2 votos da mesma pessoa) em caso de requisições
// simultâneas.
let writeQueue: Promise<any> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn, fn);
  writeQueue = result.catch(() => {});
  return result;
}

function normalize(str: string) {
  return String(str || '').trim().toLowerCase();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Biti9 Cubo Backend' });
  });

  // Lista todas as avaliações (Painel do Evento)
  app.get('/api/submissions', async (req, res) => {
    try {
      const submissions = await enqueue(readSubmissions);
      res.json(submissions);
    } catch (error: any) {
      console.error('[Submissions] Erro ao ler avaliações:', error);
      res.status(500).json({ error: 'Não foi possível ler as avaliações.' });
    }
  });

  // Verifica se um e-mail já participou (checagem por e-mail antes de avançar)
  app.get('/api/submissions/check', async (req, res) => {
    const email = normalize(String(req.query.email || ''));
    if (!email) {
      return res.status(400).json({ error: 'Informe o e-mail para verificação.' });
    }
    try {
      const submissions = await enqueue(readSubmissions);
      const existing = submissions.find(
        (s: any) => normalize(s.userInfo?.email) === email
      );
      res.json({
        alreadyVoted: !!existing,
        existingRecord: existing || null,
      });
    } catch (error: any) {
      console.error('[Submissions] Erro ao checar e-mail:', error);
      res.status(500).json({ error: 'Não foi possível checar o e-mail.' });
    }
  });

  // Grava uma avaliação — salva diretamente no Cloud Firestore e no backup local
  app.post('/api/submissions', async (req, res) => {
    try {
      const { userInfo, answers, prizeWon, emailSent } = req.body || {};
      if (!userInfo?.email || !answers?.q2_solucao) {
        return res.status(400).json({ error: 'Dados incompletos para gravar a avaliação.' });
      }

      const result = await enqueue(async () => {
        const submissions = await readSubmissions();

        const email = normalize(userInfo.email);
        const duplicate = submissions.some(
          (s: any) => normalize(s.userInfo?.email) === email
        );
        if (duplicate) {
          return { conflict: true };
        }

        const record = {
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toLocaleString('pt-BR'),
          userInfo,
          answers,
          prizeWon: prizeWon || null,
          emailSent: !!emailSent,
        };

        // Grava no Cloud Firestore
        try {
          await saveSubmissionToFirestore(record);
        } catch (fErr) {
          console.error('[Submissions] Erro ao gravar no Firestore:', fErr);
        }

        // Grava no arquivo local
        submissions.unshift(record);
        await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
        return { conflict: false, record };
      });

      if (result.conflict) {
        return res.status(409).json({
          error: 'Este e-mail já participou da avaliação e da roleta de prêmios. Cada participante pode rodar a roleta apenas 1 vez por e-mail.',
        });
      }
      return res.status(201).json(result.record);
    } catch (error: any) {
      console.error('[Submissions] Erro ao gravar avaliação:', error);
      res.status(500).json({ error: 'Não foi possível gravar a avaliação.' });
    }
  });

  // Limpa todas as avaliações (botão "Limpar" do Painel do Evento)
  app.delete('/api/submissions', async (req, res) => {
    try {
      await enqueue(async () => {
        try {
          await clearAllSubmissionsFromFirestore();
        } catch (fErr) {
          console.error('[Submissions] Erro ao apagar no Firestore:', fErr);
        }
        await fs.writeFile(DATA_FILE, '[]', 'utf-8');
      });
      res.json({ status: 'ok' });
    } catch (error: any) {
      console.error('[Submissions] Erro ao limpar avaliações:', error);
      res.status(500).json({ error: 'Não foi possível limpar as avaliações.' });
    }
  });

  // Atualiza um registro existente (status de e-mail ou prêmio sorteado)
  app.patch('/api/submissions/:id', async (req, res) => {
    const { id } = req.params;
    const { emailSent, prizeWon } = req.body || {};
    try {
      const updated = await enqueue(async () => {
        const updates: any = {};
        if (emailSent !== undefined) updates.emailSent = !!emailSent;
        if (prizeWon !== undefined) updates.prizeWon = prizeWon;

        try {
          await updateSubmissionInFirestore(id, updates);
        } catch (fErr) {
          console.error('[Submissions] Erro ao atualizar no Firestore:', fErr);
        }

        const submissions = await readSubmissions();
        const idx = submissions.findIndex((s: any) => s.id === id);
        if (idx === -1) return null;
        if (emailSent !== undefined) submissions[idx].emailSent = !!emailSent;
        if (prizeWon !== undefined) submissions[idx].prizeWon = prizeWon;
        await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
        return submissions[idx];
      });
      if (!updated) return res.status(404).json({ error: 'Registro não encontrado.' });
      res.json(updated);
    } catch (error: any) {
      console.error('[Submissions] Erro ao atualizar registro:', error);
      res.status(500).json({ error: 'Não foi possível atualizar o registro.' });
    }
  });

  // Endpoint de diagnóstico para verificar se as variáveis do Azure estão visíveis no servidor
  app.get('/api/debug-email-config', (req, res) => {
    const connStr = (
      process.env.COMMUNICATION_SERVICES_CONNECTION_STRING ||
      process.env.COMMUNICATION_SERVICES_CONNECTION_STR ||
      ''
    ).trim();
    const sender = (
      process.env.AZURE_EMAIL_SENDER_ADDRESS ||
      process.env.AZURE_EMAIL_SENDER ||
      process.env.AZURE_SENDER_ADDRESS ||
      ''
    ).trim();

    return res.json({
      connectionStringConfigured: !!connStr,
      senderAddressConfigured: !!sender,
      connectionStringPrefix: connStr ? connStr.substring(0, 25) + '...' : 'Não configurado',
      senderAddressValue: sender || 'Não configurado',
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('AZURE') || k.includes('COMMUNICATION') || k.includes('EMAIL')),
    });
  });

  // Azure Email Dispatch API Endpoint
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, nome, empresa, premio, descricao, mensagem } = req.body || {};

      if (!to) {
        return res.status(400).json({ error: 'E-mail de destino não informado.' });
      }

      const connectionString = (
        process.env.COMMUNICATION_SERVICES_CONNECTION_STRING ||
        process.env.COMMUNICATION_SERVICES_CONNECTION_STR ||
        ''
      ).trim();

      const senderAddress = (
        process.env.AZURE_EMAIL_SENDER_ADDRESS ||
        process.env.AZURE_EMAIL_SENDER ||
        process.env.AZURE_SENDER_ADDRESS ||
        ''
      ).trim();

      console.log(`[Azure Email] Tentando enviar e-mail para: ${to}`);
      console.log(`[Azure Email] Status das Chaves: ConnectionString=${!!connectionString}, SenderAddress=${senderAddress}`);

      if (!connectionString || !senderAddress) {
        console.warn('[Azure Email] Connection String ou Sender Address não configurados nas variáveis de ambiente.');
        return res.status(200).json({
          status: 'simulated',
          message: 'Servidor recebeu o pedido. Defina COMMUNICATION_SERVICES_CONNECTION_STRING e AZURE_EMAIL_SENDER_ADDRESS nas configurações para efetuar o disparo real.',
        });
      }

      const emailClient = new EmailClient(connectionString);

      const emailContent = {
        subject: `🎉 Biti9 @ Cubo: Confirmação do seu Prêmio - ${premio || 'Brinde Especial'}`,
        plainText: mensagem || `Olá ${nome}, você ganhou o prêmio "${premio}". Em breve a equipe da Biti9 entrará em contato.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: 800;">Biti9 @ Cubo Itaú</h2>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Confirmação da sua Rodada de Conhecimento</p>
            </div>

            <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #475569; margin-bottom: 24px;">
              <p style="font-size: 16px; margin-top: 0; color: #f8fafc;">Olá, <strong>${nome || 'Participante'}</strong>!</p>
              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
                Muito obrigado por participar da nossa dinâmica no Cubo e compartilhar o seu feedback!
              </p>

              <div style="background-color: #0284c7; color: #ffffff; padding: 18px; border-radius: 10px; text-align: center; margin: 20px 0; border: 1px solid #38bdf8;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; opacity: 0.9; font-weight: 600;">Seu Prêmio Sorteado</span>
                <strong style="font-size: 22px; display: block; margin-top: 4px; font-weight: 800;">${premio || 'Brinde Biti9'}</strong>
              </div>

              ${descricao ? `<p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 10px;">${descricao}</p>` : ''}
            </div>

            <div style="background-color: #0369a1; background-opacity: 0.2; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #e0f2fe; margin: 0; line-height: 1.5;">
                🔔 <strong>Informação importante:</strong> Em breve, alguém da <strong>Equipe da Biti9</strong> entrará em contato com você para passar mais informações referentes ao prêmio.
              </p>
            </div>

            <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />

            <div style="text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0;">
                Empresa: <strong>${empresa || 'Não informada'}</strong> | Registrado para: <strong>${to}</strong>
              </p>
              <p style="font-size: 11px; color: #475569; margin-top: 8px;">
                Biti9 Automações e Tecnologia | Evento Cubo
              </p>
            </div>
          </div>
        `,
      };

      const recipients = { to: [{ address: to }] };

      const trySendEmail = async (sender: string) => {
        console.log(`[Azure Email] Enviando mensagem via Azure SDK com remetente: ${sender}`);
        const poller = await emailClient.beginSend({
          senderAddress: sender,
          content: emailContent,
          recipients: recipients,
        });
        return await poller.pollUntilDone();
      };

      let result;
      try {
        result = await trySendEmail(senderAddress);
      } catch (firstErr: any) {
        const errMsg = String(firstErr?.message || firstErr || '');
        console.warn('[Azure Email Warning] Erro no primeiro disparo:', errMsg);

        // Se o erro for de nome de usuário inválido (ex: suporterobbi9 não cadastrado em MailFrom do Azure)
        if (
          errMsg.includes('Invalid email sender username') ||
          errMsg.includes('InvalidSenderUserName') ||
          firstErr?.code === 'InvalidSenderUserName'
        ) {
          const domain = senderAddress.includes('@') ? senderAddress.split('@')[1] : senderAddress;
          const fallbackSender = `DoNotReply@${domain}`;
          console.log(`[Azure Email Fallback] Aplicando remetente padrão do Azure: ${fallbackSender}`);
          result = await trySendEmail(fallbackSender);
        } else {
          throw firstErr;
        }
      }

      console.log(`[Azure Email] Resultado do Envio: Status=${result.status}, ID=${result.id}`);

      if (result.status === 'Succeeded') {
        return res.status(200).json({
          status: 'success',
          messageId: result.id,
        });
      } else {
        console.error('[Azure Email Error Result]:', result);
        return res.status(500).json({
          error: `O envio do e-mail não foi concluído com sucesso pelo Azure. Status: ${result.status}`,
          details: result,
        });
      }
    } catch (error: any) {
      console.error('[Azure Email Exception]:', error);
      return res.status(500).json({
        error: 'Falha ao enviar e-mail via Azure Communication Services.',
        details: error?.message || String(error),
      });
    }
  });

  // Serve Vite frontend in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Servidor Biti9 com Azure Email rodando na porta ${PORT}`);
  });
}

startServer();
