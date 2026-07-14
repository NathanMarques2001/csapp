const request = require('supertest');
const app = require('../../index');
const ResetSenhaService = require('./reset-senha.service');

jest.mock('./reset-senha.service');

describe('ResetSenhaController (Integration via Supertest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/reset-senha', () => {
    it('[Success] Processa solicitação de email criando token, retorna Http 201', async () => {
      ResetSenhaService.solicitarReset.mockResolvedValue({ id: 1, hash: 'new-hash' });

      const response = await request(app)
        .post('/api/reset-senha')
        .send({ email: 'test@reset.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'E-mail de recuperação de senha enviado com sucesso!');
      expect(response.body).toHaveProperty('resetSenha');
    });
  });

  describe('POST /api/reset-senha/reset', () => {
    it('[Success] Permite resetar e retorna HTTP 200 via payload { hash, senha }', async () => {
      ResetSenhaService.resetarSenha.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/reset-senha/reset')
        .send({ hash: 'real-hash', senha: '123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Senha alterada com sucesso!');
    });

    it('[Validation] Dispara HTTP 400 se ResetSenhaService barrar o Hash', async () => {
      const AppError = require('../../utils/AppError');
      ResetSenhaService.resetarSenha.mockRejectedValue(new AppError('Hash expirado!', 400));

      const response = await request(app)
        .post('/api/reset-senha/reset')
        .send({ hash: 'fake-hash', senha: '234' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Hash expirado!');
    });
  });

  describe('DELETE /api/reset-senha/expired', () => {
    it('[Success] Aciona webhook de limpezas e retorna 200 com message', async () => {
      ResetSenhaService.limparTokensExpirados.mockResolvedValue();

      const response = await request(app)
        .delete('/api/reset-senha/remove-expired-tokens');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Registros expirados apagados com sucesso!');
    });
  });
});
