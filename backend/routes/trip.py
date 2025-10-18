from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip, TripDay, Activity, Expense, db
from datetime import datetime, date
import json
import logging

trip_bp = Blueprint('trips', __name__)
logger = logging.getLogger(__name__)

@trip_bp.route('/', methods=['GET'])
@jwt_required()
def get_trips():
    try:
        user_id = get_jwt_identity()
        trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).all()
        
        return jsonify({
            'trips': [trip.to_dict() for trip in trips]
        }), 200
        
    except Exception as e:
        logger.error(f"获取旅行列表错误: {str(e)}")
        return jsonify({'error': '获取旅行列表失败'}), 500

@trip_bp.route('/', methods=['POST'])
@jwt_required()
def create_trip():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['title', 'destination', 'start_date', 'end_date', 'budget']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填项'}), 400
        
        # 创建新旅行
        trip = Trip(
            user_id=user_id,
            title=data['title'],
            destination=data['destination'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            budget=float(data['budget']),
            travelers_count=data.get('travelers_count', 1),
            preferences=json.dumps(data.get('preferences', {}))
        )
        
        db.session.add(trip)
        db.session.commit()
        
        return jsonify({
            'message': '旅行创建成功',
            'trip': trip.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"创建旅行错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '创建旅行失败'}), 500

@trip_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        trip_dict = trip.to_dict()
        trip_dict['days'] = [day.to_dict() for day in trip.days]
        trip_dict['expenses'] = [expense.to_dict() for expense in trip.expenses]
        
        return jsonify({'trip': trip_dict}), 200
        
    except Exception as e:
        logger.error(f"获取旅行详情错误: {str(e)}")
        return jsonify({'error': '获取旅行详情失败'}), 500

@trip_bp.route('/<int:trip_id>', methods=['PUT'])
@jwt_required()
def update_trip(trip_id):
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        data = request.get_json()
        
        # 更新旅行信息
        if 'title' in data:
            trip.title = data['title']
        if 'destination' in data:
            trip.destination = data['destination']
        if 'start_date' in data:
            trip.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            trip.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'budget' in data:
            trip.budget = float(data['budget'])
        if 'travelers_count' in data:
            trip.travelers_count = data['travelers_count']
        if 'preferences' in data:
            trip.preferences = json.dumps(data['preferences'])
        if 'status' in data:
            trip.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': '旅行更新成功',
            'trip': trip.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"更新旅行错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '更新旅行失败'}), 500

@trip_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        db.session.delete(trip)
        db.session.commit()
        
        return jsonify({'message': '旅行删除成功'}), 200
        
    except Exception as e:
        logger.error(f"删除旅行错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '删除旅行失败'}), 500

@trip_bp.route('/<int:trip_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(trip_id):
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['category', 'description', 'amount', 'date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必填项'}), 400
        
        # 创建新支出
        expense = Expense(
            trip_id=trip_id,
            category=data['category'],
            description=data['description'],
            amount=float(data['amount']),
            currency=data.get('currency', 'CNY'),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            notes=data.get('notes', '')
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'message': '支出记录成功',
            'expense': expense.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"添加支出错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '添加支出失败'}), 500

@trip_bp.route('/<int:trip_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(trip_id):
    try:
        user_id = get_jwt_identity()
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
        if not trip:
            return jsonify({'error': '旅行不存在'}), 404
        
        expenses = Expense.query.filter_by(trip_id=trip_id).order_by(Expense.date.desc()).all()
        
        return jsonify({
            'expenses': [expense.to_dict() for expense in expenses]
        }), 200
        
    except Exception as e:
        logger.error(f"获取支出列表错误: {str(e)}")
        return jsonify({'error': '获取支出列表失败'}), 500
