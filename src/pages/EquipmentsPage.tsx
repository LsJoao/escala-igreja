/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Video,
  Plus,
  Search,
  Wrench,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Users,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { CategoryBadge, SkillBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';

export const EquipmentsPage: React.FC = () => {
  const {
    equipments,
    members,
    skills,
    isLeader,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  } = useChurch();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('video');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>('available');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmação de exclusão
  const [equipToDelete, setEquipToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const openAddModal = () => {
    setEditingEquip(null);
    setName('');
    setCategory('video');
    setDescription('');
    setStatus('available');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquip(eq);
    setName(eq.name);
    setCategory(eq.category);
    setDescription(eq.description || '');
    setStatus(eq.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingEquip) {
        await updateEquipment(editingEquip.id, {
          name: name.trim(),
          category,
          description: description.trim(),
          status,
        });
      } else {
        await addEquipment({
          name: name.trim(),
          category,
          description: description.trim(),
          status,
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError((err as Error)?.message || 'Erro ao salvar equipamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, equipName: string) => {
    setDeleteError('');
    setEquipToDelete({ id, name: equipName });
  };

  const handleConfirmDelete = async () => {
    if (!equipToDelete) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteEquipment(equipToDelete.id);
      setEquipToDelete(null);
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || 'Não foi possível excluir o equipamento.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtros
  const filteredEquipments = equipments.filter((eq) => {
    const matchSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      (eq.description && eq.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      selectedCategory === 'all' ? true : eq.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'video', label: 'Vídeo / Câmeras' },
    { key: 'audio', label: 'Áudio / Som' },
    { key: 'lighting', label: 'Iluminação' },
    { key: 'projection', label: 'Projeção / Telão' },
    { key: 'broadcast', label: 'Transmissão' },
    { key: 'other', label: 'Outros' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Equipamentos do Ministério
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre câmeras, mesas de som, iluminação, projeção e switchers de corte.
          </p>
        </div>

        {isLeader && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Equipamento</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-black/[0.04] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-black/[0.03] border-none text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Equipamentos */}
      {filteredEquipments.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
          <Video className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1D1D1F]">
            Nenhum equipamento cadastrado
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Cadastre os aparelhos operados no ministério de mídia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((eq) => {
            // Operadores habilitados para este equipamento
            const qualifiedSkills = skills.filter((s) => s.equipmentId === eq.id);

            return (
              <div
                key={eq.id}
                className="p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <CategoryBadge category={eq.category} />
                        {eq.status === 'available' ? (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>Operacional</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-500 flex items-center gap-0.5 font-medium">
                            <Wrench className="w-3 h-3" />
                            <span>Manutenção</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#1D1D1F]">
                        {eq.name}
                      </h3>
                    </div>

                    {isLeader && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(eq)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-black/5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {eq.description && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {eq.description}
                    </p>
                  )}
                </div>

                {/* Operadores Aptos */}
                <div className="mt-4 pt-3 border-t border-black/[0.04]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Operadores Aptos</span>
                    </span>
                    <span className="text-[#0071E3] font-bold">
                      {qualifiedSkills.length} pessoas
                    </span>
                  </div>

                  {qualifiedSkills.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic">
                      Nenhum operador habilitado ainda.
                    </span>
                  ) : (
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {qualifiedSkills.map((sk) => {
                        const member = members.find((m) => m.id === sk.memberId);
                        if (!member) return null;
                        return (
                          <div
                            key={sk.id}
                            className="flex items-center justify-between py-1 px-2 rounded-xl bg-black/[0.02]"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Avatar name={member.name} size="sm" />
                              <span className="text-xs font-medium text-[#1D1D1F] truncate">
                                {member.name}
                              </span>
                            </div>
                            <SkillBadge level={sk.level} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Equipamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                {editingEquip ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nome do Equipamento / Posto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Câmera 1 (Sony FX3)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="video">Vídeo (Câmeras)</option>
                    <option value="audio">Áudio (Mesa de Som)</option>
                    <option value="lighting">Iluminação (Mesa DMX)</option>
                    <option value="projection">Projeção (Holyrics/Telão)</option>
                    <option value="broadcast">Transmissão (ATEM/OBS)</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="available">Disponível</option>
                    <option value="maintenance">Em Manutenção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Descrição / Localização
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Câmera central com tripé pesado e teleobjetiva 70-200mm f/2.8."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(equipToDelete)}
        title={`Remover "${equipToDelete?.name || 'equipamento'}"?`}
        description="Este equipamento será removido da lista do ministério."
        confirmLabel="Sim, Remover"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setEquipToDelete(null);
            setDeleteError('');
          }
        }}
      />
    </div>
  );
};
