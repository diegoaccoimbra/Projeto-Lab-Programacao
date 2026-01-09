from flask import Blueprint, request, jsonify
from app.models import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# Garante o acesso seguro ao sistema
@auth_bp.route('/login', methods = ['POST'])
def login():
    data = request.get_json()
    # Recebe a identificacao (cpf) do front
    user = User.query.filter_by(identificacao=data.get('identificacao')).first()
    
    # Verifica se o usuário existe e compara a senha digitada com a criptografada no banco
    if user and bcrypt.check_password_hash(user.senha, data.get('senha')):
        # Cria o token JWT de acesso
        token = create_access_token(identity = str(user.id))
        return jsonify({
            "token": token,
            "user": {"id": user.id, "nome": user.nome, "perfil": user.perfil}
        }), 200
    
    return jsonify({"message": "CPF ou senha incorretos"}), 401