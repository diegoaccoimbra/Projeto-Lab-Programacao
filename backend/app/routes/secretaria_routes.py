from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from app.models import db, Solicitacao, User
import io
import csv
import datetime

secretaria_bp = Blueprint('secretaria', __name__)

# Importação de fila via arquivo CSV
@secretaria_bp.route('/importar', methods = ['POST'])
@jwt_required()
def importar_fila():
    if 'file' not in request.files:
        return jsonify({"message": "Nenhum arquivo enviado"}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"message": "Formato inválido. Use CSV."}), 400

    try:
        # O flask recebe o arquivo, lê os dados binários e os transforma em texto
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline = None)
        # Converte cada linha do csv em um dicionário Python
        csv_input = csv.DictReader(stream)
        
        count = 0
        for row in csv_input:
            # Verifica se o usuário já existe por meio do CPF
            cpf = row.get('CPF')
            user = User.query.filter_by(identificacao = cpf).first()
            
            if not user:
                # Cria um usuário temporário
                from flask_bcrypt import Bcrypt
                bcrypt = Bcrypt()
                user = User(
                    nome = row.get('Nome'), 
                    identificacao = cpf, 
                    perfil = 'Paciente', 
                    senha = bcrypt.generate_password_hash('mudar123').decode('utf-8')
                )
                db.session.add(user)
                db.session.flush()

            # Cria a solicitação
            sol = Solicitacao(
                paciente_id = user.id,
                especialidade = row.get('Especialidade'),
                motivo = row.get('Motivo', 'Importado da Secretaria'),
                unidade = row.get('Unidade', 'Central'),
                status = 'Pendente'
            )
            db.session.add(sol)
            count += 1

        # Salva as mudanças no banco    
        db.session.commit()
        return jsonify({"message": f"{count} pacientes importados com sucesso!"}), 201

    except Exception as e:
        return jsonify({"message": f"Erro na importação: {str(e)}"}), 500


# Rota pra visualizar a fila final
@secretaria_bp.route('/fila-final', methods = ['GET'])
@jwt_required()
def fila_final():
    # Filtra somente as solicitações que foram aprovadas
    sols = Solicitacao.query.filter_by(status = 'Aprovada').all()
    return jsonify([{
        "id": s.id,
        "nome": User.query.get(s.paciente_id).nome,
        "cpf": User.query.get(s.paciente_id).identificacao,
        "especialidade": s.especialidade,
        "dataAprovacao": datetime.datetime.now().strftime('%d/%m/%Y'),
        "profissional": "Dr. Alberto"
    } for s in sols]), 200


# Rota pra exportar a fila final
@secretaria_bp.route('/exportar', methods = ['GET'])
@jwt_required()
def exportar():
    # Exporta um CSV com a fila das solicitações aprovadas
    sols = Solicitacao.query.filter_by(status = 'Aprovada').all()
    
    # Gera o arquivo
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabeçalho do CSV
    writer.writerow(['ID', 'Paciente', 'CPF', 'Especialidade', 'Status'])
    
    # Preenchendo as linhas do arquivo
    for s in sols:
        p = User.query.get(s.paciente_id)
        writer.writerow([s.id, p.nome, p.identificacao, s.especialidade, s.status])
        
    output.seek(0)
    # Convertendo para Bytes para o send_file
    mem = io.BytesIO()
    mem.write(output.getvalue().encode('utf-8'))
    mem.seek(0)
    
    # Baixa o arquivo CSV
    return send_file(mem, mimetype="text/csv", as_attachment = True, download_name="fila_aprovados.csv")