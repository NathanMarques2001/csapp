const request = require('supertest');
const app = require('../../index');
const SegmentoService = require('./segmento.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./segmento.service');

describe('SegmentoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/segmentos retorna lista 200', async () => {
      SegmentoService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/segmentos').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/segmentos/:id retorna a entidade', async () => {
      SegmentoService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/segmentos/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('segmento');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      SegmentoService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/segmentos').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      SegmentoService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/segmentos/1').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
