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
import { supabase } from './lib/supabase';

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
  const [isStuck, setIsStuck] = React.useState(false);
  const [configError, setConfigError] = React.useState(false);

  React.useEffect(() => {
    if (!supabase.auth) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    // Safety timeout: if still loading after 10s, show "stuck" UI
    const timer = setTimeout(() => {
      if (loading || (isLoggedIn && !userProfile)) {
        setIsStuck(true);
      }
    }, 10000);

    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [isLoggedIn, userProfile, loading]);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        if (retryCount < 3) {
          // Profile might not be created by trigger yet, retry after a short delay
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
          return;
        } else {
          // Fallback: Create profile if trigger failed or is missing
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0],
                plan_status: user.email === 'lucasmarcilo7@gmail.com' ? 'admin' : 'none',
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
              })
              .select()
              .single();
            
            if (newProfile) {
              setUserProfile(newProfile);
              setIsAdmin(newProfile.plan_status === 'admin');
            } else if (createError) {
              console.error('Error creating fallback profile:', createError);
            }
          }
        }
      }

      if (data) {
        setUserProfile(data);
        setIsAdmin(data.plan_status === 'admin');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
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
      case 'dashboard': return <Dashboard />;
      case 'prompts': return <PromptsSection isAdmin={isAdmin} />;
      case 'academy': return <SocialMediaSection isAdmin={isAdmin} />;
      case 'tools': return <ToolsSection isAdmin={isAdmin} />;
      case 'admin': return isAdmin ? <AdminDashboard /> : <Dashboard />;
      case 'profile': return <ProfileSection />;
      default: return <Dashboard />;
    }
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black">Erro de Configuração</h2>
        <p className="text-zinc-500 text-sm max-w-xs">
          As chaves do Supabase (URL ou Anon Key) estão faltando. 
          Por favor, configure as variáveis de ambiente no painel de configurações.
        </p>
      </div>
    );
  }

  if (loading || (isLoggedIn && !userProfile)) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 border-4 border-hot-orange border-t-transparent rounded-full animate-spin" />
        <div className="space-y-2">
          <p className="text-zinc-500 text-sm animate-pulse">Carregando seu perfil...</p>
          {isStuck && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-xs text-zinc-600 max-w-xs">
                Parece que o carregamento está demorando mais que o esperado. 
                Isso pode ser um problema de conexão ou configuração.
              </p>
              <button 
                onClick={() => {
                  supabase.auth.signOut();
                  window.location.reload();
                }}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
              >
                Sair e tentar novamente
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {showAuth ? (
          <AuthPage 
            onLogin={() => setIsLoggedIn(true)} 
            initialMode={authMode}
          />
        ) : (
          <LandingPage onGetStarted={handleGetStarted} />
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

  const isExpired = userProfile?.expires_at && new Date(userProfile.expires_at) < new Date();

  if (userProfile && (userProfile.plan_status === 'none' || isExpired) && !isAdmin) {
    return <PlanSelection onPlanSelected={() => fetchProfile(userProfile.id)} />;
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
            onClick={() => {
              setIsLoggedIn(false);
              setIsAdmin(false);
              setActiveSection('dashboard');
            }}
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
                  {isAdmin ? 'Administrador' : userProfile?.plan_status === 'active' ? 'Premium' : 'Membro'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                <img 
                  src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.id}`} 
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
