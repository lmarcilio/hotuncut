import React from 'react';
import { TrendingUp, Users, Zap, Star, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

const STATS = [
  { label: 'Alunos Ativos', value: '12.4k', icon: Users, color: 'text-blue-400' },
  { label: 'Prompts Usados', value: '850k+', icon: Zap, color: 'text-hot-orange' },
  { label: 'Taxa de Sucesso', value: '98%', icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Avaliação Média', value: '4.9/5', icon: Star, color: 'text-amber-400' },
];

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden p-8 md:p-16 border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-hot-orange/20 via-transparent to-hot-red/10" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-hot-orange/10 text-hot-orange text-xs font-bold uppercase tracking-widest border border-hot-orange/20"
          >
            Bem-vindo de volta, Criador
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold leading-tight"
          >
            Escala sua <span className="hot-text-gradient">Influência</span> Agora.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-lg"
          >
            Acesse o kit de ferramentas definitivo para crescimento em redes sociais, domínio de IA e autoridade digital.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button className="px-8 py-4 rounded-2xl hot-gradient text-white font-bold text-lg shadow-lg shadow-hot-orange/20 hover:scale-105 transition-transform">
              Ver Cursos
            </button>
            <button 
              onClick={onLogout}
              className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all"
            >
              Sair
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {STATS.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="glass-card rounded-2xl p-6 space-y-2"
          >
            <div className={`w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center ${stat.color} border border-zinc-800`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / Featured */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold">Treinamento em Destaque</h2>
            <button className="text-hot-orange text-sm font-bold flex items-center gap-1 hover:underline">
              Ver Todos <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card rounded-3xl p-1 overflow-hidden">
            <div className="relative aspect-video rounded-2xl overflow-hidden group">
              <img 
                src="https://picsum.photos/seed/featured/1200/675" 
                alt="Featured" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <span className="text-hot-orange text-xs font-bold uppercase tracking-widest mb-2">Novo Curso</span>
                <h3 className="text-3xl font-bold mb-2">O Framework de Conteúdo Viral 2024</h3>
                <p className="text-zinc-300 max-w-md">Aprenda o sistema exato que usamos para gerar mais de 50 milhões de visualizações no TikTok e Instagram no mês passado.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold">Top Prompts</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-hot-orange/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-hot-orange transition-colors border border-zinc-800">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Gerador de Gancho Viral v{i}.0</h4>
                  <p className="text-zinc-500 text-xs">Usado 12.4k vezes esta semana</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-sm hover:bg-zinc-800 transition-colors">
            Navegar por Todos os Prompts
          </button>
        </div>
      </div>
    </div>
  );
}
