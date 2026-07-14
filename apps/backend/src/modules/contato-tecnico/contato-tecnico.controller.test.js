const request = require('supertest');
const app = require('../../index');
const ContatoTecnicoService = require('./contato-tecnico.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./contato-tecnico.service');

describe('ContatoTecnicoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/contatos-tecnicos retorna lista 200', async () => {
      ContatoTecnicoService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/contatos-tecnicos').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/contatos-tecnicos/:id retorna a entidade', async () => {
      ContatoTecnicoService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/contatos-tecnicos/contato/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('contatoTecnico');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      ContatoTecnicoService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/contatos-tecnicos').set('Authorization', `Bearer ${tokenAuth}`).send({ id_cliente: 1, conteudo: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      ContatoTecnicoService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/contatos-tecnicos/1').set('Authorization', `Bearer ${tokenAuth}`).send({ conteudo: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
