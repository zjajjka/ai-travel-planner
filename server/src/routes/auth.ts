import { Router } from 'express';
import { getSupabaseClient } from '../utils/config';

export const authRoutes = Router();

// 注册
authRoutes.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, user: data.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 登录
authRoutes.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ success: true, user: data.user, session: data.session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 登出
authRoutes.post('/signout', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前用户
authRoutes.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

