-- ==========================================
-- 1. LIMPEZA (Evita erros de "already exists")
-- ==========================================

-- Remover Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

-- Remover Políticas da tabela Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Remover Políticas de Favoritos e Customização
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can manage own custom prompts" ON public.user_custom_prompts;

-- Remover Políticas de Conteúdo Público
DROP POLICY IF EXISTS "Authenticated users can view prompts" ON public.prompts;
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.academy_modules;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.academy_lessons;
DROP POLICY IF EXISTS "Authenticated users can view tools" ON public.tools;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.tool_categories;
DROP POLICY IF EXISTS "Authenticated users can view prompt_categories" ON public.prompt_visual_categories;

-- Remover Políticas de Admin
DROP POLICY IF EXISTS "Admins can manage prompts" ON public.prompts;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.academy_modules;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.academy_lessons;
DROP POLICY IF EXISTS "Admins can manage tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.tool_categories;

-- ==========================================
-- 2. CRIAÇÃO DE TABELAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_status TEXT DEFAULT 'none',
  plan_type TEXT,
  phone TEXT,
  is_lifetime BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizar restrição de status para aceitar 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_status_check 
CHECK (plan_status IN ('active', 'trialing', 'canceled', 'none', 'admin'));

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Fácil', 'Médio', 'Difícil')),
  content TEXT NOT NULL,
  is_nsfw BOOLEAN DEFAULT false,
  preview_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academy_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.academy_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  file_url TEXT,
  file_name TEXT,
  image_url TEXT,
  duration TEXT,
  type TEXT CHECK (type IN ('video', 'file', 'image')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  link TEXT NOT NULL,
  category TEXT,
  is_hot BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prompt_visual_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

CREATE TABLE IF NOT EXISTS public.user_custom_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  custom_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- ==========================================
-- 3. FUNÇÕES (Definir antes das Políticas)
-- ==========================================

-- Função para verificar se é admin (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Buscamos o status diretamente na tabela profiles
  SELECT (plan_status = 'admin') INTO is_admin
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Fallback para os emails mestres
  IF is_admin IS NULL OR is_admin = false THEN
    RETURN (
      auth.jwt() ->> 'email' = 'admin@admin.com' OR 
      auth.jwt() ->> 'email' = 'lucasmarcilo7@gmail.com'
    );
  END IF;

  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_status TEXT;
BEGIN
  IF NEW.email = 'lucasmarcilo7@gmail.com' OR NEW.email = 'admin@admin.com' THEN
    initial_status := 'admin';
  ELSE
    initial_status := 'none';
  END IF;

  INSERT INTO public.profiles (id, email, name, avatar_url, plan_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
    initial_status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar data de modificação
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. SEGURANÇA (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_visual_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_prompts ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de Usuário
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR check_is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR check_is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own favorites" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custom prompts" ON public.user_custom_prompts FOR ALL USING (auth.uid() = user_id);

-- Criar Políticas de Leitura Pública
CREATE POLICY "Authenticated users can view prompts" ON public.prompts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view modules" ON public.academy_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view lessons" ON public.academy_lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view tools" ON public.tools FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view categories" ON public.tool_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view prompt_categories" ON public.prompt_visual_categories FOR SELECT USING (auth.role() = 'authenticated');

-- Criar Políticas de Admin
CREATE POLICY "Admins can manage prompts" ON public.prompts FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can manage modules" ON public.academy_modules FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can manage lessons" ON public.academy_lessons FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can manage tools" ON public.tools FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can manage categories" ON public.tool_categories FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can manage prompt_categories" ON public.prompt_visual_categories FOR ALL USING (check_is_admin()) WITH CHECK (check_is_admin());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (check_is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (check_is_admin());

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
