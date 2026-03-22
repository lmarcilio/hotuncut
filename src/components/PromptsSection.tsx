import React from 'react';
import { Terminal, Copy, Search, Eye, EyeOff, CheckCircle2, Star, Edit3, Save, X, Shield, Plus, Clipboard, AlertCircle, Trash2, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ["Todos", "Favoritos", "Realista", "Anime", "Cyberpunk", "UNCUT SECTION", "Marketing"];

const VISUAL_CATEGORIES = [
  { id: 'Realista', name: 'Realista', image: 'https://picsum.photos/seed/realist-cat/800/400' },
  { id: 'Anime', name: 'Anime', image: 'https://picsum.photos/seed/anime-cat/800/400' },
  { id: 'Cyberpunk', name: 'Cyberpunk', image: 'https://picsum.photos/seed/cyber-cat/800/400' },
  { id: 'UNCUT SECTION', name: 'UNCUT SECTION', image: 'https://picsum.photos/seed/hot-cat/800/400' },
];

const INITIAL_PROMPTS = [
  {
    id: 1,
    title: "Script de Reel Viral",
    description: "Roteiro otimizado para retenção máxima no Instagram.",
    category: "Marketing",
    content: "Crie um roteiro de 30 segundos para um Instagram Reel sobre [Tópico]. Comece com um gancho forte que aborde [Ponto de Dor]. Inclua 3 dicas rápidas e uma chamada para ação clara para conferir o link na bio.",
    difficulty: "Fácil",
    isNSFW: false,
    previewImage: "https://picsum.photos/seed/marketing-reel/800/450"
  },
  {
    id: 2,
    title: "Waifu Estilo Cyberpunk",
    description: "Retrato altamente detalhado de uma waifu cyberpunk.",
    category: "Anime",
    content: "Retrato altamente detalhado de uma waifu cyberpunk, luzes neon, chuva, estilo Ghost in the Shell, 8k, renderização unreal engine 5, cores vibrantes.",
    difficulty: "Médio",
    isNSFW: false,
    previewImage: "https://picsum.photos/seed/anime-cyber/800/450"
  },
  {
    id: 3,
    title: "Modelo Fotorealista Hot",
    description: "Fotografia profissional de modelo em estúdio.",
    category: "UNCUT SECTION",
    content: "Fotografia profissional de modelo em estúdio, iluminação cinematográfica, 8k, ultra realista, detalhes de pele, profundidade de campo, estilo editorial de moda.",
    difficulty: "Difícil",
    isNSFW: true,
    previewImage: "https://picsum.photos/seed/hot-model/800/450"
  },
  {
    id: 4,
    title: "Paisagem Futurista",
    description: "Cidade futurista com carros voadores e neon.",
    category: "Cyberpunk",
    content: "Cidade futurista com carros voadores, arquitetura brutalista, névoa, luzes de neon azuis e rosas, perspectiva de cima, detalhamento extremo.",
    difficulty: "Médio",
    isNSFW: false,
    previewImage: "https://picsum.photos/seed/cyber-city/800/450"
  }
];

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
  
  // Dynamic Prompts State
  const [prompts, setPrompts] = React.useState<any[]>([]);

  // New States for Favorites and Customizations
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = React.useState<Record<string, string>>({});

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Fetch Prompts from Supabase
  React.useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [promptsRes, favoritesRes, customRes] = await Promise.all([
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        user ? supabase.from('user_favorites').select('prompt_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('user_custom_prompts').select('prompt_id, custom_content').eq('user_id', user.id) : Promise.resolve({ data: [] })
      ]);

      if (promptsRes.data) setPrompts(promptsRes.data);
      if (favoritesRes.data) setFavorites(favoritesRes.data.map((f: any) => f.prompt_id));
      if (customRes.data) {
        const customMap: Record<string, string> = {};
        customRes.data.forEach((c: any) => {
          customMap[c.prompt_id] = c.custom_content;
        });
        setCustomPrompts(customMap);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Removed localStorage persistence

  const filteredPrompts = prompts.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    if (activeCategory === 'Favoritos') {
      matchesCategory = favorites.includes(p.id);
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
    
    fetchPrompts();
    setIsAddModalOpen(false);
    setEditingPrompt(null);
  };

  const deletePrompt = async (id: string) => {
    if (confirm('Excluir este prompt?')) {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) alert(error.message);
      fetchPrompts();
    }
  };

  return (
    <div className="space-y-10 bg-[#0D0D0D] min-h-screen p-4 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">Biblioteca de <span className="hot-text-gradient">Prompts</span></h2>
          <p className="text-zinc-500 mt-1">Acesse a engenharia definitiva para seus conteúdos.</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => {
                setEditingPrompt(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl hot-gradient text-white font-bold text-sm shadow-lg shadow-hot-orange/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Novo Prompt
            </button>
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
        {CATEGORIES.map(cat => (
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
        {VISUAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`relative aspect-video rounded-2xl overflow-hidden group transition-all border-2 ${
              activeCategory === cat.id ? 'border-hot-orange shadow-lg shadow-hot-orange/20' : 'border-transparent'
            }`}
          >
            <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
            <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 transition-colors ${activeCategory === cat.id ? 'bg-black/40' : 'group-hover:bg-black/50'}`}>
              <span className="text-xl md:text-2xl font-display font-black uppercase tracking-widest leading-none">{cat.name}</span>
              <span className="text-[10px] md:text-xs font-bold text-hot-orange/80 uppercase tracking-widest mt-2">Imagens e Vídeos Realistas</span>
            </div>
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-hot-orange animate-spin" />
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
                    {CATEGORIES.filter(c => c !== 'Todos' && c !== 'Favoritos').map(c => <option key={c} value={c}>{c}</option>)}
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
