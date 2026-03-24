import React from 'react';
import { Check, Zap, ArrowRight, Loader2, CreditCard, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const LIFETIME_PLAN = {
  id: 'lifetime',
  name: "Acesso Vitalício",
  price: "R$ 197",
  period: " único",
  tagline: "OFERTA DE LANÇAMENTO",
  badge: "ECONOMIA DE 80%",
  description: "Pague uma única vez e tenha acesso a todos os conteúdos atuais e futuros para sempre. Sem mensalidades, sem surpresas.",
  features: [
    "Biblioteca Completa de Prompts",
    "Academia de Criadores Completa",
    "Acesso ao Toolbox",
    "Masterclasses Exclusivas",
    "Suporte Direto",
    "Atualizações Vitalícias",
    "Mastermind Privado"
  ],
  cta: "QUERO ACESSO VITALÍCIO",
};

export default function PlanSelection({ onPlanSelected, initialPlanId }: { onPlanSelected: () => void, initialPlanId?: string }) {
  const [loading, setLoading] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSelectPlan = async () => {
    setLoading(true);
    setIsProcessing(true);

    // Link de checkout da Nexano para o plano vitalício
    // Substitua pelo link real do seu painel Nexano
    const CHECKOUT_URL = 'https://pay.nexano.com.br/checkout/lifetime-plan-id';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const finalUrl = `${CHECKOUT_URL}?external_id=${user.id}&email=${encodeURIComponent(user.email || '')}`;
      window.location.href = finalUrl;
    } catch (err) {
      console.error('Error selecting plan:', err);
      alert('Erro ao processar. Tente novamente.');
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={onPlanSelected}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all font-bold text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Voltar ao Início
        </button>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <div className="relative mx-auto w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-t-hot-orange border-r-transparent border-b-transparent border-l-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-hot-orange" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                  Processando <span className="hot-text-gradient">Pagamento</span>
                </h2>
                <p className="text-zinc-400 font-medium">
                  Estamos processando sua transação via <span className="text-white font-bold">Nexano Secure Gateway</span>.
                  Não feche esta janela.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-hot-orange/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-hot-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status da Transação</p>
                  <p className="text-sm font-bold text-white">Aguardando confirmação da rede...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hot-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hot-red/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-lg w-full space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <Logo className="justify-center mb-8" size="lg" />
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight">
            Acesso <span className="hot-text-gradient">Vitalício</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Pague uma única vez e tenha acesso completo para sempre. Sem mensalidades.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-10 rounded-[2.5rem] border bg-zinc-900 border-hot-orange/50 shadow-2xl shadow-hot-orange/10"
        >
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-hot-orange text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            🔥 Oferta de Lançamento
          </span>

          <div className="space-y-8 text-left">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{LIFETIME_PLAN.name}</h3>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  {LIFETIME_PLAN.badge}
                </span>
              </div>
              <p className="text-hot-orange text-xs font-bold uppercase tracking-widest mt-2">{LIFETIME_PLAN.tagline}</p>
              <p className="text-zinc-400 text-sm mt-2">{LIFETIME_PLAN.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-display font-black">{LIFETIME_PLAN.price}</span>
              <span className="text-zinc-500 font-medium text-lg">{LIFETIME_PLAN.period}</span>
            </div>

            <ul className="space-y-4">
              {LIFETIME_PLAN.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-hot-orange/10 flex items-center justify-center text-hot-orange shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSelectPlan}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xl hot-gradient text-white shadow-lg shadow-hot-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {LIFETIME_PLAN.cta} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 pt-2 text-zinc-600 text-xs">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Pagamento Seguro</span>
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Sem Mensalidades</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Acesso Imediato</span>
            </div>
          </div>
        </motion.div>

        <div className="text-center">
          <button
            onClick={onPlanSelected}
            className="text-zinc-600 hover:text-zinc-400 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            Pular por enquanto e acessar o painel
          </button>
        </div>
      </div>
    </div>
  );
}

