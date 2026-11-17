/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Grid3X3,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { SkillLevel } from '../types';

export const SkillsMatrixPage: React.FC = () => {
  const { members, equipments, skills, isLeader, setSkillLevel, getSkillLevel } = useChurch();

  const [searchMember, setSearchMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCell, setActiveCell] = useState<{ memberId: string; equipmentId: string } | null>(
    null
  );
  const [skillError, setSkillError] = useState('');

  useEffect(() => {
    if (!activeCell) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCell(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCell]);

  const activeMembers = members.filter((m) => m.active);

  const filteredMembers = activeMembers.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  const filteredEquipments = equipments.filter((eq) =>
    selectedCategory === 'all' ? true : eq.category === selectedCategory
  );

  const levels: { level: SkillLevel | null; label: string; icon: string; color: string }[] = [
    { level: null, label: 'Não habilitado', icon: '—', color: 'text-gray-400' },
    {
      level: 'training',
      label: 'Em Treinamento',
      icon: '⏳',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    },
    {
      level: 'qualified',
      label: 'Apto',
      icon: '✓',
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    },
    {
      level: 'instructor',
      label: 'Instrutor',
      icon: '★',
      color: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    },
  ];

  const handleSelectLevel = async (
    memberId: string,
    equipmentId: string,
    level: SkillLevel | null
  ) => {
    setSkillError('');
    try {
      await setSkillLevel(memberId, equipmentId, level);
      setActiveCell(null);
    } catch (err: unknown) {
      setSkillError((err as Error)?.message || 'Não foi possível atualizar a habilitação.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {skillError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center justify-between">
          <span>{skillError}</span>
          <button onClick={() => setSkillError('')} className="text-xs font-bold underline cursor-pointer">
            Fechar
          </button>
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Matriz de Habilitação
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
              Edição Rápida
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Clique na célula para definir o nível de competência de cada voluntário por equipamento.
          </p>
        </div>

        {/* Legenda de Níveis */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white border border-black/[0.04] text-xs">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mr-1">
            Níveis:
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700">
            ★ Instrutor
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
            ✓ Apto
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
            ⏳ Treinamento
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-black/[0.04] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar voluntário na matriz..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-black/[0.03] border-none text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {['all', 'video', 'audio', 'lighting', 'projection', 'broadcast'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat === 'all'
                ? 'Todas as Áreas'
                : cat === 'video'
                ? 'Vídeo'
                : cat === 'audio'
                ? 'Áudio'
                : cat === 'lighting'
                ? 'Luz'
                : cat === 'projection'
                ? 'Projeção'
                : 'Transmissão'}
            </button>
          ))}
        </div>
      </div>

      {/* A Matriz Voluntários x Equipamentos */}
      <div className="rounded-3xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 sticky left-0 bg-white/95 backdrop-blur-sm z-20 min-w-[180px]">
                  Voluntário ({filteredMembers.length})
                </th>
                {filteredEquipments.map((eq) => {
                  const countApt = skills.filter(
                    (s) =>
                      s.equipmentId === eq.id &&
                      (s.level === 'qualified' || s.level === 'instructor')
                  ).length;

                  return (
                    <th
                      key={eq.id}
                      className="py-3.5 px-3 text-center min-w-[140px] text-xs font-bold text-[#1D1D1F] border-l border-black/[0.04]"
                    >
                      <div className="truncate font-semibold" title={eq.name}>
                        {eq.name}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            countApt === 0
                              ? 'bg-rose-500/10 text-rose-600'
                              : countApt === 1
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {countApt} aptos
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-black/[0.04] hover:bg-black/[0.015] transition-colors"
                >
                  {/* Coluna Fixa do Voluntário */}
                  <td className="py-3 px-4 sticky left-0 bg-white/95 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} size="sm" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#1D1D1F] block truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {member.role === 'superadmin'
                            ? 'Super Admin'
                            : member.role === 'ministry_admin'
                            ? 'Adm do Ministério'
                            : member.role === 'leader'
                            ? 'Líder'
                            : 'Voluntário'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Células de Equipamento */}
                  {filteredEquipments.map((eq) => {
                    const currentLevel = getSkillLevel(member.id, eq.id);
                    const isCellActive =
                      activeCell?.memberId === member.id && activeCell?.equipmentId === eq.id;

                    return (
                      <td
                        key={eq.id}
                        className="py-2 px-2 text-center border-l border-black/[0.04] relative"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!isLeader) return;
                            setActiveCell(
                              isCellActive
                                ? null
                                : { memberId: member.id, equipmentId: eq.id }
                            );
                          }}
                          disabled={!isLeader}
                          className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            !isLeader ? 'cursor-default' : 'hover:scale-102 active:scale-98'
                          } ${
                            currentLevel === 'instructor'
                              ? 'bg-purple-500/15 text-purple-700 border border-purple-500/20'
                              : currentLevel === 'qualified'
                              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20'
                              : currentLevel === 'training'
                              ? 'bg-amber-500/15 text-amber-700 border border-amber-500/20'
                              : 'text-gray-300 hover:bg-black/5'
                          }`}
                        >
                          {currentLevel === 'instructor' && <span>★ Instrutor</span>}
                          {currentLevel === 'qualified' && <span>✓ Apto</span>}
                          {currentLevel === 'training' && <span>⏳ Treinamento</span>}
                          {!currentLevel && <span>—</span>}
                          {isLeader && <ChevronDown className="w-2.5 h-2.5 opacity-40 ml-0.5" />}
                        </button>

                        {/* Dropdown Popover de Seleção Rápida de Nível */}
                        {isCellActive && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-44 rounded-2xl bg-white shadow-2xl border border-black/10 p-1.5 animate-in fade-in zoom-in-95">
                            <div className="space-y-1">
                              {levels.map((lvl) => (
                                <button
                                  key={String(lvl.level)}
                                  onClick={() => handleSelectLevel(member.id, eq.id, lvl.level)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                                    currentLevel === lvl.level
                                      ? 'bg-[#0071E3] text-white'
                                      : 'hover:bg-black/5 text-[#1D1D1F]'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span>{lvl.icon}</span>
                                    <span>{lvl.label}</span>
                                  </span>
                                  {currentLevel === lvl.level && <Check className="w-3.5 h-3.5" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dica da Liderança */}
      <div className="flex items-start gap-3 p-4 rounded-3xl bg-[#0071E3]/5 border border-[#0071E3]/15 text-xs text-[#0071E3]">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Como funciona a validação inteligente na hora de escalar:</strong> Ao montar a escala de um culto, o MídiaEscala consultará esta matriz e destacará prioritariamente os voluntários <strong>Aptos</strong> e <strong>Instrutores</strong> para cada posto, alertando caso alguém em treinamento seja selecionado e bloqueando conflitos de horário.
        </p>
      </div>
    </div>
  );
};
