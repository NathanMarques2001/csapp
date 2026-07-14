const { validate } = require('uuid');
const ResetSenhaService = require('./reset-senha.service');
const ResetSenhaRepository = require('./reset-senha.repository');
const AppError = require('../../utils/AppError');

jest.mock('./reset-senha.repository');
jest.mock('uuid');

describe('ResetSenhaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('solicitarReset', () => {
    it('[Success] Cria token caso e-mail pertença a um usuário existente', async () => {
      const mockUsuario = { id: 10, email: 'user@user.com' };
      const mockToken = { hash: 'abcd', id_usuario: 10 };

      ResetSenhaRepository.findUsuarioByEmail.mockResolvedValue(mockUsuario);
      ResetSenhaRepository.createResetToken.mockResolvedValue(mockToken);

      const result = await ResetSenhaService.solicitarReset('user@user.com');

      expect(ResetSenhaRepository.findUsuarioByEmail).toHaveBeenCalledWith('user@user.com');
      expect(ResetSenhaRepository.createResetToken).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockToken);
    });

    it('[Validation] Dispara 404 se email não estiver cadastrado', async () => {
      ResetSenhaRepository.findUsuarioByEmail.mockResolvedValue(null);

      await expect(ResetSenhaService.solicitarReset('ghost@mail.com')).rejects.toThrow(AppError);
    });
  });

  describe('resetarSenha', () => {
    it('[Validation] Dispara 400 se Hash enviado for formato inválido', async () => {
      validate.mockReturnValue(false); // UUID validate fail

      await expect(ResetSenhaService.resetarSenha('nothash', '123')).rejects.toThrow(AppError);
      expect(ResetSenhaRepository.findByHash).not.toHaveBeenCalled();
    });

    it('[Validation] Dispara 400 se o Hash já foi utilizado e recusa reuso', async () => {
      validate.mockReturnValue(true);
      ResetSenhaRepository.findByHash.mockResolvedValue({ used: true });

      await expect(ResetSenhaService.resetarSenha('hash', '123')).rejects.toHaveProperty('message', 'Hash já utilizado!');
    });

    it('[Edge Case] Deleta DB Node e dispara 400 se hash expirou', async () => {
      validate.mockReturnValue(true);
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      const mockResetNode = { expires_at: pastDate, used: false };
      
      ResetSenhaRepository.findByHash.mockResolvedValue(mockResetNode);

      await expect(ResetSenhaService.resetarSenha('hash', '123')).rejects.toHaveProperty('message', 'Hash expirado!');
      expect(ResetSenhaRepository.deleteToken).toHaveBeenCalledWith(mockResetNode);
      expect(ResetSenhaRepository.updateUsuarioSenha).not.toHaveBeenCalled();
    });

    it('[Success] Atualiza a senha e expurga o token usado', async () => {
      validate.mockReturnValue(true);
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      
      const mockResetNode = { expires_at: futureDate, used: false, id_usuario: 10 };
      const mockUsuario = { id: 10 };

      ResetSenhaRepository.findByHash.mockResolvedValue(mockResetNode);
      ResetSenhaRepository.findUsuarioById.mockResolvedValue(mockUsuario);

      await ResetSenhaService.resetarSenha('hash', 'novasenha');

      expect(ResetSenhaRepository.updateUsuarioSenha).toHaveBeenCalledWith(mockUsuario, 'novasenha');
      expect(ResetSenhaRepository.deleteToken).toHaveBeenCalledWith(mockResetNode);
    });
  });

  describe('limparTokensExpirados', () => {
    it('[Success] O CRON executa limpeza e retorna valor de sucesso', async () => {
      ResetSenhaRepository.removeExpiredTokens.mockResolvedValue(5);

      const result = await ResetSenhaService.limparTokensExpirados();
      expect(result).toBe(5);
    });
  });
});
