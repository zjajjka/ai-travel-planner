import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.getenv('ALIBABA_CLOUD_API_KEY')
        self.api_secret = os.getenv('ALIBABA_CLOUD_API_SECRET')
        self.base_url = "https://dashscope.aliyuncs.com/api/v1"
        
    def generate_trip_plan(self, destination: str, start_date: str, end_date: str, 
                          budget: float, travelers_count: int, preferences: Dict) -> Dict:
        """生成AI旅行规划"""
        try:
            # 计算旅行天数
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            days = (end_dt - start_dt).days + 1
            
            # 构建提示词
            prompt = self._build_trip_plan_prompt(
                destination, days, budget, travelers_count, preferences
            )
            
            # 调用阿里云百炼API
            response = self._call_dashscope_api(prompt)
            
            # 解析响应并生成结构化数据
            plan_data = self._parse_trip_plan_response(response, destination, start_date, days)
            
            return plan_data
            
        except Exception as e:
            logger.error(f"生成旅行规划错误: {str(e)}")
            # 返回默认规划作为备选
            return self._generate_default_plan(destination, start_date, days, budget, travelers_count)
    
    def analyze_expenses(self, trip) -> Dict:
        """分析旅行支出"""
        try:
            # 获取支出数据
            expenses = trip.expenses
            total_spent = sum(expense.amount for expense in expenses)
            budget_remaining = trip.budget - total_spent
            
            # 按类别统计支出
            category_stats = {}
            for expense in expenses:
                category = expense.category
                if category not in category_stats:
                    category_stats[category] = {'amount': 0, 'count': 0}
                category_stats[category]['amount'] += expense.amount
                category_stats[category]['count'] += 1
            
            # 生成分析报告
            analysis = {
                'total_budget': trip.budget,
                'total_spent': total_spent,
                'budget_remaining': budget_remaining,
                'budget_utilization': (total_spent / trip.budget * 100) if trip.budget > 0 else 0,
                'category_breakdown': category_stats,
                'daily_average': total_spent / max(1, len(trip.days)),
                'recommendations': self._generate_expense_recommendations(category_stats, budget_remaining)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"分析支出错误: {str(e)}")
            return {'error': '支出分析失败'}
    
    def suggest_optimization(self, trip) -> List[Dict]:
        """生成优化建议"""
        try:
            suggestions = []
            
            # 基于预算的建议
            if trip.budget > 0:
                suggestions.append({
                    'type': 'budget',
                    'title': '预算优化建议',
                    'description': '建议提前预订住宿和交通，通常可以获得更优惠的价格',
                    'priority': 'high'
                })
            
            # 基于偏好的建议
            preferences = json.loads(trip.preferences) if trip.preferences else {}
            if preferences.get('food'):
                suggestions.append({
                    'type': 'food',
                    'title': '美食体验建议',
                    'description': '建议尝试当地特色美食，可以提前查看餐厅评价和预订',
                    'priority': 'medium'
                })
            
            if preferences.get('culture'):
                suggestions.append({
                    'type': 'culture',
                    'title': '文化体验建议',
                    'description': '建议参观当地博物馆和文化景点，了解当地历史文化',
                    'priority': 'medium'
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"生成优化建议错误: {str(e)}")
            return []
    
    def _build_trip_plan_prompt(self, destination: str, days: int, budget: float, 
                               travelers_count: int, preferences: Dict) -> str:
        """构建旅行规划提示词"""
        prompt = f"""
        请为以下旅行需求生成详细的行程规划：
        
        目的地：{destination}
        旅行天数：{days}天
        预算：{budget}元
        同行人数：{travelers_count}人
        偏好：{json.dumps(preferences, ensure_ascii=False)}
        
        请生成包含以下内容的详细规划：
        1. 每日行程安排
        2. 推荐景点和活动
        3. 餐厅推荐
        4. 住宿建议
        5. 交通安排
        6. 费用估算
        
        请以JSON格式返回结果，包含day_plans数组，每个元素包含：
        - day_number: 天数
        - date: 日期
        - activities: 活动列表
        - meals: 餐饮安排
        - accommodation: 住宿信息
        - transportation: 交通安排
        - estimated_cost: 预估费用
        """
        return prompt
    
    def _call_dashscope_api(self, prompt: str) -> str:
        """调用阿里云百炼API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'qwen-turbo',
                'input': {
                    'messages': [
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ]
                },
                'parameters': {
                    'temperature': 0.7,
                    'max_tokens': 4000
                }
            }
            
            response = requests.post(
                f"{self.base_url}/services/aigc/text-generation/generation",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['output']['text']
            else:
                logger.error(f"API调用失败: {response.status_code}, {response.text}")
                return ""
                
        except Exception as e:
            logger.error(f"调用API错误: {str(e)}")
            return ""
    
    def _parse_trip_plan_response(self, response: str, destination: str, 
                                 start_date: str, days: int) -> Dict:
        """解析AI响应并生成结构化数据"""
        try:
            # 尝试解析JSON响应
            if response.strip().startswith('{'):
                plan_data = json.loads(response)
            else:
                # 如果不是JSON格式，生成默认规划
                plan_data = self._generate_default_plan(destination, start_date, days, 10000, 2)
            
            return plan_data
            
        except json.JSONDecodeError:
            logger.error("无法解析AI响应为JSON")
            return self._generate_default_plan(destination, start_date, days, 10000, 2)
    
    def _generate_default_plan(self, destination: str, start_date: str, 
                              days: int, budget: float, travelers_count: int) -> Dict:
        """生成默认旅行规划"""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        
        day_plans = []
        daily_budget = budget / days
        
        for i in range(days):
            current_date = start_dt + timedelta(days=i)
            day_plan = {
                'day_number': i + 1,
                'date': current_date.strftime('%Y-%m-%d'),
                'activities': [
                    {
                        'title': f'{destination}景点游览',
                        'time': '09:00-12:00',
                        'description': '参观当地著名景点',
                        'cost': daily_budget * 0.3
                    },
                    {
                        'title': '午餐',
                        'time': '12:00-13:00',
                        'description': '品尝当地美食',
                        'cost': daily_budget * 0.2
                    },
                    {
                        'title': '文化体验',
                        'time': '14:00-17:00',
                        'description': '体验当地文化',
                        'cost': daily_budget * 0.2
                    },
                    {
                        'title': '晚餐',
                        'time': '18:00-19:00',
                        'description': '享用晚餐',
                        'cost': daily_budget * 0.15
                    }
                ],
                'accommodation': {
                    'type': '酒店',
                    'cost': daily_budget * 0.15
                },
                'transportation': {
                    'type': '公共交通',
                    'cost': daily_budget * 0.1
                },
                'estimated_cost': daily_budget
            }
            day_plans.append(day_plan)
        
        return {
            'destination': destination,
            'total_days': days,
            'total_budget': budget,
            'travelers_count': travelers_count,
            'day_plans': day_plans,
            'summary': {
                'total_estimated_cost': budget,
                'average_daily_cost': daily_budget,
                'recommendations': [
                    '建议提前预订住宿和交通',
                    '可以尝试当地特色美食',
                    '注意天气变化，准备合适的衣物'
                ]
            }
        }
    
    def _generate_expense_recommendations(self, category_stats: Dict, 
                                        budget_remaining: float) -> List[str]:
        """生成支出建议"""
        recommendations = []
        
        if budget_remaining < 0:
            recommendations.append("支出已超出预算，建议控制后续消费")
        elif budget_remaining < 1000:
            recommendations.append("预算剩余较少，建议合理安排后续支出")
        
        # 基于支出类别给出建议
        if 'food' in category_stats and category_stats['food']['amount'] > 2000:
            recommendations.append("餐饮支出较高，可以考虑选择更经济的餐厅")
        
        if 'transport' in category_stats and category_stats['transport']['amount'] > 1500:
            recommendations.append("交通支出较高，建议使用公共交通或拼车")
        
        return recommendations
