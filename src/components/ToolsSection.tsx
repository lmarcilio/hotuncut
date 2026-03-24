import React from 'react';
import { 
  ExternalLink, 
  Zap, 
  Globe, 
  Layout, 
  Image as ImageIcon, 
  Video, 
  Wrench,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Flame,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface ToolsSectionProps {
  isAdmin?: boolean;
}

export default function ToolsSection({ isAdmin = false }: ToolsSectionProps) {
  const [tools, setTools] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingTool, setEditingTool] = React.useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryImage, setNewCategoryImage] = React.useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [toolToDelete, setToolToDelete] = React.useState<any>(null);

  const isLoadingRef = React.useRef(false);

  const fetchData = async (silent = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    if (!silent) setIsLoading(true);
    
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!silent) {
        setIsLoading(false);
        isLoadingRef.current = false;
        console.warn('Tools fetch timed out');
      }
    }, 10000);

    try {
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (toolsError) throw toolsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tool_categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      setTools(toolsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching tools data:', error);
    } finally {
      clearTimeout(timeoutId);
      isLoadingRef.current = false;
      if (!silent) setIsLoading(false);
    }
  };

  const isLoadingRef = React.useRef(false);

  React.useEffect(() => {
    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoadingRef.current) {
        console.log('[Tools] Refetching on visibility change...');
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const toolData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      link: formData.get('url') as string,
      category: formData.get('category') as string,
      image_url: formData.get('imageUrl') as string,
      is_hot: formData.get('isHot') === 'on'
    };

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Sessão do Supabase não encontrada. Por favor, faça login novamente com um email real para gerenciar ferramentas.');
        return;
      }

      if (editingTool) {
        const { error } = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', editingTool.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tools')
          .insert([toolData]);
        if (error) throw error;
      }

      await fetchData(true);
      setIsAddModalOpen(false);
      setEditingTool(null);
    } catch (error: any) {
      console.error('Error saving tool:', error);
      alert(`Erro ao salvar ferramenta: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteTool = (tool: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setToolToDelete(tool);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (toolToDelete) {
      try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('Sessão do Supabase não encontrada. Por favor, faça login novamente com um email real para excluir ferramentas.');
          return;
        }

        const { error } = await supabase
          .from('tools')
          .delete()
          .eq('id', toolToDelete.id);
        if (error) throw error;

        await fetchData(true);
        setIsDeleteModalOpen(false);
        setToolToDelete(null);
      } catch (error: any) {
        console.error('Error deleting tool:', error);
        alert(`Erro ao excluir ferramenta: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Por favor, digite o nome da categoria.');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      alert('Esta categoria já existe.');
      return;
    }

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Sessão do Supabase não encontrada. Por favor, faça login novamente com um email real para gerenciar categorias.');
        return;
      }

      const { error } = await supabase
        .from('tool_categories')
        .insert([{ 
          name: newCategoryName.trim(),
          image_url: newCategoryImage.trim() || null
        }]);
      if (error) throw error;

      await fetchData(true);
      setNewCategoryName('');
      setNewCategoryImage('');
    } catch (error: any) {
      console.error('Error adding category:', error);
      alert(`Erro ao adicionar categoria: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Excluir a categoria "${cat.name}"?`)) return;
    try {
      const { error } = await supabase
        .from('tool_categories')
        .delete()
        .eq('id', cat.id);
      if (error) throw error;

      await fetchData(true);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria. Verifique se existem ferramentas vinculadas.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-hot-orange animate-spin" />
          <div className="absolute inset-0 blur-xl bg-hot-orange/20 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-zinc-400 font-medium">Carregando ferramentas...</p>
          <button 
            onClick={() => fetchData()}
            className="text-xs text-hot-orange hover:underline font-bold uppercase tracking-widest"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight flex flex-wrap items-center gap-3">
            Kit de 
            <span className="px-4 py-1 rounded-xl bg-hot-red/10 border border-hot-red/20 text-hot-red">
              Ferramentas
            </span>
          </h2>
          <p className="text-zinc-500 mt-2">As melhores ferramentas selecionadas para escalar sua presença digital.</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Categorias
            </button>
            <button 
              onClick={() => {
                setEditingTool(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl hot-gradient text-white font-bold text-sm shadow-lg shadow-hot-orange/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Nova Ferramenta
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool: any, index: number) => (
          <motion.div 
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              const win = window.open(tool.link, '_blank', 'noopener,noreferrer');
              if (win) win.focus();
            }}
            className={`bg-[#141414] border rounded-[2rem] p-6 flex flex-col gap-6 group transition-all relative cursor-pointer ${
              tool.is_hot ? 'border-hot-red/30 glow-red hover:border-hot-red' : 'border-[#1F1F1F] hover:border-hot-orange/50 hover:shadow-2xl hover:shadow-hot-orange/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden group-hover:border-hot-orange/30 transition-colors shadow-inner">
                {tool.image_url ? (
                  <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Wrench className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTool(tool);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteTool(tool, e)}
                      className="p-2 rounded-xl bg-white/5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-hot-orange transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl group-hover:text-hot-orange transition-colors">{tool.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-zinc-500 uppercase font-black tracking-widest border border-white/5">
                  {tool.category || 'Geral'}
                </span>
                {tool.is_hot && (
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-hot-red/10 text-hot-red uppercase font-black tracking-widest border border-hot-red/20 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    UNCUT
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                {tool.description}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-600 group-hover:text-hot-orange transition-colors uppercase">
              <span>Acessar Ferramenta</span>
              <div className="w-6 h-px bg-zinc-800 group-hover:bg-hot-orange transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black">
                  {editingTool ? 'Editar Ferramenta' : 'Adicionar Nova Ferramenta'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSaveTool} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nome</label>
                  <input name="name" defaultValue={editingTool?.name} required className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Categoria</label>
                  <select name="category" defaultValue={editingTool?.category || categories[0]?.name} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">URL da Ferramenta</label>
                  <input name="url" defaultValue={editingTool?.link} required placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Imagem (URL)</label>
                  <input name="imageUrl" defaultValue={editingTool?.image_url} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Descrição</label>
                  <textarea name="description" defaultValue={editingTool?.description} required rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors resize-none" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" name="isHot" defaultChecked={editingTool?.is_hot} className="w-5 h-5 rounded border-zinc-800 bg-zinc-900 text-hot-red focus:ring-hot-red" />
                  <label className="text-sm font-bold text-zinc-300">Marcar como "UNCUT"</label>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20 flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" />
                    {editingTool ? 'Salvar Alterações' : 'Adicionar Ferramenta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-[#0D0D0D] p-10 rounded-[3rem] border border-white/5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-display font-black tracking-tight">Gerenciar Categorias</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 rounded-2xl hover:bg-white/5 transition-colors">
                  <X className="w-6 h-6 text-zinc-600" />
                </button>
              </div>

              <div className="space-y-8">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nome da Categoria</label>
                    <input 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Realismo"
                      autoFocus
                      className="w-full px-6 py-4 rounded-2xl bg-[#1A1A1A] border border-white/5 focus:border-hot-red focus:outline-none transition-all text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">URL da Imagem</label>
                    <input 
                      value={newCategoryImage}
                      onChange={(e) => setNewCategoryImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-6 py-4 rounded-2xl bg-[#1A1A1A] border border-white/5 focus:border-hot-red focus:outline-none transition-all text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <button type="submit" className="w-full py-4 rounded-2xl bg-hot-red text-white font-bold shadow-lg shadow-hot-red/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Adicionar Categoria
                  </button>
                </form>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-4">
                        {cat.image_url && (
                          <img 
                            src={cat.image_url} 
                            alt={cat.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-black mb-2 text-white">Confirmar Exclusão</h3>
              <p className="text-zinc-500 mb-8">Tem certeza que deseja excluir a ferramenta <span className="text-white font-bold">"{toolToDelete?.name}"</span>? Esta ação não pode ser desfeita.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
