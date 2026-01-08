from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    identificacao = db.Column(db.String(20), unique=True, nullable=False) # CPF
    senha = db.Column(db.String(200), nullable=False)
    perfil = db.Column(db.String(20), nullable=False) # 'Paciente', 'Profissional', 'Secretaria'

class Solicitacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    especialidade = db.Column(db.String(100), nullable=False)
    motivo = db.Column(db.Text, nullable=False)
    unidade = db.Column(db.String(100))
    status = db.Column(db.String(50), default='Pendente')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    justificativa = db.Column(db.Text) # Usado pelo Profissional