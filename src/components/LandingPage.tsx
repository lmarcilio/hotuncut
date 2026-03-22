import React from 'react';
import { Check, Star, ArrowRight, Play, Zap, Shield, Users, MessageSquare, ChevronDown, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

const PLANS = [
  {
    name: "Mensal",
    price: "R$ 47",
    period: "/mês",
    tagline: "Ideal para quem quer testar",
    description: "Acesso completo para começar sua jornada hoje.",
    features: ["Biblioteca Completa de Prompts", "Acesso Básico à Academia", "Acesso ao Toolbox", "Suporte da Comunidade"],
    cta: "Começar Mensal",
    highlight: false
  },
  {
    name: "Vitalício",
    price: "R$ 197",
    period: " único",
    tagline: "OFERTA DE LANÇAMENTO",
    badge: "ECONOMIA DE 80%",
    description: "Acesso Vitalício ao Ecossistema Uncut. Todas as atualizações futuras inclusas. Sem taxas escondidas.",
    features: ["Tudo no Mensal", "Masterclasses Exclusivas", "Suporte Direto", "Atualizações Vitalícias", "Mastermind Privado"],
    cta: "QUERO ACESSO VITALÍCIO",
    highlight: true
  }
];

const FAQS = [
  { 
    q: "O conteúdo Hot é seguro?", 
    a: "Sim, todos os prompts são privativos e focados em ferramentas que permitem liberdade criativa total, garantindo que você possa criar sem restrições." 
  },
  { 
    q: "Vocês enganam o ChatGPT ou Gemini?", 
    a: "Não. Nós não usamos 'jailbreaks' ou truques para enganar plataformas. Nossos prompts são otimizados para ferramentas de IA que já permitem liberdade total e alta qualidade, garantindo resultados profissionais sem riscos de banimento." 
  },
  { 
    q: "Preciso saber de programação?", 
    a: "Zero. Nossa plataforma foi feita para ser copiada e colada. É o atalho definitivo para quem quer resultados profissionais sem complicações técnicas." 
  },
  { 
    q: "Como funciona o acesso vitalício?", 
    a: "Ao adquirir o plano vitalício, você paga apenas uma vez e tem acesso a todos os conteúdos atuais e futuros da plataforma para sempre, sem mensalidades." 
  },
  { 
    q: "Os prompts são atualizados?", 
    a: "Sim! Nossa equipe adiciona novos prompts semanalmente, acompanhando as tendências do mercado e as atualizações das IAs como Midjourney e ChatGPT." 
  }
];

const CATEGORIES = [
  { name: "Realista", img: "https://picsum.photos/seed/realism/400/500", desc: "Rostos e cenários ultra-detalhados que parecem fotos reais." },
  { name: "Anime", img: "https://picsum.photos/seed/manga/400/500", desc: "Estilos variados, do clássico ao moderno, com perfeição visual." },
  { name: "UNCUT SECTION", img: "https://picsum.photos/seed/uncensored/400/500", desc: "Liberdade total para conteúdo adulto sem bloqueios de censura.", badge: "Liberdade Total" },
  { name: "Marketing", img: "https://picsum.photos/seed/ads/400/500", desc: "Prompts focados em conversão, anúncios e vendas de alto impacto." },
];

const STEPS = [
  { icon: <Star className="w-6 h-6" />, title: "Engenharia de Prompts" },
  { icon: <Zap className="w-6 h-6" />, title: "Atualizações Constantes" },
  { icon: <Shield className="w-6 h-6" />, title: "Sem Censura" },
  { icon: <Check className="w-6 h-6" />, title: "Resultados Reais" },
];

const DETAILED_FEATURES = [
  {
    title: "Engenharia de Prompts",
    description: "Prompts otimizados por especialistas para máxima qualidade visual.",
    icon: <Star className="w-8 h-8 text-hot-orange" />,
    image: "https://picsum.photos/seed/prompt-eng/400/250",
    color: "orange"
  },
  {
    title: "Atualizações Constantes",
    description: "Novos prompts e ferramentas adicionados semanalmente.",
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    image: "https://picsum.photos/seed/updates/400/250",
    color: "yellow"
  },
  {
    title: "Sem Censura",
    description: "Sem censura está relacionado aos prompts e as plataforma que ensinamos a utilizar, isso quer dizer que alguma irão sim bloquear o uso.",
    icon: <Shield className="w-8 h-8 text-red-500" />,
    image: "https://picsum.photos/seed/uncensored-card/400/250",
    color: "red"
  },
  {
    title: "Resultados Reais",
    description: "O que você vê é o que você gera. Qualidade fotorealista garantida.",
    icon: <Check className="w-8 h-8 text-emerald-400" />,
    image: "https://picsum.photos/seed/results/400/250",
    color: "emerald"
  }
];

function AccordionItem({ question, answer }: { question: string, answer: string, key?: React.Key }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/5 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage({ onGetStarted }: { onGetStarted: (mode: 'login' | 'signup') => void }) {
  return (
    <div className="bg-[#050505] text-white selection:bg-hot-orange/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <button 
            onClick={() => onGetStarted('login')}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,77,0,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hot-orange/10 border border-hot-orange/20 text-hot-orange text-xs font-bold uppercase tracking-widest"
            >
              <Star className="w-3 h-3 fill-hot-orange" />
              A Plataforma #1 para Criadores Sem Censura
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl xl:text-8xl font-display font-black tracking-tight leading-[0.9]"
            >
              Pare de lutar com a IA. <br />
              <span className="hot-text-gradient">Domine o algoritmo</span> hoje.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl lg:mx-0 mx-auto leading-relaxed"
            >
              Tenha em mãos a biblioteca definitiva de prompts que os maiores criadores usam para gerar imagens realistas, animes impecáveis e conteúdos exclusivos sem censura. Economize horas de trabalho e escale sua audiência com um clique.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 pt-4"
            >
              <button 
                onClick={() => onGetStarted('signup')}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl hot-gradient text-white font-black text-xl shadow-2xl shadow-hot-orange/30 animate-pulse-hot transition-transform flex items-center justify-center gap-2"
              >
                QUERO ACESSO IMEDIATO <ArrowRight className="w-6 h-6" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-white" /> Ver Demo
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-8 flex flex-col lg:items-start items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-zinc-800" alt="User" />
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-medium">Junte-se a <span className="text-white font-bold">+2.400</span> criadores de elite</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 20 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-10 bg-hot-orange/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass-card p-4 rounded-[2.5rem] border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-[1.5rem] overflow-hidden aspect-square">
                <img 
                  src="https://picsum.photos/seed/hero-ai/800/800" 
                  alt="AI Generation Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl border-white/10 shadow-xl animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg hot-gradient flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-hot-orange">Prompt Gerado</p>
                    <p className="text-xs font-bold">Realismo 8K Ativado</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl border-white/10 shadow-xl">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-hot-orange fill-hot-orange" />
                  <span className="text-xs font-bold">Qualidade Premium</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resultados Reais Marquee */}
      <section className="py-10 overflow-hidden bg-white/5 border-y border-white/5">
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-64 h-80 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
              <img 
                src={`https://picsum.photos/seed/hotmedia-${i}/400/600`} 
                alt="AI Result" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[...Array(10)].map((_, i) => (
            <div key={`dup-${i}`} className="w-64 h-80 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
              <img 
                src={`https://picsum.photos/seed/hotmedia-${i}/400/600`} 
                alt="AI Result" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Problema vs Solução */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight">
              Cansado de prompts que geram <span className="text-zinc-600">resultados amadores?</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Ou pior, cansado da censura das IAs comuns que limitam sua criatividade? O HOT UNCUT foi criado para quem quer liberdade total. Do marketing profissional ao conteúdo da UNCUT SECTION, nós entregamos a engenharia exata para o resultado perfeito.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Chega de avisos de erro por "conteúdo sensível"</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Resultados ultra-realistas sem deformações</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-hot-orange/20 blur-3xl rounded-full" />
            <div className="glass-card p-8 rounded-[2.5rem] relative space-y-6">
              <div className="hot-gradient w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-hot-orange/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold">Liberdade Total</h3>
              <p className="text-zinc-400">Esqueça os avisos de erro do ChatGPT ou Midjourney. Nossos prompts são testados em IAs 'Uncensored' para você criar o que quiser, como quiser.</p>
              <button onClick={() => onGetStarted('signup')} className="text-hot-orange font-bold flex items-center gap-2 hover:gap-4 transition-all">
                Ver biblioteca sem censura <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black">Explore Nossas <span className="hot-text-gradient">Categorias</span></h2>
            <p className="text-zinc-400">Engenharia de prompts para cada necessidade do seu negócio.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  {cat.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-hot-orange text-white text-[10px] font-black uppercase tracking-widest">
                      {cat.badge}
                    </span>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <h4 className="text-2xl font-bold">{cat.name}</h4>
                    <p className="text-zinc-400 text-sm leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">{cat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black">Nossos <span className="hot-text-gradient">Diferenciais</span></h2>
            <p className="text-zinc-400">A estrutura que você precisa para escalar com segurança e qualidade.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center space-y-6 relative">
                {i < 3 && <div className="hidden lg:block absolute top-12 left-2/3 w-full h-px bg-gradient-to-r from-hot-orange/50 to-transparent" />}
                <div className="w-20 h-20 rounded-3xl hot-gradient mx-auto flex items-center justify-center text-white shadow-xl shadow-hot-orange/20 relative z-10">
                  <span className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center text-xs">0{i+1}</span>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Cards Section */}
      <section className="py-20 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DETAILED_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] space-y-6 group hover:bg-white/5 transition-all overflow-hidden relative border border-white/5"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${feature.color}-500/10 blur-3xl rounded-full`} />
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
              <div className="pt-4">
                <div className="h-32 w-full rounded-2xl border border-white/10 overflow-hidden group-hover:rotate-1 transition-transform">
                  <img src={feature.image} className="w-full h-full object-cover" alt={feature.title} referrerPolicy="no-referrer" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Preview (Academy & Toolbox) */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10 rounded-[3rem] space-y-6 group hover:bg-white/5 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">Academia de Criadores</h3>
              <p className="text-zinc-400 text-lg">Aulas em vídeo passo a passo sobre como dominar os algoritmos e crescer sua audiência. Aprenda a criar seus próprios prompts de elite.</p>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800" alt="Student" />)}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">+2k alunos</div>
              </div>
              <div className="h-20 w-32 rounded-xl border border-white/10 overflow-hidden rotate-3 group-hover:rotate-0 transition-transform">
                <img src="https://picsum.photos/seed/course/200/150" className="w-full h-full object-cover" alt="Course Preview" />
              </div>
            </div>
          </div>
          <div className="glass-card p-10 rounded-[3rem] space-y-6 group hover:bg-white/5 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">Ferramentas Úteis</h3>
              <p className="text-zinc-400 text-lg">As ferramentas exatas que usamos para gerenciar múltiplas contas e automatizar nosso fluxo de trabalho. Ganhe tempo e eficiência.</p>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-400" /></div>)}
              </div>
              <div className="h-20 w-32 rounded-xl border border-white/10 overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform">
                <img src="https://picsum.photos/seed/tool/200/150" className="w-full h-full object-cover" alt="Tool Preview" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black">Preços Simples e <span className="hot-text-gradient">Transparentes</span></h2>
            <p className="text-zinc-400 text-lg">Escolha o plano que melhor se adapta à sua jornada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-8 rounded-[2.5rem] border transition-all ${
                  plan.highlight 
                  ? 'bg-zinc-900 border-hot-orange/50 shadow-2xl shadow-hot-orange/10 scale-105 z-10' 
                  : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-hot-orange text-white text-[10px] font-black uppercase tracking-widest">
                    Mais Popular
                  </span>
                )}
                <div className="space-y-6 text-left">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {plan.badge && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    {plan.tagline && <p className="text-hot-orange text-xs font-bold uppercase tracking-widest mt-2">{plan.tagline}</p>}
                    <p className="text-zinc-400 text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-black">{plan.price}</span>
                    <span className="text-zinc-500 font-medium">{plan.period}</span>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-hot-orange/10 flex items-center justify-center text-hot-orange">
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => onGetStarted('signup')}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                    plan.highlight 
                    ? 'hot-gradient text-white shadow-lg shadow-hot-orange/20' 
                    : 'bg-white text-black hover:bg-zinc-200'
                  }`}>
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl font-display font-black text-center">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center space-y-8">
        <Logo className="justify-center" iconSize="w-8 h-8" textSize="text-xl" />
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Acesso Vitalício ao Ecossistema Uncut. A plataforma definitiva para criadores que desejam escalar sua influência e construir um negócio lucrativo.
        </p>
        <div className="text-zinc-600 text-xs">
          © 2026 HOT UNCUT. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
