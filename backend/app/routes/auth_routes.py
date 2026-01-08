from flask import Blueprint, request, jsonify
from app.models import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Front envia 'identificacao'
    user = User.query.filter_by(identificacao=data.get('identificacao')).first()
    
    if user and bcrypt.check_password_hash(user.senha, data.get('senha')):
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": token,
            "user": {"id": user.id, "nome": user.nome, "perfil": user.perfil}
        }), 200
    
    return jsonify({"message": "CPF ou senha incorretos"}), 401