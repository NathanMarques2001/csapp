const request = require('supertest');
const app = require('../../index');
const ContratoService = require('./contrato.service');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

jest.mock('./contrato.service');

describe('ContratoController (Integration via Supertest)', () => {
  let tokenAuth;

  beforeAll(() => {
    tokenAuth = jwt.sign({ id: 1, tipo: 'admin' }, authConfig.secret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET Endpoints', () => {
    it('[Success] Acessa listagem getAll e dispara Http 200', async () => {
      ContratoService.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const response = await request(app)
        .get('/api/contratos')
        .set('Authorization', `Bearer ${tokenAuth}`);

      expect(response.status).toBe(200);
      expect(response.body.contratos).toHaveLength(2);
    });

    it('[Validation] Retorna 404 se vendedor não tiver contratos amarrados (indexVendedor)', async () => {
      ContratoService.findByUsuarioId.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/contratos/vendedor/99')
        .set('Authorization', `Bearer ${tokenAuth}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nenhum contrato cadastrado!');
    });
  });

  describe('POST /api/contratos e PUT /api/contratos', () => {
    it('[Success] Cria contrato, retorna 201 com possíveis avisos interceptados', async () => {
      ContratoService.create.mockResolvedValue({ contrato: { id: 5 }, aviso: 'Qtd anulada' });

      const response = await request(app)
        .post('/api/contratos')
        .set('Authorization', `Bearer ${tokenAuth}`)
        .send({ valor: 100 });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Qtd anulada');
    });

    it('[Success] Atualiza contrato repassando array de logs (alteracoes)', async () => {
      ContratoService.update.mockResolvedValue({ message: 'Contrato atualizado com sucesso!', aviso: null, alteracoes: ['valor_mensal: 10 -> 20'] });

      const response = await request(app)
        .put('/api/contratos/3')
        .set('Authorization', `Bearer ${tokenAuth}`)
        .send({ valor_mensal: 20 });

      expect(response.status).toBe(200);
      expect(response.body.alteracoes).toHaveLength(1);
    });
  });

  describe('POST /api/contratos/importar-excel', () => {
    it('[Validation] Rejeita 400 se não enviou multipart formData com arquivo validado req.file', async () => {
      const response = await request(app)
        .post('/api/contratos/importar-excel')
        .set('Authorization', `Bearer ${tokenAuth}`)
        .send({}); // Sem Buffer File anexado pelo multer

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Arquivo não enviado.');
    });

    it('[Success] Processa E2E simulando payload vindo do Buffer do Multer Upload Http 200', async () => {
      ContratoService.processarExcel.mockResolvedValue({
        erros: [],
        sucessos: [{ linha: 2, acao: 'Criado' }],
        avisos: []
      });

      // Aqui simulamos anexar arquivo (Express Multer injeta no req.file)
      const bufferFicticio = Buffer.from('abc');

      const response = await request(app)
        .post('/api/contratos/importar-excel')
        .set('Authorization', `Bearer ${tokenAuth}`)
        .attach('file', bufferFicticio, 'import-test.xlsx');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('com sucesso');
      expect(response.body.summary.sucesso).toBe(1);
    });

    it('[Edge Case] Envio de arquivo com falhas internas processadas mapeia Http 422 - Unprocessable', async () => {
      ContratoService.processarExcel.mockResolvedValue({
        erros: [{ linha: 3, motivo: 'CPF Inválido' }],
        sucessos: [],
        avisos: []
      });

      const bufferFicticio = Buffer.from('abc');
      const response = await request(app)
        .post('/api/contratos/importar-excel')
        .set('Authorization', `Bearer ${tokenAuth}`)
        .attach('file', bufferFicticio, 'import-errors.xlsx');

      expect(response.status).toBe(422); // A regra exige 422 para erros capturados pelo serviço.
      expect(response.body.summary.falhas).toBe(1);
    });
  });
});
