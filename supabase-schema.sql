-- ============================================
-- 萌芽学堂 - Supabase 数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 用户表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT DEFAULT '萌芽小学员',
  avatar_emoji TEXT DEFAULT '🐣',
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  coins INT DEFAULT 100,
  streak_days INT DEFAULT 0,
  last_sign_in DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 学习进度表
CREATE TABLE IF NOT EXISTS lesson_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('pinyin', 'math', 'english', 'weiqi')),
  lesson_id TEXT NOT NULL,
  stars INT DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, subject, lesson_id)
);

-- 3. 签到记录表
CREATE TABLE IF NOT EXISTS sign_ins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sign_date DATE NOT NULL,
  streak_day INT NOT NULL,
  coins_earned INT NOT NULL,
  exp_earned INT NOT NULL,
  UNIQUE(user_id, sign_date)
);

-- 4. 每日任务表
CREATE TABLE IF NOT EXISTS daily_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_id TEXT NOT NULL,
  task_desc TEXT NOT NULL,
  subject TEXT NOT NULL,
  target INT NOT NULL,
  progress INT DEFAULT 0,
  done BOOLEAN DEFAULT FALSE,
  coins_reward INT NOT NULL,
  exp_reward INT NOT NULL,
  UNIQUE(user_id, task_date, task_id)
);

-- 5. 徽章表
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 6. 商城购买记录表
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_sign_ins_user_date ON sign_ins(user_id, sign_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);

-- ============================================
-- RLS (行级安全) 策略
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "progress_own" ON lesson_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "signins_own" ON sign_ins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_own" ON daily_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "badges_own" ON badges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "purchases_own" ON purchases FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 自动创建 profile 的触发器
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, avatar_emoji)
  VALUES (NEW.id, '萌芽小学员', '🐣')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
