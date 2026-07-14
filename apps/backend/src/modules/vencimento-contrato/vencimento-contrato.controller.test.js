const request = require('supertest');
const app = require('../../index');
const VencimentoContratoService = require('./vencimento-contrato.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./vencimento-contrato.service');

describe('VencimentoContratoController E2E', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[GET] /api/vencimento-contratos retorn 200', async () => {
    VencimentoContratoService.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/vencimento-contratos').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[GET] /api/vencimento-contratos/hoje retorna 200', async () => {
    VencimentoContratoService.findToday.mockResolvedValue([]);
    const res = await request(app).get('/api/vencimento-contratos/hoje').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[GET] /api/vencimento-contratos/email-data/:id_contrato', async () => {
    VencimentoContratoService.getEmailData.mockResolvedValue({ usuario_nome: 'Teste' });
    const res = await request(app).get('/api/vencimento-contratos/email/1').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[POST] /api/vencimento-contratos', async () => {
    VencimentoContratoService.create.mockResolvedValue({ id: 1 });
    const res = await request(app).post('/api/vencimento-contratos').send({ id_contrato: 1 }).set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(201);
  });

  it('[PUT] /api/vencimento-contratos/:id', async () => {
    VencimentoContratoService.update.mockResolvedValue(true);
    const res = await request(app).put('/api/vencimento-contratos/1').send({ status: 'A' }).set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[DELETE] /api/vencimento-contratos/:id', async () => {
    VencimentoContratoService.delete.mockResolvedValue(true);
    const res = await request(app).delete('/api/vencimento-contratos/1').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(204);
  });
});
