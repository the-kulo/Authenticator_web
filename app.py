from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pyotp
import time
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Database configuration
db_user = os.getenv('MYSQL_DB_USER')
db_raw_password = os.getenv('MYSQL_DB_PASSWORD')
db_host = os.getenv('MYSQL_DB_HOST')
db_port = os.getenv('MYSQL_DB_PORT')
db_name = os.getenv('MYSQL_DB_NAME')

db_password = quote_plus(db_raw_password)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{db_user}:{db_password}@"
    f"{db_host}:{db_port}/{db_name}?charset=utf8mb4"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

print(f"Database connection string: mysql+pymysql://{db_user}:***@{db_host}:{db_port}/{db_name}")

db = SQLAlchemy(app)

# Data models
class Authenticator(db.Model):
    __tablename__ = 'authenticators'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, comment='Name')
    email = db.Column(db.String(255), nullable=False, comment='Email')
    secret_key = db.Column(db.String(255), nullable=False, comment='Secret Key')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'secret_key': self.secret_key,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Routes
@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/authenticators', methods=['GET'])
def get_authenticators():
    """Get all authenticators and their TOTP codes"""
    try:
        authenticators = Authenticator.query.all()
        result = []
        
        # 获取当前服务器时间
        current_time = int(time.time())
        
        for auth in authenticators:
            try:
                # Generate TOTP verification code
                totp = pyotp.TOTP(auth.secret_key)
                current_code = totp.now()
                
                # Calculate remaining time
                remaining_time = 30 - (current_time % 30)
                
                result.append({
                    'id': auth.id,
                    'name': auth.name,
                    'email': auth.email,
                    'totp_code': current_code,
                    'remaining_time': remaining_time,
                    'server_time': current_time  # 添加服务器时间戳
                })
            except Exception as e:
                print(f"Failed to generate TOTP - ID: {auth.id}, Error: {e}")
                result.append({
                    'id': auth.id,
                    'name': auth.name,
                    'email': auth.email,
                    'totp_code': 'Error',
                    'remaining_time': 0,
                    'server_time': current_time
                })
        
        return jsonify({
            'success': True,
            'data': result,
            'server_time': current_time  # 全局服务器时间
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/authenticators', methods=['POST'])
def add_authenticator():
    """Add new authenticator"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'success': False, 'error': 'Name cannot be empty'}), 400
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email cannot be empty'}), 400
        if not data.get('secret_key'):
            return jsonify({'success': False, 'error': 'Secret key cannot be empty'}), 400
        
        # Validate secret key format
        try:
            pyotp.TOTP(data['secret_key']).now()
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid secret key format'}), 400
        
        # Create new record
        new_auth = Authenticator(
            name=data['name'],
            email=data['email'],
            secret_key=data['secret_key']
        )
        
        db.session.add(new_auth)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': new_auth.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/authenticators/<int:auth_id>', methods=['DELETE'])
def delete_authenticator(auth_id):
    """Delete authenticator"""
    try:
        auth = Authenticator.query.get_or_404(auth_id)
        db.session.delete(auth)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    CORS(app)
    app.run(debug=True, host='0.0.0.0', port=5000)