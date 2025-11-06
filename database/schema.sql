-- 创建用户表（Supabase会自动创建auth.users表，这里我们只需要创建业务表）

-- 旅行计划表
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  days INTEGER NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  travelers INTEGER DEFAULT 1,
  preferences TEXT,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at DESC);

-- 启用行级安全策略
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的旅行计划
CREATE POLICY "Users can view their own travel plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能创建自己的旅行计划
CREATE POLICY "Users can insert their own travel plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的旅行计划
CREATE POLICY "Users can update their own travel plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的旅行计划
CREATE POLICY "Users can delete their own travel plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

