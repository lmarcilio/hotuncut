import React from 'react';
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Youtube, 
  FileText, 
  Image as ImageIcon,
  X,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SocialMediaSectionProps {
  isAdmin?: boolean;
}

export default function SocialMediaSection({ isAdmin = false }: SocialMediaSectionProps) {
  const [modules, setModules] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewedLessons, setViewedLessons] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('hotmedia_viewed_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingLesson, setEditingLesson] = React.useState<any>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = React.useState(false);
  const [editingModule, setEditingModule] = React.useState<any>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ type: 'module' | 'lesson', id: string, title: string } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('academy_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .order('created_at', { ascending: true });

      if (lessonsError) throw lessonsError;

      const modulesWithLessons = modulesData.map(mod => ({
        ...mod,
        lessons: lessonsData.filter(lesson => lesson.module_id === mod.id)
      }));

      setModules(modulesWithLessons);
    } catch (error) {
      console.error('Error fetching academy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const form = e.target.closest('form');
      if (form) {
        const fileUrlInput = form.querySelector('input[name="fileUrl"]') as HTMLInputElement;
        const fileNameInput = form.querySelector('input[name="fileName"]') as HTMLInputElement;
        if (fileUrlInput) fileUrlInput.value = base64String;
        if (fileNameInput) fileNameInput.value = file.name;
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    localStorage.setItem('hotmedia_viewed_lessons', JSON.stringify(viewedLessons));
  }, [viewedLessons]);

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const moduleId = formData.get('moduleId') as string;
    
    const lessonData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      video_url: formData.get('videoUrl') as string,
      image_url: formData.get('imageUrl') as string,
      file_url: formData.get('fileUrl') as string,
      file_name: formData.get('fileName') as string,
      module_id: moduleId,
      type: formData.get('videoUrl') ? 'video' : formData.get('fileUrl') ? 'file' : 'image'
    };

    try {
      if (editingLesson) {
        const { error } = await supabase
          .from('academy_lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('academy_lessons')
          .insert([lessonData]);
        if (error) throw error;
      }
      
      await fetchData();
      setIsAddModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Erro ao salvar aula. Verifique o console.');
    }
  };

  const handleDeleteLesson = (lesson: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ type: 'lesson', id: lesson.id, title: lesson.title });
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = formData.get('title') as string;
    const orderIndex = Number(formData.get('order')) || (modules.length + 1);

    try {
      if (editingModule) {
        const { error } = await supabase
          .from('academy_modules')
          .update({ title, order_index: orderIndex })
          .eq('id', editingModule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('academy_modules')
          .insert([{ title, order_index: orderIndex }]);
        if (error) throw error;
      }

      await fetchData();
      setIsModuleModalOpen(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Erro ao salvar módulo. Verifique o console.');
    }
  };

  const handleDeleteModule = (moduleId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ type: 'module', id: moduleId, title });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'lesson') {
        const { error } = await supabase
          .from('academy_lessons')
          .delete()
          .eq('id', itemToDelete.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('academy_modules')
          .delete()
          .eq('id', itemToDelete.id);
        if (error) throw error;
      }

      await fetchData();
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erro ao excluir item. Verifique se existem aulas vinculadas ao módulo.');
    }
  };

  const toggleViewed = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewedLessons(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-hot-orange animate-spin" />
        <p className="text-zinc-500 font-medium">Carregando academia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black tracking-tight">Academia de <span className="hot-text-gradient">Criadores</span></h2>
          <p className="text-zinc-500 mt-1">Domine a arte da atenção e do crescimento com conteúdos exclusivos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingModule(null);
                  setIsModuleModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Novo Módulo
              </button>
              <button 
                onClick={() => {
                  setEditingLesson(null);
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl hot-gradient text-white font-bold text-sm shadow-lg shadow-hot-orange/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nova Aula
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="flex items-center gap-4 bg-[#141414] border border-[#1F1F1F] px-4 py-2 rounded-xl">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seu Progresso</p>
                <p className="text-sm font-bold text-hot-orange">{Math.round((viewedLessons.length / modules.flatMap((m: any) => m.lessons).length) * 100 || 0)}% Concluído</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                <svg className="w-10 h-10 -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/5"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * (viewedLessons.length / modules.flatMap((m: any) => m.lessons).length || 0))}
                    className="text-hot-orange transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-16">
        {[...modules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((module: any, modIndex: number) => (
          <div key={module.id} className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-display font-black text-white/5">{String(modIndex + 1).padStart(2, '0')}</span>
              <div className="flex-grow">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-display font-black tracking-tight">{module.title}</h3>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingModule(module);
                          setIsModuleModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteModule(module.id, module.title, e)}
                        className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-zinc-500 text-sm">{module.lessons.length} aulas disponíveis neste módulo</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {module.lessons.map((lesson: any, index: number) => (
                <motion.div 
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedLesson(lesson)}
                  className="bg-[#141414] border border-[#1F1F1F] rounded-[2rem] overflow-hidden group cursor-pointer hover:border-hot-orange/50 transition-all"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={lesson.image_url || `https://picsum.photos/seed/${lesson.id}/800/450`} 
                      alt={lesson.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLesson(null);
                              setEditingLesson(lesson);
                              setIsAddModalOpen(true);
                            }}
                            className="p-2 rounded-xl backdrop-blur-md border bg-black/40 border-white/10 text-white/50 hover:text-white hover:bg-black/60 transition-all"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteLesson(lesson, e)}
                            className="p-2 rounded-xl backdrop-blur-md border bg-black/40 border-white/10 text-white/50 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {!isAdmin && (
                        <button 
                          onClick={(e) => toggleViewed(lesson.id, e)}
                          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                            viewedLessons.includes(lesson.id)
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-black/40 border-white/10 text-white/50 hover:text-white hover:bg-black/60'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-hot-orange text-white flex items-center justify-center shadow-xl shadow-hot-orange/40 transform scale-90 group-hover:scale-100 transition-transform">
                        {lesson.type === 'video' ? <PlayCircle className="w-7 h-7 fill-white" /> : <FileText className="w-7 h-7" />}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                        {lesson.type === 'video' ? 'Vídeo Aula' : 'Material PDF'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <h4 className="text-lg font-bold group-hover:text-hot-orange transition-colors line-clamp-1">{lesson.title}</h4>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{lesson.description}</p>
                    
                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {lesson.type === 'video' ? '15 min' : 'Leitura'}
                      </div>
                      <div className="flex items-center gap-1 text-hot-orange text-xs font-bold">
                        Acessar <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLesson(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#141414]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-hot-orange/10 flex items-center justify-center text-hot-orange">
                    {selectedLesson.type === 'video' ? <Youtube className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedLesson.title}</h3>
                    <p className="text-xs text-zinc-500">Módulo: {modules.find((m: any) => m.lessons.some((l: any) => l.id === selectedLesson.id))?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                {selectedLesson.type === 'video' ? (
                  <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl">
                    {getYoutubeEmbedUrl(selectedLesson.video_url) ? (
                      <iframe 
                        src={getYoutubeEmbedUrl(selectedLesson.video_url)!}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <Youtube className="w-16 h-16 opacity-20" />
                        <p className="font-bold">Vídeo não disponível ou URL inválida</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#141414] rounded-3xl p-10 border border-white/5 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">{selectedLesson.file_name || 'Material de Apoio'}</h4>
                      <p className="text-zinc-500 mt-2">Clique no botão abaixo para baixar ou visualizar o arquivo.</p>
                    </div>
                    <a 
                      href={selectedLesson.file_url} 
                      download={selectedLesson.file_name || 'material.pdf'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl hot-gradient text-white font-black shadow-lg shadow-hot-orange/20"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Baixar Material
                    </a>
                  </div>
                )}

                <div className="space-y-4">
                  <h5 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-hot-orange" />
                    Sobre esta aula
                  </h5>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    {selectedLesson.description}
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => {
                        toggleViewed(selectedLesson.id, e);
                        setSelectedLesson(null);
                      }}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
                        viewedLessons.includes(selectedLesson.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {viewedLessons.includes(selectedLesson.id) ? 'Aula Concluída' : 'Marcar como Concluída'}
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setEditingLesson(selectedLesson);
                          setSelectedLesson(null);
                          setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                        Editar Aula
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  {editingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Título</label>
                  <input name="title" defaultValue={editingLesson?.title} required className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Módulo</label>
                  <select name="moduleId" defaultValue={editingLesson?.moduleId || modules[0]?.id} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors">
                    {modules.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">URL do Vídeo (YouTube)</label>
                  <input name="videoUrl" defaultValue={editingLesson?.video_url} placeholder="https://youtube.com/..." className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Thumbnail (URL)</label>
                  <input name="imageUrl" defaultValue={editingLesson?.image_url} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Upload de Material (PDF/Doc)</label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.zip"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] text-zinc-400 text-sm font-bold hover:bg-[#2F2F2F] transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? 'Processando...' : <><Plus className="w-4 h-4" /> Selecionar Arquivo</>}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Arquivo (URL ou Base64)</label>
                  <input name="fileUrl" defaultValue={editingLesson?.file_url} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nome do Arquivo</label>
                  <input name="fileName" defaultValue={editingLesson?.file_name} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Descrição</label>
                  <textarea name="description" defaultValue={editingLesson?.description} required rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors resize-none" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20 flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" />
                    {editingLesson ? 'Salvar Alterações' : 'Publicar Aula'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Module Modal */}
      <AnimatePresence>
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModuleModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black">
                  {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                </h3>
                <button onClick={() => setIsModuleModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Título do Módulo</label>
                  <input name="title" defaultValue={editingModule?.title} required className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Ordem de Exibição</label>
                  <input type="number" name="order" defaultValue={editingModule?.order_index} placeholder="Ex: 1" className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#2F2F2F] focus:border-hot-orange focus:outline-none transition-colors" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20 flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" />
                    {editingModule ? 'Salvar Alterações' : 'Criar Módulo'}
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
              className="relative w-full max-w-md bg-[#141414] p-8 rounded-[2.5rem] border border-[#1F1F1F] shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-black mb-2 text-white">Confirmar Exclusão</h3>
              <p className="text-zinc-500 mb-8">Tem certeza que deseja excluir {itemToDelete?.type === 'module' ? 'o módulo' : 'a aula'} <span className="text-white font-bold">"{itemToDelete?.title}"</span>? Esta ação não pode ser desfeita.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
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
