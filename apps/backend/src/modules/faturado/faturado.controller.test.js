const request = require('supertest');
const app = require('../../index');
const FaturadoService = require('./faturado.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./faturado.service');

describe('FaturadoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/faturados retorna lista 200', async () => {
      FaturadoService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/faturados').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/faturados/:id retorna a entidade', async () => {
      FaturadoService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/faturados/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('faturado');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      FaturadoService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/faturados').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      FaturadoService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/faturados/1').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
