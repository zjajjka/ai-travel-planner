from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip, TripDay, Activity, db
from services.ai_service import AIService
from services.speech_service import SpeechService
import json
import logging

ai_bp = Blueprint('ai', __name__)
logger = logging.getLogger(__name__)

# 初始化AI服务
ai_service = AIService()
speech_service = SpeechService()

@ai_bp.route('/plan', methods=['POST'])
@jwt_required()
def generate_trip_plan():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['destination', 'start_date', 'end_date', 'budget', 'travelers_count']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填项'}), 400
        
        # 调用AI服务生成行程规划
        preferences = data.get('preferences', {})
        plan_result = ai_service.generate_trip_plan(
            destination=data['destination'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            budget=data['budget'],
            travelers_count=data['travelers_count'],
            preferences=preferences
        )
        
        return jsonify({
            'message': 'AI行程规划生成成功',
            'plan': plan_result
        }), 200
        
    except Exception as e:
        logger.error(f"AI行程规划错误: {str(e)}")
        return jsonify({'error': 'AI行程规划失败'}), 500

@ai_bp.route('/speech-to-text', methods=['POST'])
@jwt_required()
def speech_to_text():
    try:
        user_id = get_jwt_identity()
        
        # 检查是否有音频文件
        if 'audio' not in request.files:
            return jsonify({'error': '没有上传音频文件'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': '没有选择音频文件'}), 400
        
        # 调用语音识别服务
        text_result = speech_service.speech_to_text(audio_file)
        
        return jsonify({
            'message': '语音识别成功',
            'text': text_result
        }), 200
        
    except Exception as e:
        logger.error(f"语音识别错误: {str(e)}")
        return jsonify({'error': '语音识别失败'}), 500

@ai_bp.route('/text-to-speech', methods=['POST'])
@jwt_required()
def text_to_speech():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('text'):
            return jsonify({'error': '文本内容不能为空'}), 400
        
        # 调用语音合成服务
        audio_result = speech_service.text_to_speech(data['text'])
        
        return jsonify({
            'message': '语音合成成功',
            'audio_url': audio_result
        }), 200
        
    except Exception as e:
        logger.error(f"语音合成错误: {str(e)}")
        return jsonify({'error': '语音合成失败'}), 500

@ai_bp.route('/analyze-expense', methods=['POST'])
@jwt_required()
def analyze_expense():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('trip_id'):
            return jsonify({'error': '旅行ID不能为空'}), 400
        
        # 获取旅行信息
        trip = Trip.query.filter_by(id=data['trip_id'], user_id=user_id).first()
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        # 调用AI服务分析支出
        analysis_result = ai_service.analyze_expenses(trip)
        
        return jsonify({
            'message': '支出分析完成',
            'analysis': analysis_result
        }), 200
        
    except Exception as e:
        logger.error(f"支出分析错误: {str(e)}")
        return jsonify({'error': '支出分析失败'}), 500

@ai_bp.route('/suggest-optimization', methods=['POST'])
@jwt_required()
def suggest_optimization():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('trip_id'):
            return jsonify({'error': '旅行ID不能为空'}), 400
        
        # 获取旅行信息
        trip = Trip.query.filter_by(id=data['trip_id'], user_id=user_id).first()
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        # 调用AI服务生成优化建议
        suggestions = ai_service.suggest_optimization(trip)
        
        return jsonify({
            'message': '优化建议生成成功',
            'suggestions': suggestions
        }), 200
        
    except Exception as e:
        logger.error(f"生成优化建议错误: {str(e)}")
        return jsonify({'error': '生成优化建议失败'}), 500
