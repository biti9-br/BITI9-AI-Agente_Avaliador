import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Banco de dados Cloud Firestore configurado com as chaves cadastradas do projeto
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const SUBMISSIONS_COLLECTION = 'submissions';

export interface SubmissionData {
  id: string;
  timestamp: string;
  userInfo: {
    nome: string;
    empresa: string;
    email: string;
    telefone: string;
  };
  answers: {
    q1_nota: number;
    q2_solucao: string;
    q3_resolveudor: string;
    q3_detalhes?: string;
  };
  prizeWon?: any;
  emailSent?: boolean;
  createdAt?: string;
}

export async function getSubmissionsFromFirestore(): Promise<SubmissionData[]> {
  try {
    const colRef = collection(db, SUBMISSIONS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: SubmissionData[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as SubmissionData;
      if (data && data.id) {
        list.push(data);
      }
    });
    return list.sort((a, b) => (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || ''));
  } catch (error) {
    console.error('[FirestoreService] Erro ao buscar submissões do Firestore:', error);
    throw error;
  }
}

export async function saveSubmissionToFirestore(record: SubmissionData): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, record.id);
    await setDoc(docRef, {
      ...record,
      createdAt: new Date().toISOString()
    });
    console.log('[FirestoreService] Submissão gravada no Cloud Firestore com ID:', record.id);
  } catch (error) {
    console.error('[FirestoreService] Erro ao gravar submissão no Firestore:', error);
    throw error;
  }
}

export async function updateSubmissionInFirestore(id: string, updates: Partial<SubmissionData>): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
    await updateDoc(docRef, updates);
    console.log('[FirestoreService] Submissão atualizada no Cloud Firestore ID:', id);
  } catch (error) {
    console.error('[FirestoreService] Erro ao atualizar submissão no Firestore:', error);
    throw error;
  }
}

export async function clearAllSubmissionsFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, SUBMISSIONS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(promises);
    console.log('[FirestoreService] Todas as submissões foram apagadas do Cloud Firestore');
  } catch (error) {
    console.error('[FirestoreService] Erro ao limpar submissões do Firestore:', error);
    throw error;
  }
}
