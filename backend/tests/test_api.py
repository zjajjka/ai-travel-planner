import pytest
import json
from app import app, db
from models.user import User
from models.trip import Trip

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def auth_headers(client):
    # 创建测试用户
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    
    # 登录获取token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

def test_register(client):
    """测试用户注册"""
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'newpass'
    })
    
    assert response.status_code == 201
    assert 'access_token' in response.json

def test_login(client):
    """测试用户登录"""
    # 先注册用户
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass'
    })
    
    # 登录
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_create_trip(client, auth_headers):
    """测试创建旅行"""
    response = client.post('/api/trips/', 
        json={
            'title': '测试旅行',
            'destination': '北京',
            'start_date': '2024-01-01',
            'end_date': '2024-01-05',
            'budget': 5000,
            'travelers_count': 2
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    assert response.json['trip']['destination'] == '北京'

def test_get_trips(client, auth_headers):
    """测试获取旅行列表"""
    # 先创建一个旅行
    client.post('/api/trips/', 
        json={
            'title': '测试旅行',
            'destination': '北京',
            'start_date': '2024-01-01',
            'end_date': '2024-01-05',
            'budget': 5000,
            'travelers_count': 2
        },
        headers=auth_headers
    )
    
    # 获取旅行列表
    response = client.get('/api/trips/', headers=auth_headers)
    
    assert response.status_code == 200
    assert len(response.json['trips']) == 1

def test_add_expense(client, auth_headers):
    """测试添加费用"""
    # 先创建一个旅行
    trip_response = client.post('/api/trips/', 
        json={
            'title': '测试旅行',
            'destination': '北京',
            'start_date': '2024-01-01',
            'end_date': '2024-01-05',
            'budget': 5000,
            'travelers_count': 2
        },
        headers=auth_headers
    )
    
    trip_id = trip_response.json['trip']['id']
    
    # 添加费用
    response = client.post(f'/api/trips/{trip_id}/expenses',
        json={
            'category': 'food',
            'description': '午餐',
            'amount': 100,
            'date': '2024-01-01',
            'notes': '测试费用'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    assert response.json['expense']['amount'] == 100
