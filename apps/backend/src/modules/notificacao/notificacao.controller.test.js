const request = require('supertest');
const app = require('../../index');
const NotificacaoService = require('./notificacao.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./notificacao.service');

describe('NotificacaoController E2E', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('[GET] /api/notificacoes', async () => {
    NotificacaoService.listar.mockResolvedValue([]);
    const res = await request(app).get('/api/notificacoes').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[GET] /api/notificacoes/ativas', async () => {
    NotificacaoService.listarAtivas.mockResolvedValue([]);
    const res = await request(app).get('/api/notificacoes/ativas').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[GET] /api/notificacoes/usuario/:id', async () => {
    NotificacaoService.listarPorUsuario.mockResolvedValue([]);
    const res = await request(app).get('/api/notificacoes/usuario/1').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });

  it('[POST] /api/notificacoes', async () => {
    NotificacaoService.criar.mockResolvedValue({ id: 1 });
    const res = await request(app).post('/api/notificacoes').send({ id_usuario: 1, descricao: 'Teste', modulo: 'Teste' }).set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(201);
  });

  it('[PUT] /api/notificacoes/:id/confirmar', async () => {
    NotificacaoService.confirmar.mockResolvedValue(true);
    const res = await request(app).put('/api/notificacoes/1/confirmar').set('Authorization', `Bearer ${tokenAuth}`);
    expect(res.status).toBe(200);
  });
});
