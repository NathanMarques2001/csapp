const request = require('supertest');
const app = require('../../index');
const LogService = require('./log.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./log.service');

describe('LogController E2E', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[GET] /api/logs retorna todos os logs', async () => {
    LogService.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/api/logs').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logs');
  });

  it('[GET] /api/logs/:id_contrato retorna logs de contrato', async () => {
    LogService.findByContratoId.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/api/logs/1').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logs');
  });

  it('[POST] /api/logs cria um log', async () => {
    LogService.create.mockResolvedValue({ id: 1 });
    const res = await request(app)
      .post('/api/logs')
      .send({ nome_usuario: 'Admin', id_contrato: 1, alteracao: 'teste' })
      .set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(201);
    expect(res.body.message).toContain('com sucesso');
  });
});
