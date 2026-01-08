from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from app.models import db, User, Solicitacao

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///qualifica_saude.db'
    app.config['JWT_SECRET_KEY'] = 'chave-secreta-projeto'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)
    JWTManager(app)
    bcrypt = Bcrypt(app)

    # Registro das Rotas
    from app.routes.auth_routes import auth_bp
    from app.routes.paciente_routes import paciente_bp
    from app.routes.profissional_routes import profissional_bp
    from app.routes.secretaria_routes import secretaria_bp

    app.register_blueprint(auth_bp, url_prefix = '/api/auth')
    app.register_blueprint(paciente_bp, url_prefix = '/api/paciente')
    app.register_blueprint(profissional_bp, url_prefix = '/api/profissional')
    app.register_blueprint(secretaria_bp, url_prefix = '/api/secretaria')

    with app.app_context():
        db.create_all()
        # Seed inicial
        if not User.query.filter_by(identificacao='999').first():
            h_paciente = bcrypt.generate_password_hash("paciente111").decode('utf-8')
            h_secretaria = bcrypt.generate_password_hash("secretaria123").decode('utf-8')
            h_medico = bcrypt.generate_password_hash("medico123").decode('utf-8')

            u1 = User(nome = "Camila Silva", identificacao = "111", perfil = "Paciente", senha = h_paciente)
            u2 = User(nome = "Ana Secretaria", identificacao = "999", perfil = "Secretaria", senha = h_secretaria)
            u3 = User(nome = "Dr. Alberto Medeiros", identificacao = "888", perfil = "Profissional", senha = h_medico)
            
            db.session.add_all([u1, u2, u3])
            db.session.commit()

            s1 = Solicitacao(paciente_id = u3.id, especialidade = "Cardiologia", motivo = "Dor no peito", unidade = "UBS Central", status = "Pendente")
            db.session.add(s1)
            db.session.commit()

    return app