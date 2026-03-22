import React from 'react';
import { Mail, Lock, ArrowRight, Github, Chrome, Flame, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

export default function AuthPage({ onLogin, initialMode = 'login' }: { onLogin: () => void, initialMode?: 'login' | 'signup' }) {
  const [isLogin, setIsLogin] = React.useState(initialMode === 'login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        alert('Verifique seu email para confirmar o cadastro!');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hot-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hot-red/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <Logo className="justify-center mb-4" iconSize="w-12 h-12" textSize="text-3xl" showText={false} />
          <h2 className="text-3xl font-display font-black tracking-tight">
            {isLogin ? 'Bem-vindo de volta' : 'Junte-se ao HOT UNCUT'}
          </h2>
          <p className="text-zinc-500 text-sm">
            {isLogin ? 'Insira seus dados para acessar o painel.' : 'Comece sua jornada para a dominância digital hoje.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Endereço de Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors text-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-hot-orange transition-colors text-zinc-200"
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs font-bold text-hot-orange hover:underline">Esqueceu a senha?</button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl hot-gradient text-white font-black text-lg shadow-xl shadow-hot-orange/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[#0b0b0b] px-4 text-zinc-600">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
          >
            <Chrome className="w-4 h-4" /> Google
          </button>
          <button 
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
          >
            <Github className="w-4 h-4" /> GitHub
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white font-bold hover:text-hot-orange transition-colors"
          >
            {isLogin ? 'Cadastrar' : 'Entrar'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
