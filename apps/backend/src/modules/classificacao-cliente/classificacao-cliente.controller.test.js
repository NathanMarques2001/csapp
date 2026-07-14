const request = require('supertest');
const app = require('../../index');
const ClassificacaoClienteService = require('./classificacao-cliente.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./classificacao-cliente.service');

describe('ClassificacaoClienteController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[Success] GET /api/classificacoes-clientes', async () => {
    ClassificacaoClienteService.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/api/classificacoes-clientes').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[Success] GET /api/classificacoes-clientes/:id', async () => {
    ClassificacaoClienteService.findById.mockResolvedValue({ id: 1 });
    const res = await request(app).get('/api/classificacoes-clientes/1').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('classificacao');
  });

  it('[Success] PUT /api/classificacoes-clientes/:id', async () => {
    ClassificacaoClienteService.update.mockResolvedValue(true);
    const res = await request(app).put('/api/classificacoes-clientes/1').set('Authorization', `Bearer ${tokenAuth}`).send({ valor: 10 });
    expect(res.status).toBe(200);
  });
});
