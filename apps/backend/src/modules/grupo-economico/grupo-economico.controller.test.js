const request = require('supertest');
const app = require('../../index');
const GrupoEconomicoService = require('./grupo-economico.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./grupo-economico.service');

describe('GrupoEconomicoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET e POST', () => {
    it('[Success] GET /api/grupos-economicos retorna Lista HTTP 200', async () => {
      GrupoEconomicoService.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const res = await request(app).get('/api/grupos-economicos').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body.grupoEconomico).toHaveLength(2);
    });

    it('[Success] POST /api/grupos-economicos cria e retorna HTTP 201', async () => {
      GrupoEconomicoService.create.mockResolvedValue({ id: 5, nome: 'G1' });
      const res = await request(app).post('/api/grupos-economicos').set('Authorization', `Bearer ${tokenAuth}`).send({ nome: 'G1' });
      expect(res.status).toBe(201);
      expect(res.body.grupoEconomico).toHaveProperty('id', 5);
    });
  });

  describe('PUT /api/grupos-economicos/inactive/:id', () => {
    it('[Success] Inativa grupo cascateando via E2E status 200', async () => {
      GrupoEconomicoService.toggleEInativarCascata.mockResolvedValue(true);
      const res = await request(app).put('/api/grupos-economicos/active-inactive/1').set('Authorization', `Bearer ${tokenAuth}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('inativados com sucesso!');
    });
  });
});
