/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChurch } from '../contexts/ChurchContext';
import { BrandLogo as Logo } from '../components/ui/BrandLogo';
import { Sparkles, LogIn, UserPlus, KeyRound, ArrowRight, ShieldCheck, Info, Lock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { joinChurchByCode } = useChurch();

  const [mode, setMode] = useState<'login' | 'signup' | 'join'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Por favor, informe seu nome completo.');
        await signUpWithEmail(name.trim(), email, password);
      } else if (mode === 'join') {
        if (!inviteCode.trim()) throw new Error('Por favor, informe o código de convite da igreja.');
        await signInWithEmail(email, password);
        const joined = await joinChurchByCode(inviteCode.trim());
        if (!joined) throw new Error('Código de convite não encontrado. Verifique com seu líder.');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error)?.message || 'Ocorreu um erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        return;
      }
      setErrorMsg((err as Error)?.message || 'Erro ao fazer login com o Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="w-full max-w-md">
        {/* Marca & Header com Novo Logo Oficial */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="xl" showText={false} className="mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Mídia<span className="text-[#0071E3]">Escala</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-xs">
            Escalas e voluntários para o Ministério de Mídia da Igreja
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          {/* Mensagem de Erro com Botão Alternativo */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 space-y-2">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <p>{successMsg}</p>
            </div>
          )}

          {/* Abas Alternadoras com Suporte a Senha */}
          <div className="flex rounded-full bg-black/[0.04] p-1 mb-5 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Criar Conta
            </button>
            <button
              onClick={() => {
                setMode('join');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Com Convite
            </button>
          </div>

          {/* Formulário de E-mail e Senha */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            )}

            {mode === 'join' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Código de Convite da Igreja
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: MIDIA2026"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs font-mono font-bold tracking-wider uppercase text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="seuemail@igreja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Senha
                </label>
                <span className="text-[10px] text-gray-400">mínimo 6 dígitos</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0071E3]/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Aguarde...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Senha</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Conta com Senha</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Entrar com Convite & Senha</span>
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/5" />
            </span>
            <span className="relative bg-white px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              ou entre com 1 clique
            </span>
          </div>

          {/* Botão Google Sign-In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full bg-black/[0.04] hover:bg-black/[0.07] text-[#1D1D1F] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 border border-black/5"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          {/* Nota Super Admin */}
          <div className="mt-5 p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2 text-left">
            <Info className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-900 leading-relaxed">
              Super Admin geral do site: <strong className="font-semibold">joao.gls000@gmail.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
