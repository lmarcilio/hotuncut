import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  CreditCard, 
  Save, 
  Camera,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentProfile {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  plan: string;
  expiration: string;
  status: string;
}

export default function ProfileSection() {
  const [profile, setProfile] = React.useState<StudentProfile>(() => {
    const saved = localStorage.getItem('hotmedia_current_user');
    if (saved) return JSON.parse(saved);
    
    // Default dummy data for demo
    return {
      id: 1,
      name: 'Lucas Marcilo',
      nickname: 'lucas_m',
      email: 'lucasmarcilo7@gmail.com',
      phone: '(11) 99999-9999',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
      plan: 'Premium Anual',
      expiration: '2026-12-31',
      status: 'Ativo'
    };
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('hotmedia_current_user', JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight">Minha Conta</h2>
          <p className="text-zinc-500">Gerencie seus dados pessoais e informações de plano.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Alterações salvas com sucesso!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 hot-gradient opacity-10" />
            
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 border-4 border-[#050505] mx-auto overflow-hidden shadow-2xl relative group">
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input 
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-hot-orange flex items-center justify-center shadow-lg shadow-hot-orange/20 border-4 border-[#050505]">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-black">{profile.name}</h3>
            <p className="text-zinc-500 text-sm font-medium">@{profile.nickname}</p>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Status</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  {profile.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Membro desde</span>
                <span className="text-white font-bold">Março 2024</span>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-hot-orange/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-hot-orange" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-500">Tipo de Plano</h4>
                <p className="text-lg font-black">{profile.plan}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-500">Vencimento</h4>
                <p className="text-lg font-black">{profile.expiration}</p>
              </div>
            </div>

            <button className="w-full py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all font-black text-sm uppercase tracking-widest">
              Gerenciar Assinatura
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Apelido</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">@</span>
                  <input 
                    type="text" 
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-hot-orange" />
                Segurança
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Confirmar Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none focus:border-hot-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-xl shadow-hot-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
