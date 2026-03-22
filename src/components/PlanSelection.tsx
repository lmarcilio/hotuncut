import React from 'react';
import { Check, Zap, Star, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const PLANS = [
  {
    id: 'monthly',
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
    id: 'lifetime',
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

export default function PlanSelection({ onPlanSelected }: { onPlanSelected: () => void }) {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const expiresAt = planId === 'lifetime' 
        ? new Date('2099-12-31').toISOString() 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan_status: 'active',
          is_lifetime: planId === 'lifetime',
          expires_at: expiresAt
        })
        .eq('id', user.id);

      if (error) throw error;
      onPlanSelected();
    } catch (err) {
      console.error('Error selecting plan:', err);
      alert('Erro ao selecionar plano. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hot-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hot-red/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <Logo className="justify-center mb-8" size="lg" />
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight">
            Escolha seu <span className="hot-text-gradient">Plano</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Para acessar a plataforma, selecione o plano que melhor se adapta à sua jornada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                  plan.highlight 
                  ? 'hot-gradient text-white shadow-lg shadow-hot-orange/20' 
                  : 'bg-white text-black hover:bg-zinc-200'
                }`}>
                  {loading === plan.id ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
