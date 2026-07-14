const request = require('supertest');
const app = require('../../index');
const UsuarioService = require('./usuario.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./usuario.service');

describe('UsuarioController (Integration via Supertest)', () => {
  let tokenAdmin;

  beforeAll(() => {
    tokenAdmin = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/usuarios/login', () => {
    it('[Success] Faz login e retorna Http 200 + dados e Token', async () => {
      UsuarioService.login.mockResolvedValue({
        usuario: { id: 1, email: 'admin@admin' },
        token: 'fake-token'
      });

      const response = await request(app)
        .post('/api/usuarios/login')
        .send({ email: 'admin@admin', senha: '123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'fake-token');
      expect(response.body.message).toBe('Usuário logado com sucesso!');
    });

    it('[Validation] Dispara Erro Http 400 se credenciais ausentes em UsuarioService', async () => {
      UsuarioService.login.mockRejectedValue(new Error('E-mail e senha são obrigatórios.'));

      const response = await request(app)
        .post('/api/usuarios/login')
        .send({ email: '', senha: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'E-mail e senha são obrigatórios.');
    });

    it('[Validation] Retorna 404 para usuário inexistente/senha errada', async () => {
      UsuarioService.login.mockRejectedValue(new Error('Conta não encontrada!'));

      const response = await request(app)
        .post('/api/usuarios/login')
        .send({ email: 'inexistente@admin.com', senha: '123' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Conta não encontrada!');
    });
  });

  describe('GET /api/usuarios', () => {
    it('[Success] Acessa listagem com Token Autenticado retornando Http 200', async () => {
      UsuarioService.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(response.status).toBe(200);
      expect(response.body.usuarios).toHaveLength(2);
    });

    it('[Validation] Nega o acesso (Http 401) sem Header de Authorization', async () => {
      const response = await request(app)
        .get('/api/usuarios');
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Nenhum token fornecido!');
    });
  });
});
