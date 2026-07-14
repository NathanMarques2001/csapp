const request = require('supertest');
const app = require('../../index');
const ProdutoService = require('./produto.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./produto.service');

describe('ProdutoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/produtos retorna lista 200', async () => {
      ProdutoService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/produtos').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/produtos/:id retorna a entidade', async () => {
      ProdutoService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/produtos/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('produto');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      ProdutoService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/produtos').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      ProdutoService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/produtos/1').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
