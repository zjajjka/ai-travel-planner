import { Router } from 'express';
import { getApiKeys, getSupabaseClient } from '../utils/config';
import axios from 'axios';

export const travelRoutes = Router();

// 生成旅行计划
travelRoutes.post('/plan', async (req, res) => {
  try {
    const { destination, days, budget, travelers, preferences, userId } = req.body;
    const keys = getApiKeys();

    if (!keys.aliyun?.apiKey || !keys.aliyun?.apiSecret) {
      return res.status(400).json({ error: 'Aliyun API keys not configured' });
    }

    // 构建提示词
    const prompt = `作为专业的旅行规划师，请为以下需求制定详细的旅行计划：

目的地：${destination}
天数：${days}天
预算：${budget}元
同行人数：${travelers}人
偏好：${preferences || '无特殊偏好'}

请提供以下格式的详细计划（JSON格式）：
{
  "destination": "目的地",
  "days": 天数,
  "budget": 预算,
  "itinerary": [
    {
      "day": 第几天,
      "date": "日期",
      "activities": [
        {
          "time": "时间",
          "type": "景点/餐厅/住宿/交通",
          "name": "名称",
          "description": "描述",
          "location": "位置",
          "cost": 费用,
          "duration": "预计时长"
        }
      ],
      "totalCost": 当天总费用
    }
  ],
  "summary": {
    "totalCost": 总费用,
    "breakdown": {
      "transportation": 交通费用,
      "accommodation": 住宿费用,
      "food": 餐饮费用,
      "attractions": 景点费用,
      "other": 其他费用
    },
    "tips": ["实用建议1", "实用建议2"]
  }
}`;

    // 调用阿里云通义千问API
    const endpoint = keys.aliyun.endpoint || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    const response = await axios.post(
      endpoint,
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keys.aliyun.apiKey}`,
          'X-DashScope-SSE': 'disable',
        },
      }
    );

    let planData;
    try {
      const content = response.data.output?.choices?.[0]?.message?.content || response.data.output?.text || '';
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        // 如果无法解析JSON，创建一个基本结构
        planData = {
          destination,
          days,
          budget,
          itinerary: [],
          summary: {
            totalCost: 0,
            breakdown: {},
            tips: [],
          },
          rawContent: content,
        };
      }
    } catch (parseError) {
      // JSON解析失败，创建基本结构
      planData = {
        destination,
        days,
        budget,
        itinerary: [],
        summary: {
          totalCost: 0,
          breakdown: {},
          tips: [],
        },
        rawContent: response.data.output?.choices?.[0]?.message?.content || '无法解析AI响应',
      };
    }

    // 保存到Supabase
    let savedPlanId = null;
    if (userId) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('travel_plans')
          .insert({
            user_id: userId,
            destination,
            days,
            budget,
            travelers,
            preferences,
            plan_data: planData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving plan to database:', error);
        } else if (data) {
          savedPlanId = data.id;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    res.json({ success: true, plan: planData, planId: savedPlanId });
  } catch (error: any) {
    console.error('Travel plan error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate travel plan' });
  }
});

// 获取用户的所有旅行计划
travelRoutes.get('/plans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, plans: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个旅行计划
travelRoutes.get('/plan/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, plan: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除旅行计划
travelRoutes.delete('/plan/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('travel_plans').delete().eq('id', planId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取高德地图POI信息
travelRoutes.get('/poi', async (req, res) => {
  try {
    const { keyword, city, location } = req.query;
    const keys = getApiKeys();

    if (!keys.amap?.key) {
      return res.status(400).json({ error: 'Amap API key not configured' });
    }

    let url = `https://restapi.amap.com/v3/place/text?key=${keys.amap.key}&keywords=${encodeURIComponent(keyword as string)}`;

    if (city) {
      url += `&city=${encodeURIComponent(city as string)}`;
    }

    const response = await axios.get(url);
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取高德地图地理编码
travelRoutes.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    const keys = getApiKeys();

    if (!keys.amap?.key) {
      return res.status(400).json({ error: 'Amap API key not configured' });
    }

    const url = `https://restapi.amap.com/v3/geocode/geo?key=${keys.amap.key}&address=${encodeURIComponent(address as string)}`;
    const response = await axios.get(url);
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

