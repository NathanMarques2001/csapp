const request = require('supertest');
const app = require('../../index');
const FatosImportantesService = require('./fatos-importantes.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./fatos-importantes.service');

describe('FatosImportantesController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET Endpoints', () => {
    it('[Success] GET /api/fatos-importantes retorna lista 200', async () => {
      FatosImportantesService.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/fatos-importantes').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
    });

    it('[Success] GET /api/fatos-importantes/:id retorna a entidade', async () => {
      FatosImportantesService.findById.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/fatos-importantes/fato/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fatoImportante');
    });
  });

  describe('POST e PUT', () => {
    it('[Success] POST cria e retorna HTTP 201', async () => {
      FatosImportantesService.create.mockResolvedValue({ id: 2 });
      const res = await request(app).post('/api/fatos-importantes').set('Authorization', `Bearer ${tokenAuth}`).send({ id_cliente: 1, conteudo: 'Test' });
      expect(res.status).toBe(201);
    });

    it('[Success] PUT atualiza e dispara HTTP 200', async () => {
      FatosImportantesService.update.mockResolvedValue(true);
      const res = await request(app).put('/api/fatos-importantes/1').set('Authorization', `Bearer ${tokenAuth}`).send({ conteudo: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('com sucesso');
    });
  });
});
