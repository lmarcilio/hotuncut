import React from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Search,
  Filter,
  Terminal,
  GraduationCap,
  Wrench,
  X,
  Save,
  Youtube,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Settings,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

const ADMIN_STATS = [
  { label: 'Receita Total', value: 'R$ 42.5k', icon: DollarSign, color: 'text-emerald-400', trend: '+12.5%' },
  { label: 'Usuários Ativos', value: '1,240', icon: Users, color: 'text-blue-400', trend: '+5.2%' },
  { label: 'MRR', value: 'R$ 18.2k', icon: TrendingUp, color: 'text-hot-orange', trend: '+8.1%' },
  { label: 'Taxa de Conversão', value: '3.4%', icon: BarChart3, color: 'text-amber-400', trend: '+0.4%' },
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

const INITIAL_TOOLS = [
  {
    id: 1,
    name: "Canva",
    description: "A ferramenta de design definitiva para gráficos de redes sociais e apresentações.",
    url: "https://canva.com",
    category: "Design",
    imageUrl: "https://picsum.photos/seed/canva/400/400"
  },
  {
    id: 2,
    name: "CapCut",
    description: "Poderoso editor de vídeo para TikTok e Reels com efeitos de tendência.",
    url: "https://capcut.com",
    category: "Vídeo",
    imageUrl: "https://picsum.photos/seed/capcut/400/400"
  },
  {
    id: 3,
    name: "ChatGPT",
    description: "Assistente de IA para escrita de roteiros, geração de legendas e brainstorming.",
    url: "https://chat.openai.com",
    category: "IA",
    imageUrl: "https://picsum.photos/seed/chatgpt/400/400"
  }
];

const INITIAL_ACADEMY_MODULES = [
  { 
    id: 1, 
    title: 'Introdução ao SaaS', 
    order: 1,
    lessons: [
      { id: 101, title: 'O que é um SaaS?', description: 'Entenda o modelo de negócio.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', imageUrl: 'https://picsum.photos/seed/saas/800/450' },
      { id: 102, title: 'Guia de Início', description: 'PDF com os primeiros passos.', type: 'file', fileUrl: '#', fileName: 'guia.pdf', imageUrl: 'https://picsum.photos/seed/guide/800/450' }
    ] 
  },
  { 
    id: 2, 
    title: 'Estratégias de Tráfego', 
    order: 2,
    lessons: [
      { id: 201, title: 'Tráfego Orgânico', description: 'Como crescer sem gastar.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', imageUrl: 'https://picsum.photos/seed/traffic/800/450' }
    ] 
  }
];

const INITIAL_STUDENTS = [
  { id: 1, name: 'Lucas Marcílio', email: 'lucas@example.com', phone: '(11) 99999-9999', status: 'Ativo', expiration: '2025-12-31', plan: 'Premium Anual' },
  { id: 2, name: 'Ana Silva', email: 'ana@example.com', phone: '(21) 98888-8888', status: 'Inativo', expiration: '2024-01-15', plan: 'Mensal' },
];

export default function AdminDashboard({ onBack, onLogout }: { onBack: () => void, onLogout?: () => void }) {
  const [activeTab, setActiveTab] = React.useState<'prompts' | 'academy' | 'tools' | 'students' | 'settings'>('prompts');
  const [activeSubTab, setActiveSubTab] = React.useState<'items' | 'modules' | 'categories'>('items');
  const [logoUrl, setLogoUrl] = React.useState(() => localStorage.getItem('hotuncut_logo_url') || '');
  const [logoHeight, setLogoHeight] = React.useState(() => parseInt(localStorage.getItem('hotuncut_logo_height') || '56'));
  const [loading, setLoading] = React.useState(() => {
    const saved = localStorage.getItem('hotmedia_admin_prompts_cache');
    return !saved;
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [
        { data: promptsData },
        { data: visualCategoriesData },
        { data: modulesData },
        { data: toolsData },
        { data: categoriesData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        supabase.from('prompt_visual_categories').select('*').order('name'),
        supabase.from('academy_modules').select('*, academy_lessons(*)').order('order_index'),
        supabase.from('tools').select('*').order('created_at', { ascending: false }),
        supabase.from('tool_categories').select('*').order('name'),
        supabase.from('profiles').select('*')
      ]);

      if (promptsData) {
        setPrompts(promptsData);
        localStorage.setItem('hotmedia_admin_prompts_cache', JSON.stringify(promptsData));
      }
      if (visualCategoriesData) {
        setVisualCategories(visualCategoriesData);
        localStorage.setItem('hotmedia_admin_visual_categories_cache', JSON.stringify(visualCategoriesData));
      }
      if (modulesData) {
        const mappedModules = modulesData.map(m => ({ ...m, lessons: m.academy_lessons || [] }));
        setAcademyModules(mappedModules);
        localStorage.setItem('hotmedia_admin_academy_cache', JSON.stringify(mappedModules));
      }
      if (toolsData) {
        setTools(toolsData);
        localStorage.setItem('hotmedia_admin_tools_cache', JSON.stringify(toolsData));
      }
      if (categoriesData) {
        setToolCategories(categoriesData);
        localStorage.setItem('hotmedia_admin_tool_categories_cache', JSON.stringify(categoriesData));
      }
      if (profilesData) {
        setStudents(profilesData);
        localStorage.setItem('hotmedia_admin_students_cache', JSON.stringify(profilesData));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    localStorage.setItem('hotuncut_logo_height', logoHeight.toString());
    window.dispatchEvent(new CustomEvent('logo-updated'));
  }, [logoHeight]);

  React.useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('switch-admin-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-admin-tab', handleSwitchTab);
  }, []);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<any>(null);

  // Data States
  const [prompts, setPrompts] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_prompts_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [visualCategories, setVisualCategories] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_visual_categories_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [academyModules, setAcademyModules] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_academy_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [tools, setTools] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_tools_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [toolCategories, setToolCategories] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_tool_categories_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [students, setStudents] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hotmedia_admin_students_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Sessão do Supabase não encontrada. Por favor, faça login novamente com um email real para gerenciar o conteúdo.');
      return;
    }

    if (activeTab === 'prompts') {
      if (activeSubTab === 'categories') {
        const newItem = {
          name: formData.get('title') as string || formData.get('name') as string,
          image_url: formData.get('imageUrl') as string
        };
        if (editingItem) {
          const { error } = await supabase.from('prompt_visual_categories').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('prompt_visual_categories').insert(newItem);
          if (error) alert(error.message);
        }
      } else {
        const newItem = {
          title: formData.get('title'),
          description: formData.get('description'),
          category: formData.get('category'),
          difficulty: formData.get('difficulty'),
          content: formData.get('content'),
          is_nsfw: formData.get('isNSFW') === 'on',
          preview_image: formData.get('previewImage') || 'https://picsum.photos/seed/prompt/800/450'
        };

        if (editingItem) {
          const { error } = await supabase.from('prompts').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('prompts').insert(newItem);
          if (error) alert(error.message);
        }
      }
    } else if (activeTab === 'academy') {
      if (activeSubTab === 'modules') {
        const newItem = {
          title: formData.get('title') as string,
          order_index: Number(formData.get('order')) || (academyModules.length + 1)
        };
        if (editingItem) {
          const { error } = await supabase.from('academy_modules').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('academy_modules').insert(newItem);
          if (error) alert(error.message);
        }
      } else {
        const videoUrl = formData.get('videoUrl') as string;
        const fileUrl = formData.get('fileUrl') as string;
        const moduleId = formData.get('module_id') as string;

        if (!moduleId) {
          alert('Por favor, selecione um módulo para a aula.');
          return;
        }

        const newItem = {
          title: formData.get('title'),
          description: formData.get('description'),
          module_id: moduleId,
          video_url: videoUrl,
          image_url: formData.get('imageUrl'),
          file_url: fileUrl,
          file_name: formData.get('fileName'),
          type: videoUrl ? 'video' : fileUrl ? 'file' : 'image'
        };
        
        if (editingItem) {
          const { error } = await supabase.from('academy_lessons').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('academy_lessons').insert(newItem);
          if (error) alert(error.message);
        }
      }
    } else if (activeTab === 'tools') {
      if (activeSubTab === 'categories') {
        const name = formData.get('title') as string || formData.get('name') as string;
        const imageUrl = formData.get('imageUrl') as string;
        const newItem = { name, image_url: imageUrl };
        if (editingItem) {
          const { error } = await supabase.from('tool_categories').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('tool_categories').insert(newItem);
          if (error) alert(error.message);
        }
      } else {
        const newItem = {
          name: formData.get('title') || formData.get('name'),
          description: formData.get('description'),
          link: formData.get('url'),
          category: formData.get('category'),
          image_url: formData.get('imageUrl') || 'https://picsum.photos/seed/tool/400/400',
          is_hot: formData.get('isHot') === 'on'
        };
        if (editingItem) {
          const { error } = await supabase.from('tools').update(newItem).eq('id', editingItem.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase.from('tools').insert(newItem);
          if (error) alert(error.message);
        }
      }
    } else if (activeTab === 'students') {
      const newItem = {
        name: formData.get('title') || formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        plan_status: formData.get('status') === 'Ativo' ? 'active' : 'none',
        plan_type: formData.get('plan'),
        expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null
      };
      if (editingItem) {
        const { error } = await supabase.from('profiles').update(newItem).eq('id', editingItem.id);
        if (error) alert(error.message);
      } else {
        const { error } = await supabase.from('profiles').insert(newItem);
        if (error) alert(error.message);
      }
    }

    fetchData(true);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    let error;
    if (activeTab === 'prompts') {
      if (activeSubTab === 'categories') {
        ({ error } = await supabase.from('prompt_visual_categories').delete().eq('id', itemToDelete.id));
      } else {
        ({ error } = await supabase.from('prompts').delete().eq('id', itemToDelete.id));
      }
    } else if (activeTab === 'academy') {
      if (activeSubTab === 'modules') {
        ({ error } = await supabase.from('academy_modules').delete().eq('id', itemToDelete.id));
      } else {
        ({ error } = await supabase.from('academy_lessons').delete().eq('id', itemToDelete.id));
      }
    } else if (activeTab === 'tools') {
      if (activeSubTab === 'categories') {
        ({ error } = await supabase.from('tool_categories').delete().eq('id', itemToDelete.id));
      } else {
        ({ error } = await supabase.from('tools').delete().eq('id', itemToDelete.id));
      }
    } else if (activeTab === 'students') {
      ({ error } = await supabase.from('profiles').delete().eq('id', itemToDelete.id));
    }

    if (error) alert(error.message);
    fetchData(true);
    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const tabLabels = {
    prompts: 'Prompts',
    academy: 'Academia',
    tools: 'Ferramentas',
    students: 'Alunos',
    settings: 'Configurações'
  };

  const currentItems = activeTab === 'prompts' 
    ? (activeSubTab === 'categories' ? visualCategories : prompts)
    : activeTab === 'academy' 
      ? activeSubTab === 'modules' ? [...academyModules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : academyModules.flatMap((m: any) => m.lessons)
      : activeTab === 'tools'
        ? activeSubTab === 'categories' ? toolCategories : tools
        : students;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <Logo size="lg" />
          <div className="h-12 w-px bg-white/10 mx-2 hidden md:block" />
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight">Painel <span className="hot-text-gradient">Admin</span></h1>
            <p className="text-zinc-500 mt-1">Gerencie o conteúdo da sua plataforma e monitore o crescimento.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onLogout && (
            <button 
              onClick={onLogout}
              className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              title="Sair do Sistema"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          )}
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl hot-gradient text-white font-bold flex items-center gap-2 shadow-lg shadow-hot-orange/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'prompts' && (activeSubTab === 'categories' ? 'Nova Categoria' : 'Novo Prompt')}
            {activeTab === 'academy' && (activeSubTab === 'modules' ? 'Novo Módulo' : 'Nova Aula')}
            {activeTab === 'tools' && (activeSubTab === 'categories' ? 'Nova Categoria' : 'Nova Ferramenta')}
            {activeTab === 'students' && 'Novo Aluno'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ADMIN_STATS.map((stat) => (
          <div key={stat.label} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center ${stat.color} border border-white/5`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Management Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-2xl border border-[#1F1F1F] w-fit">
          {(['prompts', 'academy', 'tools', 'students', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setActiveSubTab('items');
              }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-hot-orange text-white shadow-lg shadow-hot-orange/20' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'prompts' && (
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('items')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'items' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Prompts
            </button>
            <button 
              onClick={() => setActiveSubTab('categories')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'categories' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Categorias Visuais
            </button>
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('items')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'items' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Aulas
            </button>
            <button 
              onClick={() => setActiveSubTab('modules')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'modules' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Módulos
            </button>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveSubTab('items')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'items' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Ferramentas
            </button>
            <button 
              onClick={() => setActiveSubTab('categories')}
              className={`text-sm font-bold transition-colors ${activeSubTab === 'categories' ? 'text-hot-orange' : 'text-zinc-500 hover:text-white'}`}
            >
              Categorias
            </button>
          </div>
        )}

        {activeTab === 'settings' ? (
          <div className="bg-[#141414] rounded-[2rem] border border-[#1F1F1F] p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-hot-orange/10 flex items-center justify-center text-hot-orange">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black">Configurações do Sistema</h2>
                <p className="text-zinc-500 text-sm">Personalize a identidade visual e as configurações globais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Logo do Sistema (URL)</label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="https://exemplo.com/logo.png"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Ou Subir Arquivo de Imagem</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setLogoUrl(base64String);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-4 py-8 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 group-hover:border-hot-orange/50 transition-all flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-hot-orange/10 flex items-center justify-center text-hot-orange">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-zinc-300">Clique para selecionar</p>
                        <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG ou SVG (Máx. 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Tamanho da Logo (Altura: {logoHeight}px)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="20" 
                      max="150" 
                      value={logoHeight}
                      onChange={(e) => setLogoHeight(parseInt(e.target.value))}
                      className="flex-1 accent-hot-orange h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-mono text-zinc-400 w-12">{logoHeight}px</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Ajuste a altura da logo para encontrar a proporção ideal no cabeçalho.
                  </p>
                </div>

                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Recomendamos imagens com fundo transparente (PNG) e altura de 40px a 60px para melhor visualização no menu lateral.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Visualização Prévia</label>
                <div className="h-full min-h-[200px] rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-hot-orange/5 blur-3xl" />
                  <Logo src={logoUrl} size="xl" className="relative z-10" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-4">
              <button 
                onClick={async () => {
                  try {
                    // Salva no localStorage para feedback imediato
                    localStorage.setItem('hotuncut_logo_url', logoUrl);
                    localStorage.setItem('hotuncut_logo_height', logoHeight.toString());
                    window.dispatchEvent(new CustomEvent('logo-updated'));

                    // Salva no Supabase para persistência real
                    const { error } = await supabase
                      .from('site_settings')
                      .upsert({ 
                        id: 'global', 
                        logo_url: logoUrl, 
                        logo_height: logoHeight,
                        updated_at: new Date().toISOString()
                      });

                    if (error) throw error;
                    alert('Configurações salvas com sucesso no banco de dados!');
                  } catch (err: any) {
                    console.error('Error saving settings:', err);
                    alert('Configurações salvas localmente, mas houve um erro ao salvar no banco: ' + err.message);
                  }
                }}
                className="px-8 py-3 rounded-xl hot-gradient text-white font-bold shadow-lg shadow-hot-orange/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Configurações
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Deseja realmente resetar a logo para o padrão?')) {
                    setLogoUrl('');
                    setLogoHeight(56);
                    localStorage.removeItem('hotuncut_logo_url');
                    localStorage.removeItem('hotuncut_logo_height');
                    
                    try {
                      await supabase
                        .from('site_settings')
                        .update({ logo_url: null, logo_height: 56 })
                        .eq('id', 'global');
                    } catch (err) {
                      console.error('Error resetting settings:', err);
                    }
                    
                    window.dispatchEvent(new CustomEvent('logo-updated'));
                  }
                }}
                className="px-8 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-400 font-bold transition-all hover:bg-white/10"
              >
                Resetar Logo Padrão
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#141414] rounded-[2rem] overflow-hidden border border-[#1F1F1F]">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder={`Buscar ${tabLabels[activeTab].toLowerCase()}...`}
                  className="bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-hot-orange w-full md:w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5">{activeTab === 'students' ? 'Nome' : 'Título / Nome'}</th>
                  {activeTab === 'students' ? (
                    <>
                      <th className="px-8 py-5">Email / Telefone</th>
                      <th className="px-8 py-5">Plano</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Expira em</th>
                    </>
                  ) : (
                    activeSubTab === 'items' && <th className="px-8 py-5">Categoria / Módulo</th>
                  )}
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-zinc-500 overflow-hidden">
                          {activeTab === 'prompts' ? (
                            activeSubTab === 'categories' ? <img src={item.image_url || undefined} className="w-full h-full object-cover" alt="" /> : <Terminal className="w-6 h-6" />
                          ) : activeTab === 'academy' ? (
                            activeSubTab === 'modules' ? <GraduationCap className="w-6 h-6" /> : (item.video_url ? <Youtube className="w-6 h-6" /> : <FileText className="w-6 h-6" />)
                          ) : activeTab === 'students' ? (
                            <Users className="w-6 h-6" />
                          ) : (
                            activeSubTab === 'categories' ? (
                              item.image_url ? <img src={item.image_url || undefined} className="w-full h-full object-cover" alt="" /> : <Filter className="w-6 h-6" />
                            ) : <img src={item.image_url || undefined} className="w-full h-full object-cover" alt="" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{item.title || item.name || item.nickname || item}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1">
                            {activeTab === 'students' 
                              ? `Membro desde: ${new Date(item.created_at).toLocaleDateString('pt-BR')}` 
                              : item.description || (activeSubTab === 'categories' ? 'Categoria' : activeSubTab === 'modules' ? 'Módulo da Academia' : '')}
                          </p>
                        </div>
                      </div>
                    </td>
                    {activeTab === 'students' ? (
                      <>
                        <td className="px-8 py-5">
                          <div className="space-y-1">
                            <p className="text-sm text-zinc-300">{item.email}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{item.nickname || 'Sem apelido'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-hot-orange/10 text-hot-orange border border-hot-orange/20">
                            {item.plan_status === 'active' ? 'Premium' : item.plan_status === 'trialing' ? 'Trial' : 'Gratuito'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.plan_status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-zinc-600'}`} />
                            <span className={`text-xs font-bold ${item.plan_status === 'active' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {item.plan_status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-zinc-400">
                            {item.expires_at ? new Date(item.expires_at).toLocaleDateString('pt-BR') : 'N/A'}
                          </p>
                        </td>
                      </>
                    ) : (
                      activeSubTab === 'items' && (
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 border border-white/5">
                            {activeTab === 'academy' ? academyModules.find((m: any) => m.id === item.module_id)?.title : item.category || 'Geral'}
                          </span>
                        </td>
                      )
                    )}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-zinc-500 text-sm">
                      Nenhum item encontrado. Comece adicionando um novo!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hot-orange/10 flex items-center justify-center text-hot-orange">
                    {activeTab === 'prompts' ? <Terminal className="w-5 h-5" /> : activeTab === 'academy' ? <GraduationCap className="w-5 h-5" /> : activeTab === 'students' ? <Users className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                  </div>
                  <h3 className="text-2xl font-display font-black">
                    {editingItem ? 'Editar' : 'Novo'} {tabLabels[activeTab].slice(0, -1)}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Common Fields */}
                  {((activeTab === 'academy' && activeSubTab === 'modules') || (activeTab === 'tools' && activeSubTab === 'categories') || (activeTab === 'prompts' && activeSubTab === 'categories')) ? (
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome / Título</label>
                      <input name="name" defaultValue={editingItem?.title || editingItem?.name || editingItem} required className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                      <input type="hidden" name="title" defaultValue={editingItem?.title || editingItem?.name || editingItem} />
                      {activeTab === 'academy' && activeSubTab === 'modules' && (
                        <div className="mt-4 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ordem de Exibição</label>
                          <input type="number" name="order" defaultValue={editingItem?.order_index} placeholder="Ex: 1" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                        </div>
                      )}
                      {activeTab === 'prompts' && activeSubTab === 'categories' && (
                        <div className="mt-4 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Imagem de Capa (URL)</label>
                          <input name="imageUrl" defaultValue={editingItem?.image_url} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                        </div>
                      )}
                      {activeTab === 'tools' && activeSubTab === 'categories' && (
                        <div className="mt-4 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Imagem da Categoria (URL)</label>
                          <input name="imageUrl" defaultValue={editingItem?.image_url} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Título / Nome</label>
                        <input name="title" defaultValue={editingItem?.title || editingItem?.name} required className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                        <input type="hidden" name="name" defaultValue={editingItem?.title || editingItem?.name} />
                      </div>

                      {/* Student Specific */}
                      {activeTab === 'students' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email</label>
                            <input name="email" defaultValue={editingItem?.email} required type="email" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Telefone</label>
                            <input name="phone" defaultValue={editingItem?.phone} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Status</label>
                            <select name="status" defaultValue={editingItem?.status || 'Ativo'} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                              <option value="Ativo">Ativo</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Plano</label>
                            <select name="plan" defaultValue={editingItem?.plan || 'Premium Anual'} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                              <option value="Premium Anual">Premium Anual</option>
                              <option value="Mensal">Mensal</option>
                              <option value="Gratuito">Gratuito</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Vencimento</label>
                            <input name="expires_at" type="date" defaultValue={editingItem?.expires_at ? new Date(editingItem.expires_at).toISOString().split('T')[0] : ''} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                          </div>
                        </>
                      )}

                      {/* Prompt Specific */}
                      {activeTab === 'prompts' && (
                        <>
                          {activeSubTab === 'categories' ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Imagem da Categoria (URL)</label>
                              <input name="imageUrl" defaultValue={editingItem?.image_url} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Categoria</label>
                                <select name="category" defaultValue={editingItem?.category} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                                  {visualCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Dificuldade</label>
                                <select name="difficulty" defaultValue={editingItem?.difficulty} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                                  <option value="Fácil">Fácil</option>
                                  <option value="Médio">Médio</option>
                                  <option value="Difícil">Difícil</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Preview (URL)</label>
                                <input name="previewImage" defaultValue={editingItem?.preview_image} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Engenharia do Prompt</label>
                                <textarea name="content" defaultValue={editingItem?.content} required rows={4} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors resize-none" />
                              </div>
                              <div className="flex items-center gap-3">
                                <input type="checkbox" name="isNSFW" defaultChecked={editingItem?.is_nsfw} className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-hot-orange focus:ring-hot-orange" />
                                <label className="text-sm font-bold text-zinc-300">Marcar como 'UNCUT' (+18)</label>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Academy Specific */}
                      {activeTab === 'academy' && (
                        <>
                          {activeSubTab === 'modules' ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ordem de Exibição</label>
                              <input name="order" type="number" defaultValue={editingItem?.order_index} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Módulo</label>
                                <select name="module_id" defaultValue={editingItem?.module_id} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                                  {academyModules.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">URL do Vídeo (YouTube)</label>
                                <div className="relative">
                                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                  <input name="videoUrl" defaultValue={editingItem?.video_url} placeholder="https://youtube.com/..." className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Thumbnail (URL)</label>
                                <div className="relative">
                                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                  <input name="imageUrl" defaultValue={editingItem?.image_url} className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Arquivo (PDF/Word URL)</label>
                                <div className="relative">
                                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                  <input name="fileUrl" defaultValue={editingItem?.file_url} className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Arquivo</label>
                                <input name="fileName" defaultValue={editingItem?.file_name} placeholder="Ex: Guia_Pratico.pdf" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Tools Specific */}
                      {activeTab === 'tools' && (
                        <>
                          {activeSubTab === 'items' && (
                            <>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link de Acesso</label>
                                <div className="relative">
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                  <input name="url" defaultValue={editingItem?.link} required placeholder="https://..." className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Categoria</label>
                                <select name="category" defaultValue={editingItem?.category} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors">
                                  {toolCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ícone / Imagem (URL)</label>
                                <div className="relative">
                                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                  <input name="imageUrl" defaultValue={editingItem?.image_url} className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors" />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <input type="checkbox" name="isHot" defaultChecked={editingItem?.is_hot} className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-hot-orange focus:ring-hot-orange" />
                                <label className="text-sm font-bold text-zinc-300">Marcar como "UNCUT"</label>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descrição</label>
                        <textarea name="description" defaultValue={editingItem?.description} required rows={2} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-hot-orange focus:outline-none transition-colors resize-none" />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20 flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" />
                    {editingItem ? 'Salvar Alterações' : 'Publicar Conteúdo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-black mb-2">Confirmar Exclusão</h3>
              <p className="text-zinc-500 text-sm mb-8">
                Tem certeza que deseja excluir "{itemToDelete?.title || itemToDelete?.name || itemToDelete}"? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/5 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all"
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
