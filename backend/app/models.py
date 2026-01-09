from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Tabela dos usuários
class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    nome = db.Column(db.String(100), nullable = False)
    identificacao = db.Column(db.String(20), unique = True, nullable = False)
    senha = db.Column(db.String(200), nullable = False)
    perfil = db.Column(db.String(20), nullable = False) 

# Tabela de solicitações
class Solicitacao(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    especialidade = db.Column(db.String(100), nullable = False)
    motivo = db.Column(db.Text, nullable = False)
    unidade = db.Column(db.String(100))
    status = db.Column(db.String(50), default = 'Pendente')
    data_criacao = db.Column(db.DateTime, default = datetime.utcnow)
    justificativa = db.Column(db.Text) 
    
    # Relacionamento com Documentos
    documentos = db.relationship('Documento', backref='solicitacao', lazy = True)

# Tabela de documentos
class Documento(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    solicitacao_id = db.Column(db.Integer, db.ForeignKey('solicitacao.id'), nullable = False)
    nome_arquivo = db.Column(db.String(200), nullable = False)
    caminho_arquivo = db.Column(db.String(300), nullable = False)
    data_upload = db.Column(db.DateTime, default = datetime.utcnow)