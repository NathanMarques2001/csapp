const request = require('supertest');
const app = require('../../index');
const RelatorioService = require('./relatorio.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./relatorio.service');

describe('RelatorioController E2E', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[GET] /api/relatorios/geral retorna 200 com dados', async () => {
    RelatorioService.getRelatorioGeral.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/api/relatorios/geral').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('[GET] /api/relatorios/geral retorna 200 vazio', async () => {
    RelatorioService.getRelatorioGeral.mockResolvedValue([]);
    const res = await request(app).get('/api/relatorios/geral').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('[Auth] /api/relatorios/geral retorna 401 sem token', async () => {
    const res = await request(app).get('/api/relatorios/geral');
    expect(res.status).toBe(401);
  });
});
