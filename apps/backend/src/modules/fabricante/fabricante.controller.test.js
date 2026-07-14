const request = require('supertest');
const app = require('../../index');
const FabricanteService = require('./fabricante.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./fabricante.service');

describe('FabricanteController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/fabricantes retorna lista 200', async () => {
      FabricanteService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/fabricantes').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/fabricantes/:id retorna a entidade', async () => {
      FabricanteService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/fabricantes/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fabricante');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      FabricanteService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/fabricantes').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      FabricanteService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/fabricantes/1').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
