from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from app.models import Solicitacao, User
import io

secretaria_bp = Blueprint('secretaria', __name__)

@secretaria_bp.route('/fila-final', methods=['GET'])
@jwt_required()
def fila_final():
    # Retorna apenas aprovados
    sols = Solicitacao.query.filter_by(status='Aprovado').all()
    return jsonify([{
        "id": s.id,
        "nome": User.query.get(s.paciente_id).nome,
        "cpf": User.query.get(s.paciente_id).identificacao,
        "especialidade": s.especialidade,
        "dataAprovacao": "08/01/2026",
        "profissional": "Dr. Roberto Silva"
    } for s in sols]), 200

@secretaria_bp.route('/exportar', methods=['GET'])
@jwt_required()
def exportar():
    output = io.BytesIO()
    output.write(b"Nome,CPF,Especialidade,Status\nDiego,111,Cardiologia,Aprovado")
    output.seek(0)
    return send_file(output, mimetype="text/csv", as_attachment=True, download_name="fila.csv")