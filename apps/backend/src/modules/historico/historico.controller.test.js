const request = require('supertest');
const app = require('../../index');
const HistoricoService = require('./historico.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./historico.service');

describe('HistoricoController E2E', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[GET] /api/historico/clientes?dataInicio=X&dataFim=Y', async () => {
    HistoricoService.buscarHistoricoClientes.mockResolvedValue([{ id: 1 }]);
    const res = await request(app)
      .get('/api/historico/clientes?dataInicio=2024-01-01&dataFim=2024-12-31')
      .set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[GET] /api/historico/contratos?dataInicio=X&dataFim=Y', async () => {
    HistoricoService.buscarHistoricoContratos.mockResolvedValue([{ id: 1 }]);
    const res = await request(app)
      .get('/api/historico/contratos?dataInicio=2024-01-01&dataFim=2024-12-31')
      .set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[POST] /api/historico/snapshot dispara snapshot manualmente', async () => {
    HistoricoService.gerarSnapshotDiario.mockResolvedValue();
    const res = await request(app)
      .post('/api/historico/snapshot')
      .set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Snapshot');
  });
});
