from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Solicitacao, User

profissional_bp = Blueprint('profissional', __name__)

@profissional_bp.route('/fila', methods=['GET'])
@jwt_required()
def listar_fila():
    status_filtro = request.args.get('status')
    query = Solicitacao.query
    if status_filtro and status_filtro != 'Todos':
        query = query.filter_by(status=status_filtro)
    
    sols = query.all()
    resultado = []
    for s in sols:
        p = User.query.get(s.paciente_id)
        resultado.append({
            "id": s.id,
            "nome": p.nome,
            "cpf": p.identificacao,
            "especialidade": s.especialidade,
            "documentosAnexados": "2/2",
            "status": s.status
        })
    return jsonify(resultado), 200

@profissional_bp.route('/solicitacoes/<int:id>/qualificar', methods=['PUT'])
@jwt_required()
def qualificar(id):
    data = request.get_json()
    sol = Solicitacao.query.get_or_404(id)
    sol.status = data.get('status')
    sol.justificativa = data.get('justificativa')
    db.session.commit()
    return jsonify({"message": "Qualificação salva com sucesso"}), 200