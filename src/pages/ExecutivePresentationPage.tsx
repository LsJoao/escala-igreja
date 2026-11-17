/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  ShieldCheck,
  Video,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Lock,
  MessageCircle,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';

export const ExecutivePresentationPage: React.FC = () => {
  const { isSuperAdmin, isMinistryAdmin } = useChurch();
  const isAdmin = isSuperAdmin || isMinistryAdmin;

  const handlePrint = () => {
    window.print();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#1D1D1F]">
          Documento Restrito à Administração
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          A Apresentação Executiva em PDF é exclusiva para o Administrador Geral (Super Admin) e Administradores do Ministério. Para instruções de uso diário, acesse o Manual do Usuário.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            to="/how-to-use"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED]"
          >
            Abrir Como Usar (PDF)
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.04] text-[#1D1D1F] hover:bg-black/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-300 print:p-0 print:max-w-none">
      {/* Barra de Ação Superior (Oculta na Impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-black/[0.06] shadow-sm mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1D1D1F]">
                Apresentação Executiva do MídiaEscala
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                Exclusivo ADM
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Documento formal preparado para Diretoria Executiva, Pastores e Administração
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/25 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Salvar / Imprimir como PDF</span>
        </button>
      </div>

      {/* DOCUMENTO EXECUTIVO / PITCH DECK */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-8 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:p-0 space-y-10 text-[#1D1D1F]">
        
        {/* Cabeçalho do Documento */}
        <div className="border-b border-black/[0.08] pb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Documento Executivo de Produto, Governança & Segurança</span>
            </div>
            <span className="text-xs font-semibold text-gray-400">
              Novembro de 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] mt-4 leading-tight">
            MídiaEscala: Solução de Governança, Escala & Capacitação para Ministério de Mídia
          </h1>
          <p className="text-base text-gray-600 mt-3 max-w-3xl leading-relaxed">
            Plataforma digital especializada na gestão operacional de voluntários, matriz de habilidades em equipamentos audiovisuais, segurança de dados e eliminação de conflitos de escala nos cultos e eventos da igreja.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-black/[0.04] text-xs text-gray-500">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Administrador Geral:</span>
              <strong className="text-[#1D1D1F]">joao.gls000@gmail.com</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Arquitetura de Nuvem:</span>
              <strong className="text-emerald-600">Firebase Spark (Custo Zero Operacional)</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Plataforma:</span>
              <strong className="text-[#1D1D1F]">PWA Multiplataforma (iOS, Android, Web)</strong>
            </div>
          </div>
        </div>

        {/* 1. Diagnóstico do Problema e Motivação */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>O Cenário Atual e a Dor do Ministério</span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Igrejas contemporâneas investem dezenas a centenas de milhares de reais em equipamentos audiovisuais profissionais (câmeras mirrorless como Sony FX3, mesas de som digitais Behringer X32, iluminação cênica DMX e switchers de corte Blackmagic). No entanto, a gestão das pessoas que operam essa estrutura ainda é feita de forma rudimentar via grupos de WhatsApp ou planilhas estáticas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15">
              <span className="text-xs font-bold text-rose-700 block">Risco aos Equipamentos</span>
              <p className="text-xs text-gray-600 mt-1">
                Pessoas sem capacitação mínima escaladas para operar equipamentos complexos por falta de visibilidade do líder.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
              <span className="text-xs font-bold text-amber-700 block">Faltas e Conflitos no Domingo</span>
              <p className="text-xs text-gray-600 mt-1">
                Voluntários escalados em horários de viagem ou em mais de uma função simultânea no mesmo culto.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-500/5 border border-gray-500/15">
              <span className="text-xs font-bold text-gray-700 block">Sobrecarga da Liderança</span>
              <p className="text-xs text-gray-600 mt-1">
                Horas semanais perdidas cobrando confirmações uma a uma por mensagem individual.
              </p>
            </div>
          </div>
        </section>

        {/* 2. A Lógica Central do MídiaEscala */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>A Lógica Funcional do Aplicativo</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-[#0071E3]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Matriz de Habilitações
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cada voluntário possui um nível registrado para cada equipamento: <strong>Em Treinamento</strong>, <strong>Apto</strong> ou <strong>Instrutor</strong>. O sistema filtra e alerta automaticamente o líder ao escolher operadores, impedindo que posições críticas fiquem vulneráveis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Validação Cruzada de Conflito
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Antes de confirmar uma escala, o algoritmo verifica duas regras matemáticas: (1) o voluntário marcou indisponibilidade na data? (2) o voluntário já está escalado em outra câmera ou mesa no mesmo culto? Em caso positivo, o alerta é emitido imediatamente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                  SLA de Confirmação & Mural de Trocas
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                O voluntário confirma ou recusa sua presença com 1 toque no celular. Caso não possa servir, abre um pedido no <em>Mural de Trocas</em>. Outro irmão apto se voluntaria para cobrir a vaga, e o líder apenas homologa com um clique.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Acionamento Ágil via WhatsApp
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                A integração gera textos pré-formatados profissionais (lembretes de escala, convites para servir e pautas de alinhamento) prontos para disparo direto no WhatsApp oficial do voluntário, sem digitação repetitiva.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/20 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
                  Portão de Homologação & Segurança Zero-Trust (Anti-Injeção)
                </h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Para blindar a igreja contra acessos não autorizados, <strong>novos voluntários permanecem retidos em análise até aprovação formal da liderança</strong>. Além disso, o sistema aplica sanitização rigorosa contra ataques de injeção (SQL/NoSQL Injection e XSS), proteção contra força bruta no login, hash SHA-256 de credenciais e regras de segurança Zero-Trust no Firestore que bloqueiam auto-promoção de cargo e vazamento de dados entre congregações.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Governança e Hierarquia de Perfis (RBAC) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Estrutura de Perfis e Segurança de Acesso</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-black/[0.08] rounded-2xl overflow-hidden">
              <thead className="bg-[#F5F5F7] border-b border-black/[0.08]">
                <tr>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase">Perfil</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase">Atribuições</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase">Permissões no Firestore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#0071E3]">Super Admin (Site)</td>
                  <td className="py-3 px-4 text-gray-600">
                    Administrador geral do sistema (<strong>joao.gls000@gmail.com</strong>). Provisiona, gerencia e cria novas igrejas/congregações na plataforma.
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    email_verified == true; acesso global multi-igreja
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-purple-700">Adm do Ministério</td>
                  <td className="py-3 px-4 text-gray-600">
                    Líder geral de mídia da igreja local. Cadastra equipamentos, gerencia toda a equipe, acessa esta Apresentação Executiva e aprova trocas.
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    Gestão total dos recursos da própria igreja
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-gray-800">Líder de Equipe</td>
                  <td className="py-3 px-4 text-gray-600">
                    Coordenador de culto ou líder técnico de áudio/vídeo. Monta escalas, aprova voluntários e acompanha presenças.
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    Criação e edição de escalas, cultos e homologações
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-gray-500">Voluntário</td>
                  <td className="py-3 px-4 text-gray-600">
                    Operador de câmera, som, luz ou projeção. Cria conta por e-mail/senha ou Google, <strong>aguarda aprovação da liderança</strong> para ingressar, visualiza escalas, confirma presença e consulta o Manual Como Usar (PDF).
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    Leitura isolada após approvalStatus == 'approved'
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Viabilidade Financeira: Custo Zero no Firebase Spark */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              4
            </span>
            <span>Viabilidade Financeira & Eficiência Operacional</span>
          </h2>

          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-500/20 text-xs text-emerald-950 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Orçamento Mensal de Infraestrutura: R$ 0,00</span>
            </div>
            <p className="leading-relaxed">
              O MídiaEscala foi engenheirado intencionalmente para operar com maestria dentro da cota gratuita permanente do <strong>Firebase (Plano Spark)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900">
              <li><strong>Zero Cloud Functions:</strong> A lógica de negócio reside no cliente React otimizado com regras ABAC no Firestore.</li>
              <li><strong>Zero Cloud Storage:</strong> Avatares gerados algoritmicamente por iniciais sem dependência de hospedagem de imagens.</li>
              <li><strong>Persistência Offline IndexedDB:</strong> Leituras em cache local reduzem drasticamente as chamadas ao servidor.</li>
              <li><strong>PWA sem Taxas de App Store / Play Store:</strong> Instalável instantaneamente em iPhones e Androids sem taxas anuais de desenvolvedor.</li>
            </ul>
          </div>
        </section>

        {/* Rodapé Executivo */}
        <div className="pt-8 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>MídiaEscala © 2026 — Ministério de Mídia & Audiovisual</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Apresentação Executiva Confidencial (Uso Interno da Administração)</span>
          </span>
        </div>

      </div>
    </div>
  );
};
