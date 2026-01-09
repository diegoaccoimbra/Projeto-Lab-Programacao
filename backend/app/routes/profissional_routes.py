import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required
from app.models import db, Solicitacao, User, Documento

profissional_bp = Blueprint('profissional', __name__)

@profissional_bp.route('/fila', methods = ['GET'])
@jwt_required()
def listar_fila():
    status_filtro = request.args.get('status')
    especialidade_filtro = request.args.get('especialidade')

    query = Solicitacao.query

    # RF6: Filtros
    if status_filtro and status_filtro != 'Todos':
        query = query.filter_by(status=status_filtro)
    
    if especialidade_filtro and especialidade_filtro != 'Todas':
        query = query.filter_by(especialidade = especialidade_filtro)
    
    sols = query.all()
    resultado = []
    for s in sols:
        p = User.query.get(s.paciente_id)
        # Contar documentos
        qtd_docs = Documento.query.filter_by(solicitacao_id = s.id).count()
        
        resultado.append({
            "id": s.id,
            "nome": p.nome,
            "cpf": p.identificacao,
            "especialidade": s.especialidade,
            "documentosAnexados": f"{qtd_docs} anexos",
            "status": s.status
        })
    return jsonify(resultado), 200

# Rota para obter detalhes completos e links dos documentos
@profissional_bp.route('/solicitacoes/<int:id>', methods = ['GET'])
@jwt_required()
def detalhe_solicitacao(id):
    sol = Solicitacao.query.get_or_404(id)
    paciente = User.query.get(sol.paciente_id)
    docs = Documento.query.filter_by(solicitacao_id = sol.id).all()

    return jsonify({
        "id": sol.id,
        "paciente": paciente.nome,
        "especialidade": sol.especialidade,
        "status": sol.status,
        "documentos": [{
            "nome": d.nome_arquivo,
            "status": "OK", 
            # Link para o frontend baixar o arquivo
            "link": f"http://localhost:5000/api/profissional/documentos/{d.caminho_arquivo}"
        } for d in docs]
    }), 200

# Rota para servir o arquivo físico
@profissional_bp.route('/documentos/<filename>')
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@profissional_bp.route('/solicitacoes/<int:id>/qualificar', methods = ['PUT'])
@jwt_required()
def qualificar(id):
    data = request.get_json()
    sol = Solicitacao.query.get_or_404(id)
    sol.status = data.get('status')
    sol.justificativa = data.get('justificativa')
    db.session.commit()
    return jsonify({"message": "Qualificação salva com sucesso", "newStatus": sol.status}), 200