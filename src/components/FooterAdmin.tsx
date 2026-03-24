import React, { useState } from 'react';
import { Lock, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface FooterAdminProps {
  onAdminLogin: (isAdmin: boolean) => void;
}

export default function FooterAdmin({ onAdminLogin }: FooterAdminProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Acesso administrativo estrito conforme solicitado:
    // Usuário: admin
    // Senha: 123456
    if (username === 'admin' && password === '123456') {
      // Tenta um login real no Supabase com uma conta administrativa padrão
      // para garantir que as permissões de banco (RLS) funcionem no painel.
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: 'admin@admin.com',
          password: '123456',
        });

        if (authError) {
          console.warn('Login administrativo no Supabase falhou, usando modo de visualização apenas.');
        }
      } catch (err) {
        console.error('Erro ao autenticar admin no Supabase:', err);
      }

      onAdminLogin(true);
      setIsModalOpen(false);
      setUsername('');
      setPassword('');
      setError('');
    } else {
      setError('Credenciais administrativas inválidas.');
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
          title="Acesso Administrativo"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <Logo iconSize="w-16 h-16" textSize="text-3xl" showText={false} />
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black">Acesso Restrito</h2>
                  <p className="text-zinc-400 text-sm">Área exclusiva para administradores da HOT UNCUT.</p>
                </div>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Usuário</label>
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-hot-orange/50 focus:outline-none transition-colors"
                      placeholder="Seu usuário"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Senha</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-hot-orange/50 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-xl hot-gradient text-white font-black text-lg shadow-lg shadow-hot-orange/20 hover:scale-[1.02] transition-transform"
                  >
                    Entrar no Painel
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
