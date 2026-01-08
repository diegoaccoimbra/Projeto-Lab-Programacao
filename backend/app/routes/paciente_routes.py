from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Solicitacao, User

paciente_bp = Blueprint('paciente', __name__)

# Listar todas as solicitações do paciente logado
@paciente_bp.route('/minhas-solicitacoes', methods=['GET'])
@jwt_required()
def listar_solicitacoes():
    user_id = get_jwt_identity()
    sols = Solicitacao.query.filter_by(paciente_id=user_id).order_by(Solicitacao.data_criacao.desc()).all()
    
    return jsonify([{
        "id": s.id,
        "especialidade": s.especialidade,
        "statusAtual": s.status,
        "data": s.data_criacao.strftime('%d/%m/%Y')
    } for s in sols]), 200

# Criar nova solicitação
@paciente_bp.route('/nova-solicitacao', methods=['POST'])
@jwt_required()
def nova_solicitacao():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    nova_sol = Solicitacao(
        paciente_id=user_id,
        especialidade=data.get('especialidade'),
        motivo=data.get('motivo'),
        unidade=data.get('unidade', 'UBS Central'),
        status='Pendente'
    )
    db.session.add(nova_sol)
    db.session.commit()
    return jsonify({"message": "Solicitação criada com sucesso!", "id": nova_sol.id}), 201

# Rota de Cadastro (Aberta - sem @jwt_required)
@paciente_bp.route('/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json()
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt()
    
    if User.query.filter_by(identificacao=data.get('identificacao')).first():
        return jsonify({"message": "CPF já cadastrado"}), 400
        
    novo_usuario = User(
        nome=data.get('nome'),
        identificacao=data.get('identificacao'),
        perfil='Paciente',
        senha=bcrypt.generate_password_hash(data.get('senha')).decode('utf-8')
    )
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({"message": "Usuário cadastrado com sucesso!"}), 201