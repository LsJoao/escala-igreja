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
  Tags,
  RotateCcw,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { CategoryBadge, SkillBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  CategoryBadgeVariant,
  DEFAULT_EQUIPMENT_CATEGORIES,
  Equipment,
  EquipmentCategory,
  EquipmentCategoryItem,
  EquipmentStatus,
} from '../types';

const COLOR_OPTIONS: { value: CategoryBadgeVariant; label: string; dot: string }[] = [
  { value: 'info', label: 'Azul', dot: 'bg-[#0071E3]' },
  { value: 'purple', label: 'Roxo', dot: 'bg-purple-600' },
  { value: 'warning', label: 'Âmbar', dot: 'bg-amber-500' },
  { value: 'success', label: 'Verde', dot: 'bg-emerald-600' },
  { value: 'danger', label: 'Vermelho', dot: 'bg-rose-600' },
  { value: 'default', label: 'Neutro', dot: 'bg-gray-500' },
];

function slugifyCategory(label: string): string {
  const normalized = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
  return normalized || `cat_${Date.now()}`;
}

export const EquipmentsPage: React.FC = () => {
  const {
    equipments,
    equipmentCategories,
    saveEquipmentCategories,
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

  // Modal de Gerenciar Categorias
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [draftCategories, setDraftCategories] = useState<EquipmentCategoryItem[]>([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryVariant, setNewCategoryVariant] = useState<CategoryBadgeVariant>('info');
  const [categoriesError, setCategoriesError] = useState('');
  const [isSavingCategories, setIsSavingCategories] = useState(false);

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

  const openCategoriesModal = () => {
    setDraftCategories(equipmentCategories.map((c) => ({ ...c })));
    setNewCategoryLabel('');
    setNewCategoryVariant('info');
    setCategoriesError('');
    setIsCategoriesModalOpen(true);
  };

  const handleAddDraftCategory = () => {
    const clean = newCategoryLabel.trim();
    if (!clean) return;
    setCategoriesError('');

    let candidateId = slugifyCategory(clean);
    if (draftCategories.some((c) => c.id === candidateId)) {
      candidateId = `${candidateId}_${Date.now().toString().slice(-4)}`;
    }

    setDraftCategories((prev) => [
      ...prev,
      { id: candidateId, label: clean.slice(0, 50), variant: newCategoryVariant },
    ]);
    setNewCategoryLabel('');
  };

  const handleUpdateDraftCategory = (
    idx: number,
    patch: Partial<EquipmentCategoryItem>
  ) => {
    setDraftCategories((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
  };

  const handleDeleteDraftCategory = (idx: number) => {
    if (draftCategories.length <= 1) {
      setCategoriesError('É necessário manter pelo menos uma categoria cadastrada.');
      return;
    }
    setCategoriesError('');
    setDraftCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRestoreDefaults = () => {
    setCategoriesError('');
    setDraftCategories((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const missingDefaults = DEFAULT_EQUIPMENT_CATEGORIES.filter(
        (d) => !existingIds.has(d.id)
      );
      return [...prev, ...missingDefaults];
    });
  };

  const handleSaveCategories = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoriesError('');
    if (draftCategories.some((c) => !c.label.trim())) {
      setCategoriesError('Nenhum nome de categoria pode ficar em branco.');
      return;
    }
    setIsSavingCategories(true);
    try {
      await saveEquipmentCategories(draftCategories);
      if (
        selectedCategory !== 'all' &&
        !draftCategories.some((c) => c.id === selectedCategory)
      ) {
        setSelectedCategory('all');
      }
      if (!draftCategories.some((c) => c.id === category)) {
        setCategory(draftCategories[0].id);
      }
      setIsCategoriesModalOpen(false);
    } catch (err: unknown) {
      setCategoriesError((err as Error)?.message || 'Erro ao salvar categorias.');
    } finally {
      setIsSavingCategories(false);
    }
  };

  const openAddModal = () => {
    setEditingEquip(null);
    setName('');
    setCategory(equipmentCategories[0]?.id || 'video');
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

  const filterCategories = [
    { id: 'all', label: 'Todos' },
    ...equipmentCategories,
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
            Cadastre câmeras, mesas de som, iluminação, projeção, switchers e personalize categorias.
          </p>
        </div>

        {isLeader && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCategoriesModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white hover:bg-black/[0.04] text-[#1D1D1F] border border-black/[0.08] shadow-xs transition-all cursor-pointer"
              title="Criar, renomear ou excluir categorias de equipamentos"
            >
              <Tags className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Categorias</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Equipamento</span>
            </button>
          </div>
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
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
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

      {/* Modal Gerenciar Categorias */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <Tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    Categorias de Equipamentos
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Crie novas categorias ou renomeie e troque as cores existentes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoriesModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategories} className="mt-4 flex flex-col flex-1 min-h-0 space-y-4">
              {categoriesError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 shrink-0">
                  {categoriesError}
                </div>
              )}

              {/* Adicionar Nova Categoria */}
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2.5 shrink-0">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Adicionar Nova Categoria
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Fotografia, Backstage, LED..."
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDraftCategory();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                  <select
                    value={newCategoryVariant}
                    onChange={(e) => setNewCategoryVariant(e.target.value as CategoryBadgeVariant)}
                    className="px-2.5 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        Cor: {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDraftCategory}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista Editável */}
              <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                {draftCategories.map((cat, idx) => {
                  const usedCount = equipments.filter((eq) => eq.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-2.5 rounded-2xl bg-black/[0.02] border border-black/[0.05] flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        maxLength={50}
                        value={cat.label}
                        onChange={(e) =>
                          handleUpdateDraftCategory(idx, { label: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <select
                          value={cat.variant || 'default'}
                          onChange={(e) =>
                            handleUpdateDraftCategory(idx, {
                              variant: e.target.value as CategoryBadgeVariant,
                            })
                          }
                          className="px-2 py-1.5 rounded-xl bg-white border border-black/10 text-[11px] font-medium text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                        >
                          {COLOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap min-w-[46px] text-right">
                          {usedCount} equip.
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteDraftCategory(idx)}
                          disabled={draftCategories.length <= 1}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                          title={
                            usedCount > 0
                              ? `Excluir (os ${usedCount} equipamentos serão movidos para outra categoria)`
                              : 'Excluir categoria'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#0071E3] cursor-pointer"
                  title="Adicionar categorias padrão que eventualmente foram removidas"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Padrão</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoriesModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCategories}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCategories ? 'Salvando...' : 'Salvar Categorias'}
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Categoria
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        openCategoriesModal();
                      }}
                      className="text-[10px] font-semibold text-[#0071E3] hover:underline cursor-pointer"
                    >
                      + Criar / Editar
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    {equipmentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
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
