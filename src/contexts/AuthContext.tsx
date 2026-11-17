/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { assertSafeText, hashCredential, isValidEmail, sanitizeText } from '../utils/security';

const SUPER_ADMIN_EMAIL = 'joao.gls000@gmail.com';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isCustomAuth?: boolean;
}

interface StoredLocalAccount {
  uid: string;
  name: string;
  email: string;
  passHash?: string;
  pass?: string; // Legado, migrado automaticamente para passHash no próximo login
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAsDemo: (role: 'leader' | 'volunteer') => Promise<void>;
}

const LOCAL_STORAGE_USER_KEY = 'midiaescala_user_session';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'midiaescala_registered_accounts';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function safeReadAccounts(): Record<string, StoredLocalAccount> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, StoredLocalAccount>;
    }
  } catch {
    // Ignora JSON corrompido
  }
  return {};
}

export function removeLocalAccountByEmail(email?: string | null): void {
  if (!email) return;
  try {
    const normalized = email.trim().toLowerCase();
    const accounts = safeReadAccounts();
    if (accounts[normalized]) {
      delete accounts[normalized];
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  } catch {
    // Ignora erro de storage
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const failedAttemptsRef = useRef<{ count: number; lockedUntil: number }>({
    count: 0,
    lockedUntil: 0,
  });

  // Inicializa sessão
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setLoading(false);
      } else {
        try {
          const savedSession = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession) as AuthUser;
            // Garante que nenhuma sessão local forjada assuma o e-mail de Super Admin
            if (parsed?.email?.toLowerCase() === SUPER_ADMIN_EMAIL && parsed.isCustomAuth) {
              localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
              setCurrentUser(null);
            } else {
              setCurrentUser(parsed);
            }
          } else {
            setCurrentUser(null);
          }
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          setCurrentUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkRateLimit = () => {
    const now = Date.now();
    if (failedAttemptsRef.current.lockedUntil > now) {
      const secs = Math.ceil((failedAttemptsRef.current.lockedUntil - now) / 1000);
      throw new Error(`Muitas tentativas incorretas. Aguarde ${secs} segundos antes de tentar novamente.`);
    }
  };

  const registerFailedAttempt = () => {
    const next = failedAttemptsRef.current.count + 1;
    failedAttemptsRef.current = {
      count: next,
      lockedUntil: next >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
    };
  };

  const resetFailedAttempts = () => {
    failedAttemptsRef.current = { count: 0, lockedUntil: 0 };
  };

  const signInWithGoogle = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      await signInWithPopup(auth, googleProvider);
      resetFailedAttempts();
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
      throw error;
    }
  };

  // Entrada por E-mail e Senha
  const signInWithEmail = async (email: string, pass: string) => {
    checkRateLimit();

    const trimmedEmail = assertSafeText(email, 'E-mail', 120).toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      throw new Error('Por favor, informe um endereço de e-mail válido.');
    }
    if (!pass || pass.length < 6 || pass.length > 128) {
      throw new Error('A senha deve conter entre 6 e 128 caracteres.');
    }

    // Tenta primeiro via Firebase Auth oficial
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      if (cred.user) {
        resetFailedAttempts();
        setCurrentUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
        });
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        return;
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/unauthorized-domain' ||
        code === 'auth/network-request-failed'
      ) {
        // Proteção Crítica: impede falsificação da conta do Super Admin via cofre local
        if (trimmedEmail === SUPER_ADMIN_EMAIL) {
          throw new Error(
            'Por segurança, a conta do Super Admin exige autenticação verificada pelo botão "Continuar com o Google".'
          );
        }

        const accounts = safeReadAccounts();
        const existing = accounts[trimmedEmail];

        if (!existing) {
          registerFailedAttempt();
          throw new Error(
            'Nenhuma conta local encontrada com este e-mail. Utilize a aba "Criar Conta" ou entre com o Google.'
          );
        }

        const expectedHash = await hashCredential(trimmedEmail, pass);
        const matchesHash = existing.passHash ? existing.passHash === expectedHash : false;
        const matchesLegacy = !existing.passHash && existing.pass === pass;

        if (!matchesHash && !matchesLegacy) {
          registerFailedAttempt();
          throw new Error('E-mail ou senha incorretos.');
        }

        // Migra senha legada para hash SHA-256
        if (matchesLegacy) {
          accounts[trimmedEmail] = {
            uid: existing.uid,
            name: sanitizeText(existing.name, 100),
            email: trimmedEmail,
            passHash: expectedHash,
          };
          localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
        }

        resetFailedAttempts();
        const userObj: AuthUser = {
          uid: existing.uid,
          email: trimmedEmail,
          displayName: existing.name,
          isCustomAuth: true,
        };
        setCurrentUser(userObj);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        return;
      }

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        registerFailedAttempt();
        throw new Error('E-mail ou senha incorretos.');
      }
      if (code === 'auth/user-not-found') {
        registerFailedAttempt();
        throw new Error('Nenhuma conta encontrada com este e-mail.');
      }
      if (code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.');
      }
      throw err;
    }
  };

  // Cadastro de nova conta com nome, e-mail e senha
  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const cleanName = assertSafeText(name, 'Nome Completo', 100);
    const trimmedEmail = assertSafeText(email, 'E-mail', 120).toLowerCase();

    if (cleanName.length < 2) {
      throw new Error('Por favor, informe seu nome completo.');
    }
    if (!isValidEmail(trimmedEmail)) {
      throw new Error('Por favor, informe um endereço de e-mail válido.');
    }
    if (!pass || pass.length < 6 || pass.length > 128) {
      throw new Error('A senha deve conter no mínimo 6 caracteres.');
    }

    if (trimmedEmail === SUPER_ADMIN_EMAIL) {
      throw new Error(
        'Este e-mail é reservado ao Super Admin. Acesse com segurança usando "Continuar com o Google".'
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
        setCurrentUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanName,
        });
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') {
        const accounts = safeReadAccounts();
        if (accounts[trimmedEmail]) {
          throw new Error('Já existe uma conta cadastrada com este e-mail. Use a aba "Entrar".');
        }

        const passHash = await hashCredential(trimmedEmail, pass);
        const safeSlug = trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
        const newUid = `user_${safeSlug}`;
        accounts[trimmedEmail] = {
          uid: newUid,
          name: cleanName,
          email: trimmedEmail,
          passHash,
        };
        localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));

        const userObj: AuthUser = {
          uid: newUid,
          email: trimmedEmail,
          displayName: cleanName,
          isCustomAuth: true,
        };
        setCurrentUser(userObj);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        return;
      }
      if (code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está em uso. Tente entrar na aba "Entrar".');
      }
      if (code === 'auth/weak-password') {
        throw new Error('Senha muito fraca. Escolha uma senha com pelo menos 6 caracteres.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const quickLoginAsDemo = async (_role: 'leader' | 'volunteer') => {
    if (currentUser) return;
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        return;
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        quickLoginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
