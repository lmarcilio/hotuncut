import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  GraduationCap, 
  Wrench, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

import Dashboard from './components/Dashboard';
import PromptsSection from './components/PromptsSection';
import SocialMediaSection from './components/SocialMediaSection';
import ToolsSection from './components/ToolsSection';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import ProfileSection from './components/ProfileSection';
import AuthPage from './components/AuthPage';
import PlanSelection from './components/PlanSelection';
import FooterAdmin from './components/FooterAdmin';

import Logo from './components/Logo';

type Section = 'dashboard' | 'prompts' | 'academy' | 'tools' | 'admin' | 'profile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<Section>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showForceAccess, setShowForceAccess] = React.useState(false);
  const [viewingLanding, setViewingLanding] = React.useState(true);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const fetchRetryCount = React.useRef(0);

  // Controle do botão de "Forçar Acesso" e Watchdog
  React.useEffect(() => {
    if (loading && isLoggedIn) {
      const timer = setTimeout(() => {
        setShowForceAccess(true);
      }, 3000);

      // Watchdog de 15 segundos para garantir que o usuário nunca fique travado
      const watchdog = setTimeout(async () => {
        if (loading && !userProfile) {
          console.warn('Watchdog: Perfil demorou demais. Forçando acesso básico.');
          const { data: { user } } = await supabase.auth.getUser();
          setLoading(false);
          setUserProfile({
            id: user?.id || 'temp',
            email: user?.email || '',
            name: user?.email?.split('@')[0] || 'Usuário (Modo de Segurança)',
            plan_status: 'none'
          });
        }
      }, 15000);

      return () => {
        clearTimeout(timer);
        clearTimeout(watchdog);
      };
    } else {
      setShowForceAccess(false);
    }
  }, [loading, isLoggedIn, userProfile]);

  React.useEffect(() => {
    const handleFocus = () => {
      console.log('[App] Janela focada, verificando integridade da sessão...');
      // Tentar obter a sessão atual pode forçar o cliente Supabase a se reconectar
      // se a conexão tiver caído enquanto a aba estava em segundo plano.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && !isLoggedIn) {
          console.log('[App] Sessão recuperada após foco');
          setIsLoggedIn(true);
        }
      }).catch(err => {
        console.error('[App] Erro ao verificar sessão no foco:', err);
      });
    };

    window.addEventListener('focus', handleFocus);

    const initAuth = async () => {
      try {
        console.log('[Auth] Inicializando autenticação...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('[Auth] Sessão ativa encontrada no initAuth.');
          setIsLoggedIn(true);
          setViewingLanding(false);
          // fetchProfile será chamado pelo onAuthStateChange (INITIAL_SESSION)
        } else {
          console.log('[Auth] Nenhuma sessão ativa no initAuth.');
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Erro ao inicializar auth:', err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Mudança no estado de auth:', event);
      
      if (session) {
        setIsLoggedIn(true);
        setViewingLanding(false);
        // Só busca o perfil se não for um evento redundante ou se o perfil ainda não existir
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          await fetchProfile(session.user.id, session.user.email);
        }
      } else {
        console.log('[Auth] Sessão encerrada ou inexistente.');
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isFetchingProfile = React.useRef(false);

  const fetchProfile = async (userId: string, email?: string) => {
    if (isFetchingProfile.current) {
      console.log('fetchProfile já está em execução, ignorando...');
      return;
    }
    isFetchingProfile.current = true;
    setLoading(true);
    setFetchError(null);

    try {
      console.log(`[fetchProfile] Iniciando busca para: ${userId} | Email: ${email} | Tentativa: ${fetchRetryCount.current + 1}`);
      
      // Tenta garantir que a sessão está fresca se for uma tentativa de repetição
      if (fetchRetryCount.current > 0) {
        console.log('[fetchProfile] Tentando atualizar sessão antes de buscar perfil...');
        try {
          // Timeout curto para o refresh da sessão também
          const refreshPromise = supabase.auth.refreshSession();
          const refreshTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_REFRESH')), 5000));
          await Promise.race([refreshPromise, refreshTimeout]);
        } catch (refreshErr) {
          console.warn('[fetchProfile] Falha ou timeout ao atualizar sessão:', refreshErr);
        }
      }

      // Timeout de segurança para a query do perfil (aumentado para 30s)
      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT_PROFILE_QUERY')), 30000)
      );

      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[fetchProfile] Aguardando resposta do banco (timeout: 30s)...');
      const { data, error } = await Promise.race([profileQuery, queryTimeout]) as any;

      if (data) {
        console.log('[fetchProfile] Perfil carregado com sucesso:', data.name);
        setUserProfile(data);
        // Removida a promoção automática para isAdmin. 
        // O acesso ao painel admin deve ser explícito via login de admin.
        fetchRetryCount.current = 0;
      } else if (error) {
        console.error('[fetchProfile] Erro ao carregar perfil:', error.message, error.code);
        
        // Fallback para manter dados básicos se o perfil falhar mas o email for mestre
        const isMasterAdmin = email === 'admin@admin.com' || email === 'lucasmarcilo7@gmail.com';
        if (isMasterAdmin) {
          console.log('[fetchProfile] Fallback: Usuário mestre detectado, mantendo perfil básico.');
          setUserProfile({
            id: userId,
            email: email || '',
            name: 'Administrador',
            plan_status: 'admin'
          });
          return;
        }

        setFetchError(error.message);
        
        if (error.message.includes('infinite recursion')) {
          console.error('[fetchProfile] ERRO CRÍTICO: Recursão infinita detectada nas regras do Supabase (RLS).');
          localStorage.setItem('rls_recursion_detected', 'true');
        } else if (error.code === 'PGRST116' || error.message.includes('no rows')) {
          // Perfil não existe, vamos tentar criar um básico
          console.log('[fetchProfile] Perfil não encontrado, criando perfil básico...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId, 
                email: email, 
                name: email?.split('@')[0] || 'Usuário',
                plan_status: 'none'
              }
            ])
            .select()
            .single();

          if (newProfile) {
            console.log('[fetchProfile] Perfil básico criado com sucesso.');
            setUserProfile(newProfile);
            fetchRetryCount.current = 0;
          } else {
            console.error('[fetchProfile] Falha ao criar perfil básico:', createError?.message);
            setFetchError(`Erro ao criar perfil: ${createError?.message}`);
            
            // Se falhou o insert, pode ser RLS. Tenta novamente uma vez.
            if (fetchRetryCount.current < 1) {
              fetchRetryCount.current++;
              isFetchingProfile.current = false;
              console.log('[fetchProfile] Agendando nova tentativa de criação de perfil...');
              setTimeout(() => fetchProfile(userId, email), 1000);
              return;
            }
          }
        } else {
          // Outro erro (ex: timeout, rede). Tenta novamente até 2 vezes.
          if (fetchRetryCount.current < 2) {
            fetchRetryCount.current++;
            console.log(`[fetchProfile] Agendando nova tentativa (${fetchRetryCount.current}) após erro genérico...`);
            isFetchingProfile.current = false;
            setTimeout(() => fetchProfile(userId, email), 2000);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('[fetchProfile] Erro inesperado ou timeout:', err.message || err);
      
      // Fallback para manter dados básicos se o erro for inesperado (ex: timeout)
      const isMasterAdmin = email === 'admin@admin.com' || email === 'lucasmarcilo7@gmail.com';
      if (isMasterAdmin) {
        console.log('[fetchProfile] Fallback (Catch): Usuário mestre detectado, mantendo perfil básico.');
        setUserProfile({
          id: userId,
          email: email || '',
          name: 'Administrador',
          plan_status: 'admin'
        });
        return;
      }

      // Tenta novamente se for um erro inesperado (como o timeout que definimos)
      if (fetchRetryCount.current < 2) {
        fetchRetryCount.current++;
        console.log(`[fetchProfile] Agendando nova tentativa (${fetchRetryCount.current}) após erro inesperado: ${err.message}`);
        isFetchingProfile.current = false;
        setTimeout(() => fetchProfile(userId, email), 2000);
        return;
      }

      const errorMessage = err.message === 'TIMEOUT_PROFILE_QUERY' 
        ? 'O banco de dados demorou muito para responder (Tempo Limite de 30s). Verifique sua conexão ou tente novamente.'
        : (err.message || 'Erro inesperado');
      
      setFetchError(errorMessage);
    } finally {
      console.log('[fetchProfile] Finalizado.');
      setLoading(false);
      isFetchingProfile.current = false;
    }
  };

  const [isSlowLoading, setIsSlowLoading] = React.useState(false);

  // Timeout de segurança para o carregamento (aumentado para 15s)
  React.useEffect(() => {
    if (loading && isLoggedIn) {
      setIsSlowLoading(false);
      const slowTimer = setTimeout(() => setIsSlowLoading(true), 5000);
      
      const timer = setTimeout(() => {
        if (loading) {
          console.warn('O carregamento do perfil excedeu o tempo limite de 15s.');
          setLoading(false);
          if (!userProfile) {
            setFetchError('Tempo limite de carregamento excedido (15s). Verifique sua conexão.');
          }
        }
      }, 15000);
      
      return () => {
        clearTimeout(slowTimer);
        clearTimeout(timer);
      };
    }
  }, [loading, isLoggedIn, userProfile]);

  const handleLogout = async () => {
    try {
      console.log('[Auth] Iniciando logout...');
      await supabase.auth.signOut();
      localStorage.removeItem('hotmedia_current_user');
      localStorage.removeItem('rls_recursion_detected');
      setIsLoggedIn(false);
      setIsAdmin(false);
      setActiveSection('dashboard');
      setUserProfile(null);
      setViewingLanding(true);
      console.log('[Auth] Logout concluído. Redirecionando...');
      // Força um recarregamento para limpar qualquer estado residual
      window.location.href = '/';
    } catch (error) {
      console.error('[Auth] Erro ao sair:', error);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleGetStarted = (mode: 'login' | 'signup', planId?: string) => {
    setSelectedPlanId(planId || null);
    
    if (isLoggedIn) {
      // Se já está logado, removemos a landing page para mostrar o conteúdo (Dashboard ou PlanSelection)
      setViewingLanding(false);
    } else {
      setAuthMode(mode);
      setShowAuth(true);
    }
  };

  const handleTestLogin = () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'teste@teste.com',
      name: 'Usuário de Teste',
      plan_status: 'active',
      is_lifetime: true,
      created_at: new Date().toISOString()
    };
    setUserProfile(mockProfile);
    setIsLoggedIn(true);
    setShowAuth(false);
    setViewingLanding(false);
    setLoading(false);
  };

  // Update profile when custom event fires
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('hotmedia_current_user');
      if (saved) setUserProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen for a custom event since storage event only fires between tabs
    window.addEventListener('profile-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profile-updated', handleStorageChange);
    };
  }, []);

  // Remove admin from navItems as per user request
  const navItems = [
    { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard },
    { id: 'prompts', label: 'Biblioteca de Prompts', icon: Terminal },
    { id: 'academy', label: 'Academia de Criadores', icon: GraduationCap },
    { id: 'tools', label: 'Ferramentas Úteis', icon: Wrench },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onLogout={handleLogout} />;
      case 'prompts': return <PromptsSection isAdmin={isAdmin} />;
      case 'academy': return <SocialMediaSection isAdmin={isAdmin} />;
      case 'tools': return <ToolsSection isAdmin={isAdmin} />;
      case 'profile': return <ProfileSection userProfile={userProfile} onProfileUpdate={() => fetchProfile(userProfile?.id)} />;
      default: return <Dashboard onLogout={handleLogout} />;
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Configuração Ausente</h1>
          <p className="text-zinc-400">
            As variáveis de ambiente do Supabase não foram encontradas. 
            Certifique-se de configurar <code className="text-hot-orange">VITE_SUPABASE_URL</code> e <code className="text-hot-orange">VITE_SUPABASE_ANON_KEY</code> no seu painel da Netlify.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="w-12 h-12 border-4 border-hot-orange border-t-transparent rounded-full animate-spin" />
        {showForceAccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              O carregamento está demorando mais que o esperado. Isso pode ser devido a uma conexão lenta ou instabilidade temporária.
            </p>
            <button 
              onClick={() => {
                console.log('Acesso forçado pelo usuário.');
                setLoading(false);
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              FORÇAR ACESSO AO PAINEL
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  if (viewingLanding) {
    return (
      <>
        {showAuth && !isLoggedIn ? (
          <AuthPage 
            onLogin={() => {
              setIsLoggedIn(true);
              setShowAuth(false);
              setViewingLanding(false);
            }} 
            onTestLogin={handleTestLogin}
            onBack={() => setShowAuth(false)}
            initialMode={authMode}
          />
        ) : (
          <LandingPage onGetStarted={handleGetStarted} isLoggedIn={isLoggedIn} />
        )}
        <FooterAdmin onAdminLogin={(val) => {
          setIsAdmin(val);
          if (val) {
            setIsLoggedIn(true);
            setActiveSection('admin');
            setViewingLanding(false);
          }
        }} />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {showAuth ? (
          <AuthPage 
            onLogin={() => {
              console.log('[Auth] Login bem-sucedido, atualizando estado...');
              setIsLoggedIn(true);
              setViewingLanding(false);
            }} 
            onTestLogin={handleTestLogin}
            onBack={() => setShowAuth(false)}
            initialMode={authMode}
          />
        ) : (
          <LandingPage onGetStarted={handleGetStarted} isLoggedIn={isLoggedIn} />
        )}
        <FooterAdmin onAdminLogin={(val) => {
          setIsAdmin(val);
          if (val) {
            setIsLoggedIn(true);
            setActiveSection('admin');
          }
        }} />
      </>
    );
  }

  if (isLoggedIn && !isAdmin) {
    // Se o perfil ainda não carregou E ainda estamos no estado de loading, mostramos o spinner
    if (!userProfile && loading) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-hot-orange border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 blur-xl bg-hot-orange/20 animate-pulse" />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-500 font-medium animate-pulse">Carregando seu perfil...</p>
            
            {isSlowLoading && (
              <p className="text-hot-orange/60 text-[10px] uppercase tracking-widest animate-pulse">
                Isso está demorando mais do que o esperado...
              </p>
            )}
            
            {/* Botão de segurança para destravar o fluxo se demorar demais */}
            <button 
              onClick={async () => {
                console.log('Forçando acesso ao painel...');
                const { data: { user } } = await supabase.auth.getUser();
                setLoading(false);
                setUserProfile({
                  id: user?.id || 'temp',
                  email: user?.email || '',
                  name: user?.email?.split('@')[0] || 'Usuário',
                  plan_status: 'none'
                });
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Forçar Acesso ao Painel
            </button>
          </div>
        </div>
      );
    }

    // Se o loading terminou e NÃO temos perfil, mostramos uma tela de erro amigável com botão de logout
    if (!userProfile && !loading) {
      const isRecursionError = localStorage.getItem('rls_recursion_detected') === 'true';

      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            <Flame className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isRecursionError ? 'Erro de Permissão no Banco' : 'Ops! Perfil não encontrado'}
          </h2>
          <p className="text-zinc-500 max-w-md mb-4">
            {isRecursionError 
              ? 'Detectamos um erro de "Recursão Infinita" nas regras do seu Supabase. Isso acontece quando as regras de segurança entram em loop. Por favor, execute o script SQL de correção no seu painel do Supabase.'
              : 'Houve um problema ao carregar seus dados. Isso pode acontecer se o seu cadastro ainda estiver sendo processado ou se houver um erro de permissão no banco de dados.'}
          </p>
          
          {fetchError && (
            <div className="mb-8 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-[10px] font-mono text-red-400/60 break-all uppercase tracking-tighter">
                Detalhes técnicos: {fetchError}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => {
                localStorage.removeItem('rls_recursion_detected');
                fetchRetryCount.current = 0;
                window.location.reload();
              }}
              className="px-6 py-4 bg-hot-orange text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium"
            >
              Sair e limpar sessão
            </button>
            <button 
              onClick={() => {
                if (confirm('Isso irá limpar todas as configurações (incluindo logo personalizada) e deslogar você. Deseja continuar?')) {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }
              }}
              className="text-[10px] text-zinc-600 hover:text-zinc-400 underline transition-colors"
            >
              Limpar cache total e reiniciar (Reseta configurações)
            </button>
          </div>
        </div>
      );
    }

    // Removida a obrigatoriedade de seleção de plano ao logar.
    // O usuário entra direto na plataforma como solicitado.
    if (selectedPlanId) {
      return <PlanSelection 
        initialPlanId={selectedPlanId} 
        onPlanSelected={() => {
          setSelectedPlanId(null);
          fetchProfile(userProfile.id, userProfile.email);
        }} 
      />;
    }
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
        <AdminDashboard 
          onBack={() => {
            setIsAdmin(false);
            setActiveSection('dashboard');
          }} 
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-[#080808] p-6 sticky top-0 h-screen">
        <Logo size="lg" className="mb-10" />

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${
                activeSection === item.id 
                ? 'bg-hot-orange/10 text-hot-orange border border-hot-orange/20 shadow-inner' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <button 
            onClick={() => {
              if (isAdmin) {
                setActiveSection('admin');
                window.dispatchEvent(new CustomEvent('switch-admin-tab', { detail: 'students' }));
              } else {
                setActiveSection('profile');
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeSection === 'profile' || activeSection === 'admin'
              ? 'bg-hot-orange/10 text-hot-orange border border-hot-orange/20 shadow-inner' 
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#080808] z-50 p-6 lg:hidden border-r border-white/5"
            >
              <div className="flex items-center justify-between mb-10">
                <Logo size="lg" />
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as Section);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${
                      activeSection === item.id 
                      ? 'bg-hot-orange/10 text-hot-orange border border-hot-orange/20' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
                <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
                  <button 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-zinc-400">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 w-80">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-zinc-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-hot-orange rounded-full border-2 border-[#050505]" />
            </button>
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-white/10">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold">{userProfile?.name || 'Usuário'}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {isAdmin || userProfile?.plan_status === 'admin' ? 'Administrador' : userProfile?.plan_status === 'active' ? 'Premium' : 'Membro'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                <img 
                  src={userProfile?.avatar_url || undefined || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.id}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-auto p-8 border-t border-white/5 text-center text-zinc-600 text-xs">
          <p>© 2026 HOT UNCUT. Todos os direitos reservados. Feito para criadores.</p>
        </footer>
      </main>
    </div>
  );
}
