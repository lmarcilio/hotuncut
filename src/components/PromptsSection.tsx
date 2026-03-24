import React from 'react';
import { Terminal, Copy, Search, Eye, EyeOff, CheckCircle2, Star, Edit3, Save, X, Shield, Plus, Clipboard, AlertCircle, Trash2, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = ["Todos", "Favoritos", "UNCUT SECTION"];

interface PromptsSectionProps {
  isAdmin?: boolean;
}

export default function PromptsSection({ isAdmin = false }: PromptsSectionProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Todos');
  const [revealedNSFW, setRevealedNSFW] = React.useState<string[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isNSFWModalOpen, setIsNSFWModalOpen] = React.useState(false);
  const [pendingNSFWId, setPendingNSFWId] = React.useState<string | null>(null);
  
  // Admin States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<any>(null);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryImage, setNewCategoryImage] = React.useState('');
  
  // Dynamic Prompts State
  const [prompts, setPrompts] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_prompts_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [visualCategories, setVisualCategories] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_visual_categories_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_categories_cache');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  // New States for Favorites and Customizations
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_favorites_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [customPrompts, setCustomPrompts] = React.useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_custom_prompts_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(prompts.length === 0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Fetch Prompts from Supabase
  React.useEffect(() => {
    fetchPrompts();

    const handleFocus = () => {
      if (prompts.length === 0 && !loading) {
        console.log('[Prompts] Refetching on focus...');
        fetchPrompts(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [prompts.length, loading]);

  const fetchPrompts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (!silent) {
        setLoading(false);
        console.warn('Prompts fetch timed out');
      }
    }, 10000);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [promptsRes, visualCatsRes, favoritesRes, customRes] = await Promise.all([
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        supabase.from('prompt_visual_categories').select('*').order('name'),
        user ? supabase.from('user_favorites').select('prompt_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('user_custom_prompts').select('prompt_id, custom_content').eq('user_id', user.id) : Promise.resolve({ data: [] })
      ]);

      if (promptsRes.data) {
        setPrompts(promptsRes.data);
        localStorage.setItem('hotmedia_prompts_cache', JSON.stringify(promptsRes.data));
      }
      if (visualCatsRes.data) {
        setVisualCategories(visualCatsRes.data);
        localStorage.setItem('hotmedia_visual_categories_cache', JSON.stringify(visualCatsRes.data));
        const dynamicCats = Array.from(new Set(visualCatsRes.data.map((c: any) => c.name)));
        const allCats = [...DEFAULT_CATEGORIES, ...dynamicCats];
        setCategories(allCats);
        localStorage.setItem('hotmedia_categories_cache', JSON.stringify(allCats));
      }
      if (favoritesRes.data) {
        const favIds = favoritesRes.data.map((f: any) => f.prompt_id);
        setFavorites(favIds);
        localStorage.setItem('hotmedia_favorites_cache', JSON.stringify(favIds));
      }
      if (customRes.data) {
        const customMap: Record<string, string> = {};
        customRes.data.forEach((c: any) => {
          customMap[c.prompt_id] = c.custom_content;
        });
        setCustomPrompts(customMap);
        localStorage.setItem('hotmedia_custom_prompts_cache', JSON.stringify(customMap));
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      clearTimeout(timeoutId);
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Removed localStorage persistence

  const filteredPrompts = prompts.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    if (activeCategory === 'Favoritos') {
      matchesCategory = favorites.includes(p.id);
    } else if (activeCategory === 'UNCUT SECTION') {
      matchesCategory = p.is_nsfw === true;
    }
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevealNSFW = (id: string) => {
    setPendingNSFWId(id);
    setIsNSFWModalOpen(true);
  };

  const confirmNSFW = () => {
    if (pendingNSFWId) {
      setRevealedNSFW([...revealedNSFW, pendingNSFWId]);
      setIsNSFWModalOpen(false);
      setPendingNSFWId(null);
    }
  };

  const toggleFavorite = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Você precisa estar logado para favoritar prompts.');
      return;
    }

    const isFavorite = favorites.includes(id);
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', id);
        if (error) throw error;
        setFavorites(prev => prev.filter(f => f !== id));
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: user.id, prompt_id: id }]);
        if (error) throw error;
        setFavorites(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditingId(id);
    setTempPrompt(customPrompts[id] || content);
  };

  const saveEdit = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Você precisa estar logado para salvar customizações.');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_custom_prompts')
        .upsert({ 
          user_id: user.id, 
          prompt_id: id, 
          custom_content: tempPrompt 
        }, { onConflict: 'user_id,prompt_id' });
      
      if (error) throw error;

      setCustomPrompts(prev => ({ ...prev, [id]: tempPrompt }));
      setEditingId(null);
    } catch (error) {
      console.error('Error saving custom prompt:', error);
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newPrompt = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      difficulty: formData.get('difficulty'),
      content: formData.get('content'),
      is_nsfw: formData.get('isNSFW') === 'on',
      preview_image: formData.get('previewImage') || 'https://picsum.photos/seed/new/800/450'
    };

    if (editingPrompt) {
      const { error } = await supabase.from('prompts').update(newPrompt).eq('id', editingPrompt.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('prompts').insert(newPrompt);
      if (error) alert(error.message);
    }
    
    fetchPrompts(true);
    setIsAddModalOpen(false);
    setEditingPrompt(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão não encontrada.");

      if (editingCategory) {
        // Atualizar categoria existente
        const { error } = await supabase
          .from('prompt_visual_categories')
          .update({ 
            name: newCategoryName.trim(),
            image_url: newCategoryImage.trim() || 'https://picsum.photos/seed/cat/800/450'
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
      } else {
        // Inserir nova categoria
        const { error } = await supabase
          .from('prompt_visual_categories')
          .insert([{ 
            name: newCategoryName.trim(),
            image_url: newCategoryImage.trim() || 'https://picsum.photos/seed/cat/800/450'
          }]);
        
        if (error) throw error;
      }

      setNewCategoryName('');
      setNewCategoryImage('');
      setEditingCategory(null);
      fetchPrompts(true);
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(`Erro ao salvar categoria: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (category: any) => {
    if (confirm(`Excluir a categoria "${category.name}"? Isso não excluirá os prompts, mas eles ficarão sem categoria.`)) {
      try {
        const { error } = await supabase
          .from('prompt_visual_categories')
          .delete()
          .eq('id', category.id);
        
        if (error) throw error;
        fetchPrompts(true);
      } catch (error: any) {
        console.error('Error deleting category:', error);
        alert(`Erro ao excluir categoria: ${error.message}`);
      }
    }
  };

  const deletePrompt = async (id: string) => {
    if (confirm('Excluir este prompt?')) {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) alert(error.message);
      fetchPrompts(true);
    }
  };

  return (
    <div className="space-y-10 bg-[#0D0D0D] min-h-screen p-4 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-black tracking-tight">Biblioteca de <span className="hot-text-gradient">Prompts</span></h2>
            {isRefreshing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-hot-orange/10 border border-hot-orange/20 text-hot-orange text-[10px] font-black uppercase tracking-widest"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Atualizando...
              </motion.div>
            )}
          </div>
          <p className="text-zinc-500 mt-1">Acesse a engenharia definitiva para seus conteúdos.</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                Gerenciar Categorias
              </button>
              <button 
                onClick={() => {
                  setEditingPrompt(null);
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl hot-gradient text-white font-bold text-sm shadow-lg shadow-hot-orange/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Novo Prompt
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar prompts..."
              className="bg-[#141414] border border-[#1F1F1F] rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-hot-orange transition-colors text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Policy Notice */}
      <div className="p-5 rounded-2xl bg-hot-orange/5 border border-hot-orange/20 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-hot-orange/10 flex items-center justify-center text-hot-orange shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-hot-orange">Compromisso Ético</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Nossos prompts são otimizados para ferramentas que permitem liberdade criativa nativa, garantindo segurança e alta performance. Não utilizamos "jailbreaks" ou técnicas para enganar plataformas.
          </p>
        </div>
      </div>

      {/* Chips de Categoria */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeCategory === cat 
              ? (cat === 'UNCUT SECTION' ? 'bg-hot-red border-hot-red text-white shadow-lg shadow-hot-red/40 glow-red' : 'bg-hot-orange border-hot-orange text-white shadow-lg shadow-hot-orange/20')
              : (cat === 'UNCUT SECTION' ? 'bg-zinc-900 border-hot-red/30 text-hot-red/80 hover:border-hot-red glow-red' : 'bg-[#141414] border-[#1F1F1F] text-zinc-500 hover:border-zinc-700')
            }`}
          >
            {cat === 'Favoritos' && <Star className={`w-3 h-3 ${activeCategory === 'Favoritos' ? 'fill-white' : ''}`} />}
            {cat === 'UNCUT SECTION' && <Flame className="w-3 h-3 fill-current" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Categories Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {visualCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`relative aspect-video rounded-2xl overflow-hidden group transition-all border-2 ${
              activeCategory === cat.name ? 'border-hot-orange shadow-lg shadow-hot-orange/20' : 'border-transparent'
            }`}
          >
            <img src={cat.image_url || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} referrerPolicy="no-referrer" />
            <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 transition-colors ${activeCategory === cat.name ? 'bg-black/40' : 'group-hover:bg-black/50'}`}>
              <span className="text-xl md:text-2xl font-display font-black uppercase tracking-widest leading-none">{cat.name}</span>
              <span className="text-[10px] md:text-xs font-bold text-hot-orange/80 uppercase tracking-widest mt-2">Imagens e Vídeos Realistas</span>
            </div>
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-hot-orange animate-spin" />
            <div className="absolute inset-0 blur-xl bg-hot-orange/20 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-zinc-500 font-medium">Carregando prompts...</p>
            <button 
              onClick={() => fetchPrompts()}
              className="text-xs text-hot-orange hover:underline font-bold uppercase tracking-widest"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt: any, index: number) => {
            const displayContent = customPrompts[prompt.id] || prompt.content;
            const isFavorited = favorites.includes(prompt.id);
            const isEditing = editingId === prompt.id;
            const isRevealed = revealedNSFW.includes(prompt.id);

            return (
              <motion.div 
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-[#141414] rounded-[2rem] border p-6 flex flex-col gap-4 group relative ${prompt.is_nsfw ? 'border-hot-red/20 glow-red' : 'border-[#1F1F1F]'}`}
              >
                {/* Header Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xl leading-tight flex items-center gap-2">
                        {prompt.title}
                        {prompt.is_nsfw && <Flame className="w-4 h-4 text-hot-red fill-hot-red animate-pulse" />}
                      </h3>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingPrompt(prompt);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => deletePrompt(prompt.id)}
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-zinc-500 text-sm line-clamp-1">{prompt.description}</p>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(prompt.id)}
                    className={`p-2.5 rounded-xl transition-colors shrink-0 ${isFavorited ? 'text-hot-orange bg-hot-orange/10' : 'text-zinc-600 hover:text-white bg-white/5'}`}
                  >
                    <Star className={`w-5 h-5 ${isFavorited ? 'fill-hot-orange' : ''}`} />
                  </button>
                </div>

                {/* Preview Image */}
                {prompt.preview_image && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5">
                    <img 
                      src={prompt.preview_image} 
                      className={`w-full h-full object-cover transition-all duration-500 ${prompt.is_nsfw && !isRevealed ? 'blur-xl scale-110' : ''}`} 
                      alt={prompt.title}
                      referrerPolicy="no-referrer"
                    />
                    {prompt.is_nsfw && !isRevealed && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-hot-red opacity-50" />
                      </div>
                    )}
                  </div>
                )}

                {/* Badges Row */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    prompt.category === 'UNCUT SECTION' ? 'bg-hot-red/10 text-hot-red' : 'bg-hot-orange/10 text-hot-orange'
                  }`}>
                    {prompt.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                    prompt.difficulty === 'Fácil' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                    prompt.difficulty === 'Médio' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                    'border-rose-500/30 text-rose-400 bg-rose-500/10'
                  }`}>
                    {prompt.difficulty}
                  </span>
                </div>

                {/* Prompt Content Box */}
                <div className="bg-black/40 rounded-2xl p-4 font-mono text-sm text-zinc-400 relative min-h-[120px] flex flex-col border border-white/5">
                  {isEditing ? (
                    <div className="space-y-3 h-full flex flex-col">
                      <textarea 
                        value={tempPrompt}
                        onChange={(e) => setTempPrompt(e.target.value)}
                        className="w-full bg-[#1F1F1F] border border-[#2F2F2F] rounded-xl p-3 text-xs focus:outline-none focus:border-hot-orange resize-none flex-grow text-zinc-200"
                        rows={4}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white"><X className="w-4 h-4" /></button>
                        <button onClick={() => saveEdit(prompt.id)} className="p-2 rounded-lg bg-hot-orange hover:bg-hot-orange/80 text-white"><Save className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`transition-all duration-300 flex-grow ${prompt.is_nsfw && !isRevealed ? 'blur-md select-none' : ''}`}>
                        {displayContent}
                      </p>
                      
                      {prompt.is_nsfw && !isRevealed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl z-10 p-4 text-center">
                          <p className="text-xs font-bold text-hot-red uppercase tracking-widest mb-2">UNCUT SECTION</p>
                          <button 
                            onClick={() => handleRevealNSFW(prompt.id)}
                            className="px-4 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-3 h-3" /> Ver Prompt (+18)
                          </button>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(prompt.id, prompt.content)}
                          className="p-2 bg-[#1F1F1F] rounded-lg hover:bg-[#2F2F2F] text-white border border-white/5"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      {customPrompts[prompt.id] && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-hot-orange font-bold uppercase tracking-widest">Personalizado</span>
                          <button 
                            onClick={async () => {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) return;

                              try {
                                const { error } = await supabase
                                  .from('user_custom_prompts')
                                  .delete()
                                  .eq('user_id', user.id)
                                  .eq('prompt_id', prompt.id);
                                
                                if (error) throw error;

                                const newCustoms = { ...customPrompts };
                                delete newCustoms[prompt.id];
                                setCustomPrompts(newCustoms);
                              } catch (error) {
                                console.error('Error resetting prompt:', error);
                              }
                            }}
                            className="text-[10px] text-zinc-600 hover:text-rose-500 transition-colors"
                          >
                            Resetar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Copy Button */}
                <button 
                  onClick={() => copyToClipboard(prompt.id, displayContent)}
                  disabled={isEditing}
                  className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest ${
                    copiedId === prompt.id 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : isEditing ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'hot-gradient text-white shadow-lg shadow-hot-orange/20'
                  }`}
                >
                  {copiedId === prompt.id ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-5 h-5" />
                      Copiar Prompt
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* NSFW Confirmation Modal */}
      <AnimatePresence>
        {isNSFWModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNSFWModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black">Aviso de Conteúdo</h3>
                <p className="text-zinc-400">Este prompt contém conteúdo adulto. Você confirma que tem mais de 18 anos?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsNSFWModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
                >
                  Não, sair
                </button>
                <button 
                  onClick={confirmNSFW}
                  className="flex-1 py-4 rounded-2xl hot-gradient text-white font-black shadow-lg shadow-hot-orange/20"
                >
                  Sim, confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Add/Edit Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black">
                  {editingCategory ? 'Editar Categoria' : 'Gerenciar Categorias'}
                </h3>
                <button 
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    setNewCategoryName('');
                    setNewCategoryImage('');
                  }} 
                  className="p-2 rounded-xl hover:bg-white/5"
                >
                  <X className="w-6 h-6 text-zinc-500" />
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
                      className="w-full px-6 py-4 rounded-2xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-all text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">URL da Imagem</label>
                    <input 
                      value={newCategoryImage}
                      onChange={(e) => setNewCategoryImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-6 py-4 rounded-2xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-all text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="flex gap-3">
                    {editingCategory && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setNewCategoryName('');
                          setNewCategoryImage('');
                        }}
                        className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-bold transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="flex-[2] py-4 rounded-2xl hot-gradient text-white font-bold shadow-lg shadow-hot-orange/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                      {editingCategory ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}
                    </button>
                  </div>
                </form>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {visualCategories.map(cat => (
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
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                            setNewCategoryImage(cat.image_url || '');
                          }}
                          className="p-2 rounded-xl text-zinc-600 hover:text-hot-orange hover:bg-hot-orange/10 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 rounded-xl text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black">
                  {editingPrompt ? 'Editar Prompt' : 'Adicionar Novo Prompt'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleAddPrompt} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Título</label>
                  <input name="title" defaultValue={editingPrompt?.title} required className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Categoria</label>
                  <select name="category" defaultValue={editingPrompt?.category} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors">
                    {categories.filter(c => c !== 'Todos' && c !== 'Favoritos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Dificuldade</label>
                  <select name="difficulty" defaultValue={editingPrompt?.difficulty} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors">
                    <option value="Fácil">Fácil</option>
                    <option value="Médio">Médio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Imagem Preview (URL)</label>
                  <input name="previewImage" defaultValue={editingPrompt?.preview_image} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Descrição Curta</label>
                  <input name="description" defaultValue={editingPrompt?.description} required className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Conteúdo do Prompt</label>
                  <textarea name="content" defaultValue={editingPrompt?.content} required rows={4} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="isNSFW" defaultChecked={editingPrompt?.is_nsfw} className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-hot-orange focus:ring-hot-orange" />
                  <label className="text-sm font-bold text-zinc-300">Marcar como 'UNCUT' (+18)</label>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20">
                    {editingPrompt ? 'Salvar Alterações' : 'Publicar Prompt'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
