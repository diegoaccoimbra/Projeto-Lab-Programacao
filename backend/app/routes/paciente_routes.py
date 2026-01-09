import os
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import db, Solicitacao, User, Documento
import datetime

paciente_bp = Blueprint('paciente', __name__)

# Busca no banco o histórico de solicitações do usuário logado
@paciente_bp.route('/minhas-solicitacoes', methods = ['GET'])
@jwt_required()
def listar_solicitacoes():
    user_id = get_jwt_identity()
    sols = Solicitacao.query.filter_by(paciente_id = user_id).order_by(Solicitacao.data_criacao.desc()).all()
    
    # Histórico de atualizações
    return jsonify([{
        "id": s.id,
        "especialidade": s.especialidade,
        "statusAtual": s.status,
        "data": s.data_criacao.strftime('%d/%m/%Y'),
        "historico": [
            {"data": s.data_criacao.strftime('%d/%m/%Y'), "mensagem": "Solicitação criada."},
            # Se houver justificativa, adicionamos como histórico
            *([{"data": datetime.datetime.now().strftime('%d/%m/%Y'), "mensagem": f"Atualização: {s.justificativa}"}] if s.justificativa else [])
        ]
    } for s in sols]), 200


# Para criar uma nova solicitação, um formulário com texto e arquivos é recebido
@paciente_bp.route('/nova-solicitacao', methods = ['POST'])
@jwt_required()
def nova_solicitacao():
    user_id = get_jwt_identity()
    
    # Pega os dados do formulário
    especialidade = request.form.get('especialidade')
    motivo = request.form.get('motivo')
    arquivos = request.files.getlist('arquivos')
    
    # Caso algo não seja preenchido, um aviso é enviado ao usuário
    if not especialidade or not motivo:
        return jsonify({"message": "Dados incompletos"}), 400

    # Cria o objeto Solicitacao
    try:
        nova_sol = Solicitacao(
            paciente_id = user_id,
            especialidade = especialidade,
            motivo = motivo,
            status = 'Pendente'
        )
        db.session.add(nova_sol)
        # Pega o ID que a solicitação recebeu no banco
        db.session.flush()

        # Salva os arquivos
        saved_files_count = 0
        for file in arquivos:
            if file and file.filename:
                filename = secure_filename(file.filename)
                # Cria nome único: ID_Solicitacao_NomeArquivo
                unique_filename = f"{nova_sol.id}_{int(datetime.datetime.now().timestamp())}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                
                file.save(file_path)
                
                novo_doc = Documento(
                    solicitacao_id = nova_sol.id,
                    nome_arquivo = filename,
                    caminho_arquivo = unique_filename
                )
                # Salva o documento no banco
                db.session.add(novo_doc)
                saved_files_count += 1
        
        # Salva as mudanças
        db.session.commit()
        return jsonify({"message": f"Solicitação criada com {saved_files_count} documentos!", "id": nova_sol.id}), 201
    
    except Exception as e:
        # Caso ocorra um erro, a solicitação não é criada no banco
        db.session.rollback()
        return jsonify({"message": f"Erro interno: {str(e)}"}), 500


# Para cadastrar novos usuários
@paciente_bp.route('/cadastro', methods = ['POST'])
def cadastro():
    data = request.get_json()
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt()
    
    # Verifica se o CPF do usuário já está cadastrado
    if User.query.filter_by(identificacao = data.get('identificacao')).first():
        return jsonify({"message": "CPF já cadastrado"}), 400
    
    # Cria o objeto User
    novo_usuario = User(
        nome = data.get('nome'),
        identificacao = data.get('identificacao'),
        perfil = 'Paciente',
        senha = bcrypt.generate_password_hash(data.get('senha')).decode('utf-8')
    )
    # Adiciona o usuário no banco
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({"message": "Usuário cadastrado com sucesso!"}), 201