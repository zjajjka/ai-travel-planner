from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User, db
from werkzeug.security import generate_password_hash, check_password_hash
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 验证输入
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': '用户名、邮箱和密码都是必填项'}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': '用户名已存在'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': '邮箱已被注册'}), 400
        
        # 创建新用户
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # 生成访问令牌
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': '注册成功',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"注册错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '注册失败'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': '用户名和密码都是必填项'}), 400
        
        # 查找用户
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        # 生成访问令牌
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': '登录成功',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"登录错误: {str(e)}")
        return jsonify({'error': '登录失败'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        logger.error(f"获取用户信息错误: {str(e)}")
        return jsonify({'error': '获取用户信息失败'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        
        # 更新用户信息
        if 'email' in data:
            # 检查邮箱是否已被其他用户使用
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': '邮箱已被其他用户使用'}), 400
            user.email = data['email']
        
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': '用户信息更新成功',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"更新用户信息错误: {str(e)}")
        db.session.rollback()
        return jsonify({'error': '更新用户信息失败'}), 500
